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
      const cleaned = aiText
        .replace(/^```(?:json)?\s*\n?/i, "")
        .replace(/\n?```\s*$/i, "")
        .trim();

      try {
        return NextResponse.json({ resume: JSON.parse(cleaned) });
      } catch (err) {
        console.error("Failed to parse generated resume JSON.", err);
      }
    }

    const mock = mockGeneratedResume(data);
    return NextResponse.json({ resume: mock });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
