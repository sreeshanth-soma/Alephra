import { NextRequest, NextResponse } from 'next/server';
export const maxDuration = 60;
import { GoogleGenerativeAI } from '@google/generative-ai';
import { queryPineconeVectorStore } from '@/utils';
import { Pinecone } from '@pinecone-database/pinecone';
import { indexName, namespace } from '@/app/config';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-8b' });

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY ?? "",
});

export async function POST(request: NextRequest) {
  try {
    const { message, language = 'en-IN', reportData = '', reportId } = await request.json();
    
    console.log('Voice API received:', { message, language, reportDataLength: reportData.length });
    
    if (!message) {
      return NextResponse.json({ error: 'No message provided' }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: 'Gemini API key not configured' }, { status: 500 });
    }

    // Get language name for context
    const languageNames: { [key: string]: string } = {
      'en-IN': 'English (India)',
      'hi-IN': 'Hindi (India)',
      'bn-IN': 'Bengali (India)',
      'ta-IN': 'Tamil (India)',
      'te-IN': 'Telugu (India)',
      'mr-IN': 'Marathi (India)',
      'gu-IN': 'Gujarati (India)',
      'kn-IN': 'Kannada (India)',
      'ml-IN': 'Malayalam (India)',
      'pa-IN': 'Punjabi (India)'
    };

    const languageName = languageNames[language] || 'English';

    // Truncate long inputs to keep embedding fast and focused
    const maxReportChars = 3000
    const maxMessageChars = 500
    const trimmedReport = (reportData || '').slice(0, maxReportChars)
    const trimmedMessage = (message || '').slice(0, maxMessageChars)

    // Query vector database for relevant clinical findings
    const query = `Represent this for searching relevant passages: patient medical report that says: \n${trimmedReport}. \n\n${trimmedMessage}`;
    const retrievals = await queryPineconeVectorStore(pinecone, indexName, namespace, query, {
      reportId,
      topK: 3,
      minScore: 0.8
    });

    // Create a medical-focused prompt using vector database results
    const finalPrompt = `You are a helpful medical voice assistant for MedScan. The user is speaking in ${languageName}.

Here is a summary of a patient's clinical report, and a user query. Some generic clinical findings are also provided that may or may not be relevant for the report.
Go through the clinical report and answer the user query SPECIFICALLY and DIRECTLY.
Ensure the response is factually accurate, and demonstrates a thorough understanding of the query topic and the clinical report.
Before answering you may enrich your knowledge by going through the provided clinical findings. 
The clinical findings are generic insights and not part of the patient's medical report. Do not include any clinical finding if it is not relevant for the patient's case.

**Patient's Clinical report summary:** \n${reportData || 'No specific patient report available'}. 
**end of patient's clinical report** 

**User Query:**\n${message}?
**end of user query** 

**Generic Clinical findings:**
\n\n${retrievals}. 
**end of generic clinical findings** 

Provide a helpful, conversational response that:
1. ANSWER ONLY what the user specifically asked - don't provide extra information unless requested
2. Is relevant to medical/healthcare topics
3. Is concise and suitable for voice output (under 100 words)
4. If the user asks about appointments, guide them to the dashboard
5. If they ask about medicines, provide information from the report if available, but always recommend consulting the doctor for dosage and timing
6. If they ask about health metrics, refer to the dashboard vitals
7. If they ask about symptoms or health concerns, provide general guidance but recommend consulting a doctor
8. Be friendly and professional
9. If the message is not medical-related, politely redirect to medical topics

Respond in a natural, conversational tone that works well for voice output.

**Answer:**`;

    const result = await model.generateContent(finalPrompt);
    const response = await result.response;
    const text = response.text();

    console.log('Voice API generated response:', text.substring(0, 100) + '...');

    return NextResponse.json({ 
      success: true, 
      response: text.trim(),
      retrievals: retrievals
    });

  } catch (error) {
    console.error('Voice Gemini chat error:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Failed to process chat request',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
