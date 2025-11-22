import { queryPineconeVectorStore } from "@/utils";
import { Pinecone } from "@pinecone-database/pinecone";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { indexName, namespace } from "@/app/config";

// Allow streaming responses up to 60 seconds for vector search operations
export const maxDuration = 60;
// Note: Using Node.js runtime because utils.ts requires crypto module
// export const runtime = 'edge';
export const preferredRegion = 'bom1';

const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY ?? "",
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? "");
const model = genAI.getGenerativeModel({ model: "gemini-flash-lite-latest" });

export async function POST(req: Request, res: Response) {
    try {
        const t0 = Date.now();
        const reqBody = await req.json();
        console.log(reqBody);

        const messages: any[] = Array.isArray(reqBody?.messages) ? reqBody.messages : [];
        
        // Extract user question from the last message (handle both content and parts structure)
        let userQuestion = '';
        if (messages.length > 0) {
            const lastMessage = messages[messages.length - 1];
            console.log('Last message:', lastMessage);
            
            if (lastMessage?.content) {
                userQuestion = lastMessage.content;
            } else if (lastMessage?.parts && lastMessage.parts.length > 0) {
                userQuestion = lastMessage.parts.map((part: any) => part.text || '').join('');
            }
        }
        
        console.log('Extracted user question:', userQuestion);

        const reportData: string = (reqBody?.data?.reportData) ?? reqBody?.reportData ?? '';
        const query = reportData
            ? `Represent this for searching relevant passages: patient medical report says: \n${reportData}. \n\n${userQuestion}`
            : `Represent this for searching relevant passages: user question: ${userQuestion}`;

        const tPineconeStart = Date.now();
        let retrievals = "<nomatches>";
        
        if (reportData) {
            try {
                // Add timeout for Pinecone query (30 seconds)
                const pineconeController = new AbortController();
                const pineconeTimeoutId = setTimeout(() => pineconeController.abort(), 30000);
                
                retrievals = await queryPineconeVectorStore(pinecone, indexName, namespace, query);
                clearTimeout(pineconeTimeoutId);
                
                console.log("Pinecone query successful, retrievals:", retrievals.substring(0, 200) + "...");
            } catch (error) {
                console.error("Pinecone query failed:", error);
                retrievals = "<nomatches>";
                // Continue with Gemini even if Pinecone fails
            }
        }
        const tPineconeEnd = Date.now();

        // Check if the query is a casual conversation (not a medical question)
        const isCasualQuery = /^(thank you|thanks|bye|goodbye|hello|hi|ok|okay|yes|no)$/i.test(userQuestion.trim());
        
        let finalPrompt;
        
        if (isCasualQuery) {
            // Handle casual conversation naturally
            finalPrompt = `The user said: "${userQuestion}"
            
            Respond naturally and conversationally. If they're thanking you, just say "You're welcome!" or similar. Keep it brief and friendly.`;
        } else {
            const isMedicationContext = /(medicine|medication|tablet|drug|dose|what is .* (for|used)|what are those)/i.test(userQuestion);

            // Handle medical questions
            finalPrompt = `You are a medical assistant. Answer the user's question about their clinical report concisely and directly.

**IMPORTANT:** Keep your response brief (2-4 sentences maximum). Focus only on what the user asked. Do not provide lengthy explanations or detailed medication analysis unless specifically requested.

${reportData ? `**Patient's Clinical Report:** \n${reportData}\n` : ''}

**User Question:** ${userQuestion}

${retrievals !== "<nomatches>" ? `**Reference Information:**\n${retrievals}\n` : ''}

Provide a brief, direct answer. If the question is about concerns or issues, mention only the key points (2-3 main concerns max).

${isMedicationContext ? `If the user is asking what a medication is "generally used for", you may mention common high-level indications (e.g., "Vomilast is typically used to control nausea"). Make sure to clearly state that this is informational and remind them to follow their doctor's prescription.
` : ""}

**Answer:**`;
        }

        console.log("Final Prompt:", finalPrompt);
        // Add a 45s timeout for Gemini (increased from 15s to allow for vector search context)
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 45000);
        const tGeminiStart = Date.now();
        
        let result;
        try {
            result = await model.generateContent(finalPrompt, { signal: controller.signal } as any);
        } catch (error) {
            clearTimeout(timeoutId);
            console.error("Gemini API error:", error);
            throw error;
        }
        
        const tGeminiEnd = Date.now();
        clearTimeout(timeoutId);
        console.log("Gemini Response Result:", result);
        const text = result.response.text();
        console.log("Extracted Text:", text);
        const tEnd = Date.now();

        const timings = {
            totalMs: tEnd - t0,
            pineconeMs: reportData ? (tPineconeEnd - tPineconeStart) : 0,
            geminiMs: tGeminiEnd - tGeminiStart,
            parsingMs: 0
        };

        const serverTiming = [
            `total;dur=${timings.totalMs}`,
            reportData ? `pinecone;dur=${timings.pineconeMs}` : undefined,
            `gemini;dur=${timings.geminiMs}`
        ].filter(Boolean).join(", ");

        // Include vector search status in response
        const vectorSearchStatus = retrievals === "<nomatches>" ? "no_matches" : "success";
        const hasVectorData = retrievals !== "<nomatches>" && retrievals.length > 50;

        return new Response(JSON.stringify({ 
            text, 
            retrievals, 
            timings,
            vectorSearchStatus,
            hasVectorData,
            usedVectorSearch: reportData && hasVectorData
        }), {
            headers: { "Content-Type": "application/json", "Server-Timing": serverTiming }
        });
        
    } catch (error: any) {
        console.error("Error in POST handler:", error);
        const message = String(error?.message || "Unknown error").toLowerCase();
        const status = Number(error?.status) || (message.includes("abort") || message.includes("timeout") ? 504
            : message.includes("quota") || message.includes("rate") || message.includes("429") ? 429
            : message.includes("api key") || message.includes("unauthorized") || message.includes("401") ? 401
            : message.includes("network") || message.includes("fetch") ? 503
            : 500);

        const friendly = status === 504 ? "The request timed out. Please retry."
            : status === 429 ? "Rate limit or quota exceeded. Please wait and try again."
            : status === 401 ? "Invalid or missing API key. Please check configuration."
            : status === 503 ? "Network or service unavailable. Please try again shortly."
            : "An unexpected error occurred.";

        return new Response(JSON.stringify({ error: friendly }), {
            status,
            headers: { "Content-Type": "application/json" }
        });
    }
}

