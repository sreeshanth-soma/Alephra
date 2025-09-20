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
const model = google('models/gemini-1.5-flash');

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

        const result = await streamText({
            model: model,
            prompt: finalPrompt,
        });

        return createTextStreamResponse({ textStream: result.textStream });
    } catch (error) {
        console.error("Error in API route:", error);
        return new Response(JSON.stringify({ error: (error as Error).message }), { status: 500 });
    }
}
