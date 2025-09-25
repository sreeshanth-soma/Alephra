import { Pinecone } from "@pinecone-database/pinecone";
import { modelname, namespace, topK } from "./app/config";
import crypto from "crypto";
import { HfInference } from '@huggingface/inference'

const HF_TOKEN: string = process.env.HF_TOKEN ?? ""
const hf = new HfInference(HF_TOKEN)

// Local MCP embedding server client
const MCP_EMBED_HOST = process.env.MCP_EMBED_HOST || '127.0.0.1'
const MCP_EMBED_PORT = Number(process.env.MCP_EMBED_PORT || 8787)
const MCP_EMBED_URL = process.env.MCP_EMBED_URL || `http://${MCP_EMBED_HOST}:${MCP_EMBED_PORT}/embed`

// In-process memo cache (LRU-like with simple size cap)
const localEmbedCache = new Map<string, number[]>()
const LOCAL_CACHE_MAX = 1000

function cacheGet(key: string): number[] | undefined {
  const hit = localEmbedCache.get(key)
  if (!hit) return undefined
  // refresh order
  localEmbedCache.delete(key)
  localEmbedCache.set(key, hit)
  return hit
}

function cacheSet(key: string, vec: number[]) {
  if (localEmbedCache.has(key)) localEmbedCache.delete(key)
  // defend against non-number entries
  const clean = vec.map((x: any) => Number(x)).filter((x: number) => Number.isFinite(x))
  localEmbedCache.set(key, clean)
  if (localEmbedCache.size > LOCAL_CACHE_MAX) {
    const firstKey = localEmbedCache.keys().next().value
    if (typeof firstKey !== 'undefined') {
      localEmbedCache.delete(firstKey)
    }
  }
}

async function embedViaMCP(texts: string[], model: string): Promise<number[][]> {
  const body = JSON.stringify({ texts })
  const res = await fetch(MCP_EMBED_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body
  })
  if (!res.ok) throw new Error(`MCP server error ${res.status}`)
  const json = await res.json() as any
  if (!json.success) throw new Error(`MCP server failure: ${json.error || 'unknown'}`)
  const out = (json.embeddings as any[]).map((v: any) => Array.from(v).map((x: any) => Number(x)))
  return out
}

async function embedViaLocalTransformers(texts: string[], model: string): Promise<number[][]> {
  const mod = await import('@xenova/transformers')
  const pipe = await mod.pipeline('feature-extraction', model)
  const outputs: any = await pipe(texts, { pooling: 'mean', normalize: true })
  let arr = Array.isArray(outputs) ? outputs : [outputs]
  arr = arr.map((v: any) => {
    if (v && typeof v === 'object' && 'data' in v) return (v as any).data
    if (Array.isArray(v) && Array.isArray(v[0])) return v[0]
    return v
  })
  return arr.map((v: any) => Array.from(v).map((x: any) => Number(x)))
}

function hashText(text: string): string {
  // Stable SHA-256 hash for cache keys to avoid very large strings
  return crypto.createHash('sha256').update(text).digest('hex')
}

async function embedWithFallback(texts: string[], model: string): Promise<number[][]> {
  // serve from in-process cache if available
  const keys = texts.map(t => `${model}|${hashText(t)}`)
  const results: (number[]|undefined)[] = keys.map(k => cacheGet(k))
  const missingIdx: number[] = []
  for (let i = 0; i < results.length; i++) if (!results[i]) missingIdx.push(i)
  let computed: number[][] = []
  if (missingIdx.length > 0) {
    // Try MCP server first
    try {
      const payload = missingIdx.map(i => texts[i])
      const mcpVecs = await embedViaMCP(payload, model)
      computed = mcpVecs
    } catch (e) {
      // Fallback to local transformers
      try {
        const payload = missingIdx.map(i => texts[i])
        const localVecs = await embedViaLocalTransformers(payload, model)
        computed = localVecs
      } catch (e2) {
        // Final fallback: HuggingFace inference if configured
        if (!process.env.HF_TOKEN) throw e2
        const mxbOutputs = [] as number[][]
        for (const i of missingIdx) {
          const apiOutput: any = await hf.featureExtraction({ model, inputs: texts[i] })
          const vec = Array.from(apiOutput).map((x: any) => Number(x))
          mxbOutputs.push(vec)
        }
        computed = mxbOutputs
      }
    }

    // write back to cache
    for (let j = 0; j < missingIdx.length; j++) {
      const idx = missingIdx[j]
      const vec = computed[j]
      cacheSet(keys[idx], vec)
      results[idx] = vec
    }
  }
  return results as number[][]
}

