import { NextResponse } from "next/server";
import { generateText, mockAnalyze } from "../../../lib/genai";

export async function POST(req: Request) {
  try {
    const { resumeText, jobDescription } = await req.json();

    if (!resumeText || typeof resumeText !== "string") {
      return NextResponse.json({ error: "Missing resumeText" }, { status: 400 });
    }

    const prompt = jobDescription
      ? `Compare this resume to the job description and return a JSON object with keys: atsScore (0-100 number), industry (string), sections (object with summary, skills, experience, education, projects), missingSkills (array), suggestions (array). Job Description:\n${jobDescription}\nResume:\n${resumeText}\nRespond ONLY with valid JSON.`
      : `Perform an ATS-style resume analysis and return a JSON object with keys: atsScore (0-100 number), industry (string), sections (object with summary, skills, experience, education, projects), missingSkills (array), suggestions (array). Resume:\n${resumeText}\nRespond ONLY with valid JSON.`;

    const aiText = await generateText(prompt);

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
