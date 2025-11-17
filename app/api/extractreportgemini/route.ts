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

const validationPrompt = `Analyze the attached image and determine if it is a medical/clinical report (such as lab results, blood tests, radiology reports, pathology reports, diagnostic reports, etc.).

Respond with ONLY one of these options:
- "VALID_MEDICAL_REPORT" if it is a medical/clinical report
- "NOT_MEDICAL_REPORT: [brief reason]" if it is not a medical report (e.g., resume, invoice, general document, etc.)`;

// Full text extraction prompt - extract ALL text from the report
const fullTextExtractionPrompt = `Attached is an image of a clinical/medical report. 

Extract ALL text content from this report exactly as it appears. Include:
- All headers, titles, and section names
- All test names, values, units, and reference ranges
- All numerical values, dates, and measurements
- All notes, comments, and observations
- All formatting and structure (use line breaks to preserve layout)

Preserve the original structure and formatting as much as possible. Do not summarize or abbreviate. Extract the complete, full text of the entire report.

Output the complete extracted text:`;

// Summary prompt - for generating a concise summary separately
const summaryPrompt = `Attached is an image of a clinical report. 
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

        // Step 1: Validate if the document is a medical report
        console.log("Validating if document is a medical report...");
        const validationResponse = await generateContentWithRetry(filePart, validationPrompt);
        
        console.log("Validation response:", validationResponse);
        
        // Check if document is valid medical report
        if (!validationResponse || !validationResponse.includes("VALID_MEDICAL_REPORT")) {
            const reason = validationResponse?.replace("NOT_MEDICAL_REPORT:", "").trim() || "This document does not appear to be a medical or clinical report";
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

        // Step 2: Document is valid, proceed with FULL TEXT extraction
        console.log("Document validated as medical report. Extracting full report text with Gemini API...");
        const fullTextResponse = await generateContentWithRetry(filePart, fullTextExtractionPrompt);

        console.log("Successfully extracted full report text");
        
        // Generate unique report ID
        const reportId = `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        // Create and store vector embeddings using the full text
        console.log("Creating vector embeddings from full report text...");
        const vectorSuccess = await createAndStoreVectorEmbeddings(
            pinecone,
            'med-rag', // index name
            'diagnosis2', // namespace
            fullTextResponse || '',
            reportId
        );
        
        if (vectorSuccess) {
            console.log("Successfully created and stored vector embeddings");
        } else {
            console.warn("Failed to create vector embeddings, but text extraction succeeded");
        }
        
        // Return the FULL extracted text (not a summary)
        return new Response(JSON.stringify({ 
            text: fullTextResponse, // Full report text, not summary
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