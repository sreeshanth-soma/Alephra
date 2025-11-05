export const maxDuration = 60;
import { Pinecone } from "@pinecone-database/pinecone";
import { createAndStoreVectorEmbeddings } from "@/utils";

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// You can use either HF Inference API or your own GPU endpoint
// NOTE: Hugging Face has migrated inference traffic to the router host. Use the router URL by default
// Example router URL: https://router.huggingface.co/hf-inference/models/<model>
const DEEPSEEK_API_URL = process.env.DEEPSEEK_OCR_ENDPOINT || "https://router.huggingface.co/hf-inference/models/deepseek-ai/DeepSeek-OCR";
const API_KEY = process.env.DEEPSEEK_API_KEY || process.env.HF_TOKEN;

const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY ?? "",
});

async function queryDeepSeekOCR(binaryData: Buffer) {
    // HF Inference API expects binary image data
    const response = await fetch(DEEPSEEK_API_URL, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${API_KEY}`,
            "Content-Type": "image/jpeg",
        },
        body: new Uint8Array(binaryData), // Convert Buffer to Uint8Array for fetch
    });
    
    if (!response.ok) {
        const errorText = await response.text();
        console.error("HF API Error Response:", errorText);
        throw new Error(`HF API error: ${response.status} ${response.statusText} - ${errorText}`);
    }
    
    const result = await response.json();
    console.log("DeepSeek-OCR raw result:", result);
    return result;
}

export async function POST(req: Request) {
    try {
        const { base64 } = await req.json();
        
        // Convert base64 to binary buffer
        const base64Data = base64.split(',')[1];
        const binaryData = Buffer.from(base64Data, 'base64');
        
        console.log("Processing image with DeepSeek-OCR via Hugging Face API...");
        console.log("Image size:", binaryData.length, "bytes");
        
        // Call DeepSeek-OCR via HF Inference API
        const result = await queryDeepSeekOCR(binaryData);
        
        // Extract text from result
        // DeepSeek-OCR might return different formats
        let extractedText = '';
        if (typeof result === 'string') {
            extractedText = result;
        } else if (result.generated_text) {
            extractedText = result.generated_text;
        } else if (Array.isArray(result) && result[0]?.generated_text) {
            extractedText = result[0].generated_text;
        } else if (result.text) {
            extractedText = result.text;
        } else {
            console.warn("Unexpected result format:", result);
            extractedText = JSON.stringify(result);
        }
        
        console.log("Successfully extracted text with DeepSeek-OCR");
        
        // Generate unique report ID
        const reportId = `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        // Create and store vector embeddings
        console.log("Creating vector embeddings...");
        const vectorSuccess = await createAndStoreVectorEmbeddings(
            pinecone,
            'med-rag',
            'diagnosis2',
            extractedText || '',
            reportId
        );
        
        if (vectorSuccess) {
            console.log("Successfully created and stored vector embeddings");
        } else {
            console.warn("Failed to create vector embeddings, but text extraction succeeded");
        }
        
        return new Response(JSON.stringify({ 
            text: extractedText,
            reportId: reportId,
            vectorStored: vectorSuccess,
            isValidMedicalReport: true
        }), { 
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
        
    } catch (error: any) {
        console.error("Error in DeepSeek-OCR extraction:", error);
        
        let errorMessage = "An error occurred while processing your request with DeepSeek-OCR.";
        let statusCode = 500;
        
        if (error.message.includes("rate limit") || error.status === 429) {
            errorMessage = "API rate limit exceeded. Please try again in a few minutes.";
            statusCode = 429;
        } else if (error.message.includes("API key") || error.status === 401) {
            errorMessage = "Invalid Hugging Face API key. Please check your HF_TOKEN.";
            statusCode = 401;
        } else if (error.message.includes("Model") || error.message.includes("loading")) {
            errorMessage = "DeepSeek-OCR model is loading. Please try again in a minute.";
            statusCode = 503;
        }
        
        return new Response(JSON.stringify({ error: errorMessage }), {
            status: statusCode,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
