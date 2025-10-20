import { NextRequest, NextResponse } from 'next/server';
export const maxDuration = 60;
import { GoogleGenerativeAI } from '@google/generative-ai';
import { queryPineconeVectorStoreForVoice } from '@/utils';
import { Pinecone } from '@pinecone-database/pinecone';
import { indexName, namespace } from '@/app/config';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-flash-lite-latest' });

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY ?? "",
});

export async function POST(request: NextRequest) {
  try {
    const t0 = Date.now();
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

  // Start both Pinecone and Gemini processing in parallel for maximum speed
  const combinedQuery = `Represent this for searching relevant passages: patient medical report that says: \n${trimmedReport}. \n\n${trimmedMessage}`;
  // If we have a reportId (precomputed vectors exist), only send the user's message to the vector search
  // This avoids re-embedding the whole report on every request and does not add extra cost.
  const searchQuery = reportId ? `Represent this for searching relevant passages: ${trimmedMessage}` : combinedQuery;
    
    // Create base prompt that works without vector search results
    const hasReportData = reportData && reportData.trim().length > 0;
    
    const basePrompt = hasReportData 
      ? `You are a medical voice assistant for MedScan. The user is speaking in ${languageName}.

Here is a summary of a patient's clinical report, and a user query.
Go through the clinical report and answer the user query SPECIFICALLY and DIRECTLY.
Ensure the response is factually accurate, and demonstrates a thorough understanding of the query topic and the clinical report.

**Patient's Clinical report summary:** \n${reportData}. 
**end of patient's clinical report** 

**User Query:**\n${message}?
**end of user query** 

Provide a professional medical response that:
1. ANSWER ONLY what the user specifically asked - don't provide extra information unless requested
2. Is relevant to medical/healthcare topics
3. Is concise and suitable for voice output (under 100 words)
4. Be direct and professional - DO NOT use casual greetings like "Hello!", "I'm happy to help", "I'd be glad to", etc.
5. Start directly with the medical information or answer

**For LIFESTYLE ADVICE (diet, exercise, rest, hydration, general wellness):**
   - Provide helpful, safe general advice (e.g., "eat light, nutritious foods like fruits, vegetables, and soups")
   - End with: "However, please consult your doctor for personalized advice"
   
**For TREATMENT or MEDICATION questions (dosage, prescriptions, specific treatments):**
   - DO NOT provide specific treatment advice or dosages
   - Directly say: "Please consult your doctor for treatment recommendations and proper dosage. I cannot provide specific medical treatment advice"
   
**For OTHER QUERIES:**
   - If about appointments, guide them to the dashboard
   - If about vitals, health metrics, or dashboard data, provide information from the available data
   - If about symptoms or diagnosis, provide general information but recommend consulting a doctor
   - If not medical-related, respond naturally and encouragingly. For personal character questions like "am I a good person", respond with: "Yes, you are! Your commitment to monitoring your health and seeking medical care shows you care about your wellbeing. This positive attitude supports healing and recovery. How can I help you with your health today?"

Respond in a professional, medical tone that works well for voice output. Start directly with the medical information.

**Answer:**`
      : `You are a medical voice assistant for MedScan. The user is speaking in ${languageName}.

**IMPORTANT:** The user has NOT uploaded any medical reports yet.

**User Query:**\n${message}?
**end of user query** 

Provide a professional medical response that:

1. If the user is asking about THEIR specific report, lab results, test values, or personal medical data:
   - Clearly inform them: "I don't have access to your medical reports yet. To analyze your reports, please go to the Analysis page from the navigation menu, upload your medical reports, and then come back here. I'll be able to answer specific questions about your health data."
   
2. If the user is asking GENERAL health questions:
   - Provide helpful general medical information
   - Keep it concise for voice output (under 100 words)
   - Be direct and professional
   
**For LIFESTYLE ADVICE (diet, exercise, rest, hydration, general wellness):**
   - Provide helpful, safe general advice (e.g., "eat light, nutritious foods like fruits, vegetables, and soups", "stay hydrated", "get adequate rest")
   - End with: "However, please consult your doctor for personalized advice"
   
**For VITALS or DASHBOARD questions:**
   - If vitals data is available in the reportData, provide the specific values
   - If no vitals data available, say: "I don't have access to your vitals data yet. Please add your vitals in the Dashboard, then I can help you understand them."
   
**For TREATMENT or MEDICATION questions (dosage, prescriptions, specific treatments):**
   - DO NOT provide specific treatment advice or dosages
   - Directly say: "Please consult your doctor for treatment recommendations and proper dosage. I cannot provide specific medical treatment advice"

3. Be direct and professional - DO NOT use casual greetings like "Hello!", "I'm happy to help", "I'd be glad to", etc.
4. Start directly with the information
5. If the message is not medical-related, respond naturally and encouragingly. For personal character questions like "am I a good person", respond with: "Yes, you are! Your commitment to monitoring your health and seeking medical care shows you care about your wellbeing. This positive attitude supports healing and recovery. How can I help you with your health today?"

Respond in a professional, medical tone that works well for voice output.

**Answer:**`;

    const tStart = Date.now();

    // Start Gemini immediately for fast response
    const geminiPromise = (async () => {
      const tGeminiStartLocal = Date.now();
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // Very fast timeout
        
        const result = await model.generateContent(basePrompt, { signal: controller.signal } as any);
        clearTimeout(timeoutId);
        
        const response = await result.response;
        const rawText = response.text();
        
        // Clean markdown and LaTeX formatting for voice output
        const cleanText = rawText
          .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold markdown
          .replace(/\*(.*?)\*/g, '$1')     // Remove italic markdown
          .replace(/#{1,6}\s*/g, '')       // Remove headers
          .replace(/`(.*?)`/g, '$1')       // Remove code backticks
          .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Remove links, keep text
          .replace(/\$([^$]+)\$/g, '$1')   // Remove LaTeX math delimiters
          .replace(/\\text\{([^}]+)\}/g, '$1') // Remove LaTeX text commands
          .replace(/\\[a-zA-Z]+\{[^}]*\}/g, '') // Remove other LaTeX commands
          .replace(/\n{2,}/g, '. ')        // Replace multiple newlines with periods
          .replace(/\n/g, ' ')             // Replace single newlines with spaces
          .trim();
        
        const tGeminiEndLocal = Date.now();
        console.log('Gemini initial generate duration(ms):', tGeminiEndLocal - tGeminiStartLocal);
        return cleanText;
      } catch (error) {
        console.error("Voice Gemini API error:", error);
        return "I'm sorry, I encountered an error processing your request. Please try again.";
      }
    })();
    
    // Start Pinecone in parallel (but don't wait for it)
    // Skip vector search for very short queries to maximize speed
    const pineconePromise = (async () => {
      const tPineconeStartLocal = Date.now();
      if (!trimmedReport || trimmedMessage.length < 10) {
        console.log("Skipping vector search for short query or no report data");
        return "<nomatches>";
      }
      
      try {
        const pineconeController = new AbortController();
        const pineconeTimeoutId = setTimeout(() => pineconeController.abort(), 8000); // Very fast timeout
        
        const retrievals = await queryPineconeVectorStoreForVoice(pinecone, indexName, namespace, searchQuery, {
          reportId,
          topK: 3,
          minScore: 0.7
        });
        clearTimeout(pineconeTimeoutId);
        const tPineconeEndLocal = Date.now();
        console.log("Voice Pinecone query successful, retrievals length:", retrievals.length, 'durationMs:', tPineconeEndLocal - tPineconeStartLocal);
        return retrievals;
      } catch (error) {
        console.error("Voice Pinecone query failed:", error);
        return "<nomatches>";
      }
    })();
    
    // Get Gemini response immediately
  const tGeminiStart = Date.now();
  const cleanText = await geminiPromise;
  const tGeminiEnd = Date.now();
    
    // Try to get Pinecone results if they're ready, otherwise use base response
    let retrievals = "<nomatches>";
    let finalResponse = cleanText;
    
    try {
      // Wait for Pinecone with a short timeout
      const pineconeResult = await Promise.race([
        pineconePromise,
        new Promise(resolve => setTimeout(() => resolve("<nomatches>"), 3000)) // 3 second max wait
      ]);
      
      retrievals = pineconeResult as string;
      
      // If we got vector search results, enhance the response
      if (retrievals !== "<nomatches>" && retrievals.length > 50) {
        const enhancedPrompt = `${basePrompt}

**Additional Clinical findings from medical database:**
\n\n${retrievals}. 
**end of additional clinical findings** 

Please enhance your previous response with any relevant information from the additional clinical findings, but keep it concise for voice output.

**Enhanced Answer:**`;
        
        try {
          const tEnhancedStart = Date.now();
          const enhancedResult = await model.generateContent(enhancedPrompt);
          const enhancedResponse = await enhancedResult.response;
          const enhancedText = enhancedResponse.text();
          const tEnhancedEnd = Date.now();

          console.log('Enhanced Gemini generate duration(ms):', tEnhancedEnd - tEnhancedStart);

          finalResponse = enhancedText
            .replace(/\*\*(.*?)\*\*/g, '$1')
            .replace(/\*(.*?)\*/g, '$1')
            .replace(/#{1,6}\s*/g, '')
            .replace(/`(.*?)`/g, '$1')
            .replace(/\[(.*?)\]\(.*?\)/g, '$1')
            .replace(/\$([^$]+)\$/g, '$1')   // Remove LaTeX math delimiters
            .replace(/\\text\{([^}]+)\}/g, '$1') // Remove LaTeX text commands
            .replace(/\\[a-zA-Z]+\{[^}]*\}/g, '') // Remove other LaTeX commands
            .replace(/\n{2,}/g, '. ')
            .replace(/\n/g, ' ')
            .trim();
        } catch (error) {
          console.error("Enhanced response generation failed, using base response:", error);
        }
      }
    } catch (error) {
      console.error("Pinecone processing failed, using base response:", error);
    }
    
    console.log('Voice API generated response:', finalResponse.substring(0, 100) + '...');

    const tEnd = Date.now();
    const timings = {
      totalMs: tEnd - t0,
      geminiMs: tGeminiEnd - tGeminiStart,
      pineconeMs: Math.max(0, tEnd - tStart) // approximate if available
    };
    const serverTiming = [`total;dur=${timings.totalMs}`, `gemini;dur=${timings.geminiMs}`].join(", ");

    // Include vector search status in response
    const vectorSearchStatus = retrievals === "<nomatches>" ? "no_matches" : "success";
    const hasVectorData = retrievals !== "<nomatches>" && retrievals.length > 50;

    return NextResponse.json({ 
      success: true, 
      response: finalResponse,
      retrievals: retrievals,
      timings,
      vectorSearchStatus,
      hasVectorData,
      usedVectorSearch: trimmedReport && hasVectorData
    }, { headers: { 'Server-Timing': serverTiming } });

  } catch (error) {
    console.error('Voice Gemini chat error:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Failed to process chat request',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
