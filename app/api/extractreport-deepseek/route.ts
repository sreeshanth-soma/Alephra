export const maxDuration = 60;
import { Pinecone } from "@pinecone-database/pinecone";
import { createAndStoreVectorEmbeddings } from "@/utils";
import { HfInference } from '@huggingface/inference';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Use Hugging Face Inference SDK which automatically handles endpoint routing
// The SDK will use the correct endpoint (router.huggingface.co) automatically
const OCR_MODEL = process.env.DEEPSEEK_OCR_MODEL || "microsoft/trocr-base-printed";
const API_KEY = process.env.DEEPSEEK_API_KEY || process.env.HF_TOKEN;

const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY ?? "",
});

// Initialize HF Inference client with the new router endpoint
process.env.HF_INFERENCE_ENDPOINT = 'https://router.huggingface.co/hf-inference'
const hf = new HfInference(API_KEY);

async function queryDeepSeekOCR(binaryData: Buffer) {
    try {
        // Use the HfInference SDK's imageToText method
        // This automatically handles the correct endpoint routing
        // Convert Buffer to ArrayBuffer for the SDK (Node.js compatible)
        const arrayBuffer = binaryData.buffer.slice(
            binaryData.byteOffset,
            binaryData.byteOffset + binaryData.byteLength
        ) as ArrayBuffer;
        
        const result = await hf.imageToText({
            model: OCR_MODEL,
            data: arrayBuffer,
        });
        
        console.log("DeepSeek-OCR raw result:", result);
        return result;
    } catch (error: any) {
        console.error("HF Inference SDK Error:", error);
        throw error;
    }
}
export async function POST(req: Request) {
    // Deprecated: short-circuit and inform clients to use Gemini OCR
    console.log("Deprecated route /api/extractreport-deepseek called. Advise using /api/extractreportgemini instead.");
    return new Response(JSON.stringify({
        error: "DeepSeek OCR route is deprecated",
        message: "Please use /api/extractreportgemini for OCR/extraction. The DeepSeek route has been disabled to avoid runtime errors."
    }), {
        status: 501,
        headers: { 'Content-Type': 'application/json' }
    });
}
