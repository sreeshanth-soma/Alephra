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
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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

        const result = await model.generateContent(finalPrompt);
        const text = result.response.text();

        return new Response(JSON.stringify({ text, retrievals }), { headers: { "Content-Type": "application/json" } });
        
    } catch (error: any) {
        console.error("Error in POST handler:", error);
        
        return new Response(JSON.stringify({ 
            error: error.message?.includes('quota') 
                ? "API quota exceeded. Please try again tomorrow or upgrade your plan." 
                : "An error occurred while processing your request."
        }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
}

