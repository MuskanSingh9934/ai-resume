/* Simple wrapper to call Google Generative API if `GEMINI_API_KEY` is set.
   Falls back to returning null when not configured. This file uses a
   lightweight fetch call so it doesn't rely on a specific client API shape.
*/

import { GoogleGenAI } from "@google/genai";

export async function generateText(
  data: { prompt: string; jobDescription?: string },
  system: string,
) {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  try {
    const res = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite-preview",
      contents: JSON.stringify({ prompt: data.prompt, jobDescription: data.jobDescription }),
      config: { systemInstruction: system },
    });
    console.log("API Response:", res.text);
    if (typeof res.text === "string") return res.text;
    // If the API returns nested objects, stringify them.
    return JSON.stringify(res.text);
  } catch (err) {
    console.error("generateText error:", err);
    return null;
  }
}

export function mockAnalyze(_resumeText: string, _jobDescription?: string) {
  // Lightweight mock analysis used when API key is not configured or call fails.
  return {
    atsScore: 72,
    industry: "Software Engineering",
    sections: {
      summary: "Clear summary but could be more metrics-driven.",
      skills: "Good coverage of core skills; consider adding AWS and Terraform.",
      experience: "Strong recent experience; reorder to emphasize impact.",
      education: "Education listed appropriately.",
      projects: "Add 1-2 measurable project achievements.",
    },
    missingSkills: ["AWS", "Terraform", "System Design"],
    suggestions: [
      "Add metrics to bullets (%, time, $)",
      "Tailor skills to JD keywords",
      "Reorder top achievements to align with role",
    ],
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mockGeneratedResume(data: any) {
  return {
    name: data.name || "John Doe",
    summary: data.summary || "Professional with experience in ...",
    skills: data.skills || ["JavaScript", "TypeScript", "React"],
    experience: data.experience || [],
    education: data.education || [],
    projects: data.projects || [],
  };
}
