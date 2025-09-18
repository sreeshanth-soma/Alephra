export async function GET() {
    return new Response(JSON.stringify({
        geminiKeyExists: !!process.env.GEMINI_API_KEY,
        pineconeKeyExists: !!process.env.PINECONE_API_KEY,
        hfTokenExists: !!process.env.HF_TOKEN,
        geminiKeyLength: process.env.GEMINI_API_KEY?.length || 0,
        pineconeKeyLength: process.env.PINECONE_API_KEY?.length || 0,
        hfTokenLength: process.env.HF_TOKEN?.length || 0,
    }), {
        headers: { 'Content-Type': 'application/json' }
    });
}
