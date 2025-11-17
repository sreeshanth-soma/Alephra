import { Pinecone } from "@pinecone-database/pinecone";
import { modelname, namespace, topK, indexDim } from "./app/config";
import crypto from "crypto";
import { HfInference } from '@huggingface/inference'

const HF_TOKEN: string = process.env.HF_TOKEN ?? ""
// Initialize HfInference - the SDK automatically uses the new router endpoint
// Set environment variable to ensure correct endpoint is used
process.env.HF_INFERENCE_ENDPOINT = 'https://router.huggingface.co/hf-inference'
const hf = new HfInference(HF_TOKEN)

// Local MCP embedding server client
const MCP_EMBED_HOST = process.env.MCP_EMBED_HOST || '127.0.0.1'
const MCP_EMBED_PORT = Number(process.env.MCP_EMBED_PORT || 8787)
const MCP_EMBED_URL = process.env.MCP_EMBED_URL || `http://${MCP_EMBED_HOST}:${MCP_EMBED_PORT}/embed`

// In-process memo cache (LRU-like with simple size cap)
const localEmbedCache = new Map<string, number[]>()
const LOCAL_CACHE_MAX = 1000

// Query result cache for vector search
const queryResultCache = new Map<string, string>()
const QUERY_CACHE_MAX = 100

// Voice-specific embedding cache for faster voice responses
const voiceEmbedCache = new Map<string, number[]>()
const VOICE_EMBED_CACHE_MAX = 200

// Pre-warm common voice queries for instant responses
const COMMON_VOICE_QUERIES = [
  "what is the diagnosis",
  "what does the report say",
  "what are the symptoms",
  "what medications are prescribed",
  "what is the treatment",
  "what are the test results",
  "what should I do",
  "is this serious",
  "what are the side effects",
  "when should I follow up"
];

// Pre-warm function (call this on server startup)
export async function preWarmVoiceCache() {
  console.log("Pre-warming voice cache with common queries...");
  try {
    const promises = COMMON_VOICE_QUERIES.map(async (query) => {
      try {
        await embedForVoice([query], modelname);
        console.log(`Pre-warmed: ${query}`);
      } catch (error) {
        console.log(`Failed to pre-warm: ${query}`, error);
      }
    });
    await Promise.allSettled(promises);
    console.log("Voice cache pre-warming completed");
  } catch (error) {
    console.error("Voice cache pre-warming failed:", error);
  }
}

function cacheGet(key: string): number[] | undefined {
  const hit = localEmbedCache.get(key)
  if (!hit) return undefined
  // refresh order
  localEmbedCache.delete(key)
  localEmbedCache.set(key, hit)
  return hit
}

