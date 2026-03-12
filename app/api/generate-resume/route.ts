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
      // Strip markdown code fences if Gemini wraps the output
      const cleaned = aiText
        .replace(/^```(?:latex|tex)?\s*\n?/i, "")
        .replace(/\n?```\s*$/i, "")
        .trim();

      if (cleaned.includes("\\documentclass")) {
        return NextResponse.json({ latex: cleaned });
      }
    }

    // Fallback mock
    const mock = mockGeneratedResume(data);
    return NextResponse.json({ latex: mock });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
