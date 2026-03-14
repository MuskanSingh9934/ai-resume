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

export function mockAnalyze() {
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
  const name = data.name || "John Doe";
  const email = data.email || "email@example.com";
  const phone = data.phone || "000-000-0000";
  const skills = Array.isArray(data.skills)
    ? data.skills
    : (data.skills || "JavaScript, TypeScript, React")
        .split(",")
        .map((skill: string) => skill.trim())
        .filter(Boolean);

  return {
    name,
    email,
    phone,
    summary:
      data.summary || "Results-driven professional with experience delivering ATS-friendly work.",
    skills,
    education: data.education
      ? [
          {
            degree: "Education",
            institution: data.education,
            details: "",
          },
        ]
      : [],
    experience: data.experience
      ? [
          {
            title: "Professional Experience",
            company: "",
            period: "",
            bullets: data.experience
              .split("\n")
              .map((line: string) => line.trim())
              .filter(Boolean),
          },
        ]
      : [],
    projects: data.projects
      ? [
          {
            name: "Projects",
            details: data.projects
              .split("\n")
              .map((line: string) => line.trim())
              .filter(Boolean),
          },
        ]
      : [],
    certifications: data.certifications
      ? data.certifications
          .split("\n")
          .map((line: string) => line.trim())
          .filter(Boolean)
      : [],
  };
}