function cacheSet(key: string, vec: number[] = []) {
  if (localEmbedCache.has(key)) localEmbedCache.delete(key)
  // defend against non-number entries
  const arr = Array.isArray(vec) ? vec : []
  const clean = arr.map((x: any) => Number(x)).filter((x: number) => Number.isFinite(x))
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

// Ultra-fast voice embedding function - skip MCP, go straight to HF API
async function embedForVoice(texts: string[], model: string): Promise<number[][]> {
  // Check voice-specific cache first
  const keys = texts.map(t => `voice|${model}|${hashText(t)}`)
  const results: (number[]|undefined)[] = keys.map(k => voiceEmbedCache.get(k))
  const missingIdx: number[] = []
  for (let i = 0; i < results.length; i++) if (!results[i]) missingIdx.push(i)
  
  let computed: number[][] = []
  if (missingIdx.length > 0) {
    // Prefer local MCP embedding server if configured and responsive (lower latency)
    let usedMCP = false
    if (process.env.MCP_EMBED_URL) {
      try {
        // Try MCP with a short timeout (2s) to avoid blocking on a slow/missing MCP
        const payload = missingIdx.map(i => texts[i])
        const mcpPromise = embedViaMCP(payload, model)
        const timeout = new Promise((_, rej) => setTimeout(() => rej(new Error('MCP timeout')), 2000))
        const mcpVecs = await Promise.race([mcpPromise, timeout]) as number[][]
        if (Array.isArray(mcpVecs) && mcpVecs.length > 0) {
          computed = mcpVecs
          usedMCP = true
          console.log(`Voice: Used MCP embedding server for ${missingIdx.length} embeddings`)
        }
      } catch (e: any) {
        console.log('MCP embedding attempt failed or timed out, falling back to HF API', (e && e.message) ? e.message : String(e))
      }
    }

    if (!usedMCP) {
      // Fallback to HF API if MCP wasn't used
      if (!process.env.HF_TOKEN) {
        throw new Error("HF_TOKEN required for voice embeddings")
      }
      console.log(`Voice: Generating ${missingIdx.length} embeddings via HF API`);
      const hfOutputs = [] as number[][]

      // Process all missing embeddings in parallel for maximum speed
      const promises = missingIdx.map(async (i) => {
        const apiOutput: any = await hf.featureExtraction({ model, inputs: texts[i] })
        return Array.from(apiOutput).map((x: any) => Number(x))
      })

      const parallelResults = await Promise.all(promises)
      computed = parallelResults
    }

    // Write back to voice cache
    for (let j = 0; j < missingIdx.length; j++) {
      const idx = missingIdx[j]
      const vec = Array.isArray(computed[j]) ? computed[j] : []
      if (voiceEmbedCache.size >= VOICE_EMBED_CACHE_MAX) {
        const firstKey = voiceEmbedCache.keys().next().value
        if (typeof firstKey !== 'undefined') {
          voiceEmbedCache.delete(firstKey)
        }
      }
      voiceEmbedCache.set(keys[idx], vec)
      results[idx] = vec
    }
  }
  return results as number[][]
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
      // On Vercel, skip local transformers to avoid /vercel cache writes
      const runningOnVercel = Boolean(process.env.VERCEL)
      if (!runningOnVercel) {
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
      } else {
        // Vercel path: go straight to HF fallback to avoid local cache
        if (!process.env.HF_TOKEN) throw e
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
      const vec = Array.isArray(computed[j]) ? computed[j] : []
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

// Voice-optimized vector search function
export async function queryPineconeVectorStoreForVoice(
  client: Pinecone,
  indexName: string,
  namespace: string,
  query: string,
  options: QueryOptions = {}
): Promise<string> {
  try {
    // Check cache first
    const cacheKey = `voice|${namespace}|${query.substring(0, 200)}|${options.topK || 3}|${options.minScore || 0.7}`;
    const cachedResult = queryResultCache.get(cacheKey);
    if (cachedResult) {
      console.log("Returning cached voice vector search result");
      return cachedResult;
    }

    console.log("Starting voice vector search for query:", query.substring(0, 100) + "...");
    
    // Generate embedding with voice-optimized function
    const embeddingStart = Date.now();
    let [queryEmbedding] = await embedForVoice([query], modelname)
    if (!isValidVector(queryEmbedding)) {
      console.log("Voice embedding failed, trying fallback...");
      [queryEmbedding] = await embedViaLocalTransformers([query], modelname)
    }
    const embeddingTime = Date.now() - embeddingStart;
    console.log(`Voice embedding generated in ${embeddingTime}ms`);
    
    if (!isValidVector(queryEmbedding)) {
      console.error("Failed to generate valid voice embedding");
      return "<nomatches>";
    }

    // Query Pinecone with optimized parameters for voice
    const index = client.Index(indexName);
    const effectiveTopK = Math.max(1, Math.min(options.topK ?? 3, 5)) // Limit to 3 for voice
    const pineconeQuery: any = {
      topK: effectiveTopK,
      vector: queryEmbedding as any,
      includeMetadata: true,
      includeValues: false
    }
    if (options.reportId) {
      pineconeQuery.filter = { reportId: options.reportId }
    }
    
    const queryStart = Date.now();
    const queryResponse = await index.namespace(namespace).query(pineconeQuery);
    const queryTime = Date.now() - queryStart;
    console.log(`Voice Pinecone query completed in ${queryTime}ms, found ${queryResponse.matches.length} matches`);

    if (queryResponse.matches.length > 0) {
      const minScore = options.minScore ?? 0.7
      const filtered = queryResponse.matches
        .filter((m: any) => {
          const score = typeof m.score === 'number' ? m.score : 0;
          return score >= minScore;
        })
        .slice(0, effectiveTopK)
      
      console.log(`Voice filtered to ${filtered.length} matches above threshold ${minScore}`);
      
      if (filtered.length === 0) {
        console.log("No voice matches above score threshold");
        return "<nomatches>";
      }
      
      const concatenatedRetrievals = filtered
        .map((match: any, index: number) => {
          const score = typeof match.score === 'number' ? match.score.toFixed(3) : 'N/A';
          return `\nClinical Finding ${index+1} (Score: ${score}): \n ${match.metadata?.chunk}`;
        })
        .join(". \n\n");
      
      console.log(`Voice returning ${concatenatedRetrievals.length} characters of retrieved content`);
      
      // Cache the result
      if (queryResultCache.size >= QUERY_CACHE_MAX) {
        const firstKey = queryResultCache.keys().next().value;
        if (typeof firstKey !== 'undefined') {
          queryResultCache.delete(firstKey);
        }
      }
      queryResultCache.set(cacheKey, concatenatedRetrievals);
      
      return concatenatedRetrievals;
    } else {
      console.log("No voice matches found in Pinecone");
      const noMatchesResult = "<nomatches>";
      
      // Cache the no matches result too
      if (queryResultCache.size >= QUERY_CACHE_MAX) {
        const firstKey = queryResultCache.keys().next().value;
        if (typeof firstKey !== 'undefined') {
          queryResultCache.delete(firstKey);
        }
      }
      queryResultCache.set(cacheKey, noMatchesResult);
      
      return noMatchesResult;
    }
  } catch (error) {
    console.error("Error in voice vector search:", error);
    return "<nomatches>";
  }
}

export async function queryPineconeVectorStore(
  client: Pinecone,
  indexName: string,
  namespace: string,
  query: string,
  options: QueryOptions = {}
): Promise<string> {
  try {
    // Check cache first
    const cacheKey = `${namespace}|${query.substring(0, 200)}|${options.topK || 5}|${options.minScore || 0.7}`;
    const cachedResult = queryResultCache.get(cacheKey);
    if (cachedResult) {
      console.log("Returning cached vector search result");
      return cachedResult;
    }

    console.log("Starting vector search for query:", query.substring(0, 100) + "...");
    
    // Generate embedding with timeout
    const embeddingStart = Date.now();
    let [queryEmbedding] = await embedWithFallback([query], modelname)
    if (!isValidVector(queryEmbedding)) {
      console.log("Primary embedding failed, trying fallback...");
      [queryEmbedding] = await embedViaLocalTransformers([query], modelname)
    }
    const embeddingTime = Date.now() - embeddingStart;
    console.log(`Embedding generated in ${embeddingTime}ms`);
    
    if (!isValidVector(queryEmbedding)) {
      console.error("Failed to generate valid embedding");
      return "<nomatches>";
    }

    // Query Pinecone with optimized parameters
    const index = client.Index(indexName);
    const effectiveTopK = Math.max(1, Math.min(options.topK ?? 5, topK || 10))
    const pineconeQuery: any = {
      topK: effectiveTopK,
      vector: queryEmbedding as any,
      includeMetadata: true,
      includeValues: false
    }
    if (options.reportId) {
      pineconeQuery.filter = { reportId: options.reportId }
    }
    
    const queryStart = Date.now();
    const queryResponse = await index.namespace(namespace).query(pineconeQuery);
    const queryTime = Date.now() - queryStart;
    console.log(`Pinecone query completed in ${queryTime}ms, found ${queryResponse.matches.length} matches`);

    if (queryResponse.matches.length > 0) {
      const minScore = options.minScore ?? 0.7 // Lowered from 0.8 to get more results
      const filtered = queryResponse.matches
        .filter((m: any) => {
          const score = typeof m.score === 'number' ? m.score : 0;
          console.log(`Match score: ${score.toFixed(3)}`);
          return score >= minScore;
        })
        .slice(0, effectiveTopK)
      
      console.log(`Filtered to ${filtered.length} matches above threshold ${minScore}`);
      
      if (filtered.length === 0) {
        console.log("No matches above score threshold");
        return "<nomatches>";
      }
      
      const concatenatedRetrievals = filtered
        .map((match: any, index: number) => {
          const score = typeof match.score === 'number' ? match.score.toFixed(3) : 'N/A';
          return `\nClinical Finding ${index+1} (Score: ${score}): \n ${match.metadata?.chunk}`;
        })
        .join(". \n\n");
      
      console.log(`Returning ${concatenatedRetrievals.length} characters of retrieved content`);
      
      // Cache the result
      if (queryResultCache.size >= QUERY_CACHE_MAX) {
        const firstKey = queryResultCache.keys().next().value;
        if (typeof firstKey !== 'undefined') {
          queryResultCache.delete(firstKey);
        }
      }
      queryResultCache.set(cacheKey, concatenatedRetrievals);
      
      return concatenatedRetrievals;
    } else {
      console.log("No matches found in Pinecone");
      const noMatchesResult = "<nomatches>";
      
      // Cache the no matches result too
      if (queryResultCache.size >= QUERY_CACHE_MAX) {
        const firstKey = queryResultCache.keys().next().value;
        if (typeof firstKey !== 'undefined') {
          queryResultCache.delete(firstKey);
        }
      }
      queryResultCache.set(cacheKey, noMatchesResult);
      
      return noMatchesResult;
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
    if (!Array.isArray(chunks) || chunks.length === 0) {
      console.warn("No content to embed - skipping vector storage");
      return false;
    }

    // Generate chunk-specific embeddings in batch via MCP server (with fallbacks)
    let embeddings = await embedWithFallback(chunks, modelname)
    embeddings = await sanitizeEmbeddings(chunks, modelname, embeddings)
    const dims = embeddings[0]?.length || 0
    console.log("Generated per-chunk embeddings:", { chunks: chunks.length, dims })
    if (dims !== indexDim) {
      console.warn(`Embedding dimension ${dims} does not match Pinecone index dimension ${indexDim}. Normalizing shape...`)
      // Simple pad/trim to match index dimension
      const fixLength = (v: number[]): number[] => {
        if (!Array.isArray(v)) return new Array(indexDim).fill(0)
        if (v.length === indexDim) return v
        if (v.length > indexDim) return v.slice(0, indexDim)
        return [...v, ...new Array(indexDim - v.length).fill(0)]
      }
      embeddings = embeddings.map(fixLength)
    }
    
    const vectors = chunks.map((chunk, index) => ({
      id: `${reportId}_chunk_${index}`,
      values: Array.isArray(embeddings[index]) ? (embeddings[index] as number[]) : new Array(indexDim).fill(0),
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

