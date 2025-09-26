import { queryPineconeVectorStore } from "@/utils";
import { Pinecone } from "@pinecone-database/pinecone";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { indexName, namespace } from "@/app/config";

// Allow streaming responses up to 30 seconds
export const maxDuration = 60;
// export const runtime = 'edge';

const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY ?? "",
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-8b" });

export async function POST(req: Request, res: Response) {
    try {
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

        const retrievals = reportData
            ? await queryPineconeVectorStore(pinecone, indexName, namespace, query)
            : "<nomatches>";

        // Check if the query is a casual conversation (not a medical question)
        const isCasualQuery = /^(thank you|thanks|bye|goodbye|hello|hi|ok|okay|yes|no)$/i.test(userQuestion.trim());
        
        let finalPrompt;
        
        if (isCasualQuery) {
            // Handle casual conversation naturally
            finalPrompt = `The user said: "${userQuestion}"
            
            Respond naturally and conversationally. If they're thanking you, just say "You're welcome!" or similar. Keep it brief and friendly.`;
        } else {
            // Handle medical questions
            finalPrompt = `Here is a summary of a patient's clinical report (if provided), and a user query. Some generic clinical findings are also provided that may or may not be relevant for the report.
  Go through the clinical report and answer the user query.
  Ensure the response is factually accurate, and demonstrates a thorough understanding of the query topic and the clinical report.
  Before answering you may enrich your knowledge by going through the provided clinical findings. 
  The clinical findings are generic insights and not part of the patient's medical report. Do not include any clinical finding if it is not relevant for the patient's case.

  ${reportData ? `\n\n**Patient's Clinical report summary:** \n${reportData}. \n**end of patient's clinical report**` : ''}

  \n\n**User Query:**\n${userQuestion}
  \n**end of user query** 

  \n\n**Generic Clinical findings:**
  \n\n${retrievals}. 
  \n\n**end of generic clinical findings** 

  \n\nProvide a helpful and accurate answer based on the available information.
  \n\n**Answer:**
  `;
        }

        console.log("Final Prompt:", finalPrompt);
        // Add a 15s timeout to avoid hanging requests
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);
        const result = await model.generateContent(finalPrompt, { signal: controller.signal } as any);
        clearTimeout(timeoutId);
        console.log("Gemini Response Result:", result);
        const text = result.response.text();
        console.log("Extracted Text:", text);

        return new Response(JSON.stringify({ text, retrievals }), { headers: { "Content-Type": "application/json" } });
        
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

