import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash-latest',
});

const prompt = `You are a medical expert. Analyze the following clinical report text and generate a concise, easy-to-understand summary in no more than 3-4 short sentences. Focus on the most critical findings, abnormal values, and overall assessment.

Report Text:
---
{REPORT_TEXT}
---

Concise Summary:`;


export async function POST(req: NextRequest) {
    try {
        const { reportText } = await req.json();

        if (!reportText) {
            return NextResponse.json({ error: "No report text provided" }, { status: 400 });
        }
        
        const fullPrompt = prompt.replace('{REPORT_TEXT}', reportText);

        const result = await model.generateContent(fullPrompt);
        const summary = result.response.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!summary) {
            throw new Error("Failed to generate summary from the model.");
        }

        return NextResponse.json({ summary });

    } catch (error: any) {
        console.error("Error in summarize-report API:", error);
        
        let errorMessage = "An error occurred while generating the summary.";
        let statusCode = 500;

        if (error.message.includes("rate limit")) {
            errorMessage = "API rate limit exceeded. Please try again later.";
            statusCode = 429;
        } else if (error.message.includes("API key")) {
            errorMessage = "Invalid API key. Please check your configuration.";
            statusCode = 401;
        }

        return NextResponse.json({ error: errorMessage }, {
            status: statusCode,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
