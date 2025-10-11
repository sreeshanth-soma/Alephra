import { Pinecone } from "@pinecone-database/pinecone";
import { indexName, namespace } from "@/app/config";

const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY ?? "",
});

export async function GET() {
    try {
        const index = pinecone.Index(indexName);
        
        // Get index stats
        const stats = await index.describeIndexStats();
        
        // Test a simple query to check connectivity
        const testQuery = {
            topK: 1,
            vector: new Array(1024).fill(0.1), // Dummy vector
            includeMetadata: false,
            includeValues: false
        };
        
        const testStart = Date.now();
        const testResult = await index.namespace(namespace).query(testQuery);
        const testTime = Date.now() - testStart;
        
        return new Response(JSON.stringify({
            status: "healthy",
            indexName,
            namespace,
            indexStats: {
                totalVectorCount: stats.totalVectorCount,
                dimension: stats.dimension,
                indexFullness: stats.indexFullness
            },
            connectivityTest: {
                success: true,
                responseTime: testTime,
                matchesFound: testResult.matches.length
            },
            timestamp: new Date().toISOString()
        }), {
            headers: { "Content-Type": "application/json" }
        });
        
    } catch (error: any) {
        console.error("Vector search status check failed:", error);
        
        return new Response(JSON.stringify({
            status: "error",
            error: error.message,
            indexName,
            namespace,
            timestamp: new Date().toISOString()
        }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
}
