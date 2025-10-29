import { GoogleGenerativeAI } from "@google/generative-ai";
export const maxDuration = 60;
import { Pinecone } from "@pinecone-database/pinecone";
import { createAndStoreVectorEmbeddings } from "@/utils";

if (process.env.NODE_ENV !== "production") console.log("extractreportgemini route loaded");
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({
    model: 'gemini-flash-lite-latest',
});

const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY ?? "",
});

// Combined validation and extraction prompt for efficiency (single API call instead of two)
const combinedPrompt = `Analyze the attached image and perform two tasks:

Task 1: Determine if this is a medical/clinical report (such as lab results, blood tests, radiology reports, pathology reports, diagnostic reports, etc.).

Task 2: If it is a valid medical report, extract and summarize the key biomarkers showing abnormalities in 100 words (may increase for multi-page reports). Do not include patient name or date. Include numerical values and report title.

Respond in the following JSON format:
{
  "isValidMedicalReport": true/false,
  "reason": "brief reason if not a medical report, or empty if valid",
  "summary": "summary text if valid medical report, or empty if not valid"
}`;

// Simple concurrency limiter to avoid thundering herd
let inFlight = 0;
const MAX_CONCURRENT = 1;
const waitForSlot = async () => {
    while (inFlight >= MAX_CONCURRENT) {
        await new Promise(r => setTimeout(r, 50));
    }
};

async function generateContentWithRetry(filePart: any, promptText: string, maxRetries = 3) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            await waitForSlot();
            inFlight++;
            const generatedContent = await model.generateContent([promptText, filePart]);
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

        // Combined validation and extraction in single API call for better performance
        console.log("Processing document with combined validation and extraction...");
        const response = await generateContentWithRetry(filePart, combinedPrompt);
        
        console.log("AI response received:", response?.substring(0, 200));
        
        // Parse JSON response
        let parsedResponse;
        try {
            // Extract JSON from response (handle cases where AI adds markdown formatting)
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                parsedResponse = JSON.parse(jsonMatch[0]);
            } else {
                throw new Error("No JSON found in response");
            }
        } catch (parseError) {
            console.error("Failed to parse AI response as JSON:", parseError);
            // Fallback: treat as invalid if we can't parse
            return new Response(JSON.stringify({ 
                error: "Invalid Document Type",
                message: "Unable to process document. Please ensure it's a clear medical report image.",
                isValidMedicalReport: false
            }), { 
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        // Check if document is valid medical report
        if (!parsedResponse.isValidMedicalReport) {
            const reason = parsedResponse.reason || "This document does not appear to be a medical or clinical report";
            console.log("Document validation failed:", reason);
            return new Response(JSON.stringify({ 
                error: "Invalid Document Type",
                message: `This system only accepts medical/clinical reports (lab results, blood tests, radiology reports, pathology reports, etc.). ${reason}`,
                isValidMedicalReport: false
            }), { 
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Document is valid and we already have the summary
        const textResponse = parsedResponse.summary || "";
        console.log("Successfully processed valid medical report");

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
            vectorStored: vectorSuccess,
            isValidMedicalReport: true
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