import { GoogleGenerativeAI } from "@google/generative-ai";
export const maxDuration = 60;
import { Pinecone } from "@pinecone-database/pinecone";
import { createAndStoreVectorEmbeddings } from "@/utils";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash-8b',
});

const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY ?? "",
});

const prompt = `Attached is an image of a clinical report. 
Go over the the clinical report and identify biomarkers that show slight or large abnormalities. Then summarize in 100 words. You may increase the word limit if the report has multiple pages. Do not output patient name, date etc. Make sure to include numerical values and key details from the report, including report title.
## Summary: `;

// Simple concurrency limiter to avoid thundering herd
let inFlight = 0;
const MAX_CONCURRENT = 1;
const waitForSlot = async () => {
    while (inFlight >= MAX_CONCURRENT) {
        await new Promise(r => setTimeout(r, 50));
    }
};

async function generateContentWithRetry(filePart: any, maxRetries = 3) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            await waitForSlot();
            inFlight++;
            const generatedContent = await model.generateContent([prompt, filePart]);
            return generatedContent.response.candidates![0].content.parts[0].text;
        } catch (error: any) {
            console.error(`Attempt ${attempt} failed:`, error);
            
            // Check if it's a rate limit error
            if (error.status === 429) {
                if (attempt === maxRetries) {
                    throw new Error("API rate limit exceeded. Please try again later or upgrade your API plan.");
                }
                // Jittered exponential backoff to avoid synchronized retries
                const base = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
                const jitter = Math.floor(Math.random() * 400);
                const delay = base + jitter;
                await new Promise(resolve => setTimeout(resolve, delay));
                continue;
            }
            
            // For other errors, throw immediately
            throw error;
        } finally {
            inFlight = Math.max(0, inFlight - 1);
        }
    }
}

export async function POST(req: Request) {
    try {
        const { base64 } = await req.json();
        const filePart = fileToGenerativePart(base64);

        console.log("Processing image with Gemini API...");
        const textResponse = await generateContentWithRetry(filePart);

        console.log("Successfully generated content");
        
        // Generate unique report ID
        const reportId = `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        // Create and store vector embeddings
        console.log("Creating vector embeddings...");
        const vectorSuccess = await createAndStoreVectorEmbeddings(
            pinecone,
            'med-rag', // index name
            'diagnosis2', // namespace
            textResponse || '',
            reportId
        );
        
        if (vectorSuccess) {
            console.log("Successfully created and stored vector embeddings");
        } else {
            console.warn("Failed to create vector embeddings, but text extraction succeeded");
        }
        
        return new Response(JSON.stringify({ 
            text: textResponse,
            reportId: reportId,
            vectorStored: vectorSuccess
        }), { 
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error: any) {
        console.error("Error in extractreportgemini:", error);
        
        let errorMessage = "An error occurred while processing your request.";
        let statusCode = 500;
        
        if (error.message.includes("rate limit")) {
            errorMessage = "API rate limit exceeded. Please try again in a few minutes or upgrade your API plan.";
            statusCode = 429;
        } else if (error.message.includes("API key")) {
            errorMessage = "Invalid API key. Please check your configuration.";
            statusCode = 401;
        } else if (error.message.includes("quota")) {
            errorMessage = "Daily API quota exceeded. Please try again tomorrow or upgrade your plan.";
            statusCode = 429;
        } else if (error.message.includes("network") || error.message.includes("fetch")) {
            errorMessage = "Network error. Please check your internet connection and try again.";
            statusCode = 503;
        }
        
        // If all retries failed, provide a helpful fallback message
        if (statusCode === 429) {
            errorMessage += "\n\nAlternative: You can manually type the report details in the text area below.";
        }
        
        return new Response(JSON.stringify({ error: errorMessage }), {
            status: statusCode,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

function fileToGenerativePart(imageData: string) {
    return {
        inlineData: {
            data: imageData.split(",")[1],
            mimeType: imageData.substring(
                imageData.indexOf(":") + 1,
                imageData.lastIndexOf(";")
            ),
        },
    }
}