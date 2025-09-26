import { queryPineconeVectorStore } from "@/utils";
import { Pinecone } from "@pinecone-database/pinecone";
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createTextStreamResponse, generateText, UIMessage as Message, streamText } from "ai";
import { indexName, namespace } from "@/app/config";

// Allow streaming responses up to 60 seconds
export const maxDuration = 60;
// export const runtime = 'edge';

const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY ?? "",
});

const google = createGoogleGenerativeAI({
    baseURL: 'https://generativelanguage.googleapis.com/v1beta',
    apiKey: process.env.GEMINI_API_KEY,
});

// Using gemini-1.5-pro-latest for enhanced capabilities
const model = google('models/gemini-1.5-flash-8b');
console.log("Using Gemini model:", model.modelId);

export async function POST(req: Request, res: Response) {
    try {
        const reqBody = await req.json();
        console.log(reqBody);

        const messages: Message[] = reqBody.messages;
        let userQuestion = '';
        const lastMessage = messages[messages.length - 1];
        if (lastMessage && lastMessage.parts && lastMessage.parts.length > 0) {
            userQuestion = lastMessage.parts.map(part => ('text' in part && typeof part.text === 'string') ? part.text : '').join('');
        }

        const reportData: string = reqBody.data.reportData;
        const query = `Represent this for searching relevant passages: patient medical report says: \n${reportData}. \n\n${userQuestion}`;

        const retrievals = await queryPineconeVectorStore(pinecone, indexName, namespace, query);

        const finalPrompt = `Here is a summary of a patient's clinical report, and a user query. Some generic clinical findings are also provided that may or may not be relevant for the report.
  Go through the clinical report and answer the user query.
  Ensure the response is factually accurate, and demonstrates a thorough understanding of the query topic and the clinical report.
  Before answering you may enrich your knowledge by going through the provided clinical findings. 
  The clinical findings are generic insights and not part of the patient's medical report. Do not include any clinical finding if it is not relevant for the patient's case.

  \n\n**Patient's Clinical report summary:** \n${reportData}. 
  \n**end of patient's clinical report** 

  \n\n**User Query:**\n${userQuestion}?
  \n**end of user query** 

  \n\n**Generic Clinical findings:**
  \n\n${retrievals}. 
  \n\n**end of generic clinical findings** 

  \n\nProvide thorough justification for your answer.
  \n\n**Answer:**
  `;

        // Timeout wrapper for streaming
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);
        const result = await streamText({
            model: model,
            prompt: finalPrompt,
            // @ts-expect-error: streamText accepts signal in runtime
            signal: controller.signal,
        });
        clearTimeout(timeoutId);

        return createTextStreamResponse({ textStream: result.textStream });
    } catch (error: any) {
        console.error("Error in API route:", error);
        const message = String(error?.message || "").toLowerCase();
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
        return new Response(JSON.stringify({ error: friendly }), { status });
    }
}
