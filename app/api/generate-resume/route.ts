import { NextResponse } from "next/server";
import { generateText, mockGeneratedResume } from "../../../lib/genai";

export async function POST(req: Request) {
  try {
    const data = await req.json();
    if (!data || typeof data !== "object") {
      return NextResponse.json({ error: "Missing user data" }, { status: 400 });
    }

    const prompt = `Generate an ATS-friendly resume in JSON with keys: name, summary, skills (array), experience (array of {company, title, start, end, bullets}), education (array), projects (array). Use this input data: ${JSON.stringify(
      data,
    )}. Respond ONLY with valid JSON.`;

    const aiText = await generateText(prompt);
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