function isValidVector(vec: number[] | undefined): boolean {
  if (!vec || !Array.isArray(vec)) return false
  if (vec.length < 8) return false
  for (let i = 0; i < Math.min(vec.length, 8); i++) {
    if (!Number.isFinite(vec[i])) return false
  }
  return true
}

async function sanitizeEmbeddings(texts: string[], model: string, vectors: number[][]): Promise<number[][]> {
  const invalidIdx: number[] = []
  for (let i = 0; i < vectors.length; i++) {
    if (!isValidVector(vectors[i])) invalidIdx.push(i)
  }
  if (invalidIdx.length === 0) return vectors
  // Recompute invalid indices using local transformers as authoritative fallback
  const payload = invalidIdx.map(i => texts[i])
  const recomputed = await embedViaLocalTransformers(payload, model)
  for (let j = 0; j < invalidIdx.length; j++) {
    const idx = invalidIdx[j]
    let v = recomputed[j]
    if (!isValidVector(v)) {
      throw new Error(`Embedding normalization failed for index ${idx}: invalid vector shape`)
    }
    vectors[idx] = v
  }
  return vectors
}

type QueryOptions = {
  reportId?: string
  topK?: number
  minScore?: number
}

export async function queryPineconeVectorStore(
  client: Pinecone,
  indexName: string,
  namespace: string,
  query: string,
  options: QueryOptions = {}
): Promise<string> {
  try {
    let [queryEmbedding] = await embedWithFallback([query], modelname)
    if (!isValidVector(queryEmbedding)) {
      [queryEmbedding] = await embedViaLocalTransformers([query], modelname)
    }
    // console.log("Querying database vector store...");
    const index = client.Index(indexName);
    const effectiveTopK = Math.max(1, Math.min(options.topK ?? 3, topK || 10))
    const pineconeQuery: any = {
      topK: effectiveTopK,
      vector: queryEmbedding as any,
      includeMetadata: true,
      includeValues: false
    }
    if (options.reportId) {
      pineconeQuery.filter = { reportId: options.reportId }
    }
    const queryResponse = await index.namespace(namespace).query(pineconeQuery);
    

    if (queryResponse.matches.length > 0) {
      const minScore = options.minScore ?? 0.8
      const filtered = queryResponse.matches
        .filter((m: any) => typeof m.score === 'number' ? m.score >= minScore : true)
        .slice(0, effectiveTopK)
      if (filtered.length === 0) return "<nomatches>"
      const concatenatedRetrievals = filtered
        .map((match: any, index: number) =>`\nClinical Finding ${index+1}: \n ${match.metadata?.chunk}`)
        .join(". \n\n");
      return concatenatedRetrievals;
    } else {
      return "<nomatches>";
    }
  } catch (error) {
    console.error("Error in queryPineconeVectorStore:", error);
    return "<nomatches>";
  }
}

export async function createAndStoreVectorEmbeddings(
  client: Pinecone,
  indexName: string,
  namespace: string,
  reportData: string,
  reportId: string
): Promise<boolean> {
  try {
    console.log("Creating vector embeddings for report:", reportId);
    
    // Split report into chunks for better retrieval
    const chunks = splitTextIntoChunks(reportData, 1000); // 1000 characters per chunk

    // Generate chunk-specific embeddings in batch via MCP server (with fallbacks)
    let embeddings = await embedWithFallback(chunks, modelname)
    embeddings = await sanitizeEmbeddings(chunks, modelname, embeddings)
    const dims = embeddings[0]?.length || 0
    console.log("Generated per-chunk embeddings:", { chunks: chunks.length, dims })
    
    const vectors = chunks.map((chunk, index) => ({
      id: `${reportId}_chunk_${index}`,
      values: embeddings[index] as number[],
      metadata: {
        chunk: chunk,
        reportId: reportId,
        chunkIndex: index,
        totalChunks: chunks.length,
        timestamp: new Date().toISOString()
      }
    }));
    
    console.log(`Storing ${vectors.length} vectors for report ${reportId}`);
    
    // Store vectors in Pinecone
    const index = client.Index(indexName);
    await index.namespace(namespace).upsert(vectors);
    
    console.log("Successfully stored vectors in Pinecone");
    return true;
    
  } catch (error) {
    console.error("Error creating and storing vector embeddings:", error);
    return false;
  }
}

function splitTextIntoChunks(text: string, chunkSize: number): string[] {
  const chunks: string[] = [];
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  let currentChunk = '';
  
  for (const sentence of sentences) {
    if (currentChunk.length + sentence.length > chunkSize && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      currentChunk = sentence.trim();
    } else {
      currentChunk += (currentChunk ? '. ' : '') + sentence.trim();
    }
  }
  
  if (currentChunk.trim().length > 0) {
    chunks.push(currentChunk.trim());
  }
  
  return chunks;
}

