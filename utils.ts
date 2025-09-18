import { Pinecone } from "@pinecone-database/pinecone";
import { FeatureExtractionPipeline, pipeline } from "@xenova/transformers";
import { modelname, namespace, topK } from "./app/config";
import { HfInference } from '@huggingface/inference'

const hf = new HfInference(process.env.HF_TOKEN)

export async function queryPineconeVectorStore(
  client: Pinecone,
  indexName: string,
  namespace: string,
  query: string
): Promise<string> {
  try {
    const apiOutput = await hf.featureExtraction({
      model: "mixedbread-ai/mxbai-embed-large-v1",
      inputs: query,
    });
    console.log(apiOutput);
    
    const queryEmbedding = Array.from(apiOutput);
    // console.log("Querying database vector store...");
    const index = client.Index(indexName);
    const queryResponse = await index.namespace(namespace).query({
      topK: 5,
      vector: queryEmbedding as any,
      includeMetadata: true,
      // includeValues: true,
      includeValues: false
    });

    console.log(queryResponse);
    

    if (queryResponse.matches.length > 0) {
      const concatenatedRetrievals = queryResponse.matches
        .map((match,index) =>`\nClinical Finding ${index+1}: \n ${match.metadata?.chunk}`)
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
    
    // Generate embeddings using Hugging Face
    const apiOutput = await hf.featureExtraction({
      model: "mixedbread-ai/mxbai-embed-large-v1",
      inputs: reportData,
    });
    
    const embedding = Array.from(apiOutput);
    console.log("Generated embedding with dimensions:", embedding.length);
    
    // Split report into chunks for better retrieval
    const chunks = splitTextIntoChunks(reportData, 1000); // 1000 characters per chunk
    
    const vectors = chunks.map((chunk, index) => ({
      id: `${reportId}_chunk_${index}`,
      values: embedding as number[],
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

