import { NextResponse } from "next/server";
import { generateText, mockAnalyze } from "../../../lib/genai";
import { systemAnalysePrompt } from "@/lib/helper";

export async function POST(req: Request) {
  try {
    const { resumeText, jobDescription } = await req.json();

    if (!resumeText || typeof resumeText !== "string") {
      return NextResponse.json({ error: "Missing resumeText" }, { status: 400 });
    }

    const aiText = await generateText({ prompt: resumeText }, systemAnalysePrompt);

    if (aiText) {
      try {
        const parsed = JSON.parse(aiText);
        return NextResponse.json(parsed);
      } catch (err) {
        // If parsing fails, fall through to returning a mocked structure
        console.error("Failed to parse AI response, returning mock.", err);
      }
    }

    // Fallback mock
    const mock = mockAnalyze(resumeText, jobDescription);
    return NextResponse.json(mock);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
