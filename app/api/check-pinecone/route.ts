import { Pinecone } from "@pinecone-database/pinecone";

const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY ?? "",
});

export async function GET() {
    try {
        const index = pinecone.Index('med-rag');
        
        // Get index stats
        const stats = await index.describeIndexStats();
        console.log("Index stats:", stats);
        
        // Try to query without namespace first
        const queryResponse = await index.query({
            topK: 10,
            vector: new Array(1024).fill(0.1), // Dummy vector
            includeMetadata: true,
            includeValues: false
        });
        
        console.log("Query without namespace:", queryResponse);
        
        // Try with namespace
        const queryResponseWithNamespace = await index.namespace("diagnosis2").query({
            topK: 10,
            vector: new Array(1024).fill(0.1), // Dummy vector
            includeMetadata: true,
            includeValues: false
        });
        
        console.log("Query with namespace:", queryResponseWithNamespace);
        
        return new Response(JSON.stringify({
            stats,
            queryWithoutNamespace: {
                matchCount: queryResponse.matches.length,
                matches: queryResponse.matches.map(m => ({
                    id: m.id,
                    score: m.score,
                    metadata: m.metadata
                }))
            },
            queryWithNamespace: {
                matchCount: queryResponseWithNamespace.matches.length,
                matches: queryResponseWithNamespace.matches.map(m => ({
                    id: m.id,
                    score: m.score,
                    metadata: m.metadata
                }))
            }
        }, null, 2), {
            headers: { 'Content-Type': 'application/json' }
        });
        
    } catch (error) {
        console.error("Error checking Pinecone:", error);
        return new Response(JSON.stringify({
            error: error instanceof Error ? error.message : "Unknown error"
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
