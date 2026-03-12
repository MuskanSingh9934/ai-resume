import { NextResponse } from "next/server";
import { generateText, mockGeneratedResume } from "../../../lib/genai";
import { systemGeneratePrompt } from "@/lib/helper";

export async function POST(req: Request) {
  try {
    const data = await req.json();
    if (!data || typeof data !== "object") {
      return NextResponse.json({ error: "Missing user data" }, { status: 400 });
    }

    const aiText = await generateText(
      { prompt: JSON.stringify(data), jobDescription: data.jobDescription },
      systemGeneratePrompt,
    );
    if (aiText) {
      try {
        const parsed = JSON.parse(aiText);
        return NextResponse.json(parsed);
      } catch (err) {
        console.error("Failed to parse AI response, returning mock.", err);
      }
    }

    const mock = mockGeneratedResume(data);
    return NextResponse.json(mock);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
