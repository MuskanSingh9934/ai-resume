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
export function mockGeneratedResume(data: any): string {
  const name = data.name || "John Doe";
  const email = data.email || "email@example.com";
  const phone = data.phone || "000-000-0000";
  const skills = Array.isArray(data.skills)
    ? data.skills.join(", ")
    : data.skills || "JavaScript, TypeScript, React";
  const education = data.education || "B.S. Computer Science";
  const experience = data.experience || "Software Engineer at Company";
  const projects = data.projects || "Project description";

  return `\\documentclass{resume}
\\usepackage[left=0.6in, top=0.6in, right=0.6in, bottom=0.6in]{geometry}

\\name{${name}}
\\address{
${phone} \\\\
\\href{mailto:${email}}{${email}}
}

\\begin{document}

%---------------- EDUCATION ----------------%
\\begin{rSection}{EDUCATION}
${education}
\\end{rSection}

%---------------- TECHNICAL SKILLS ----------------%
\\begin{rSection}{TECHNICAL SKILLS}
\\textbf{Skills:} ${skills} \\\\
\\end{rSection}

%---------------- EXPERIENCE ----------------%
\\begin{rSection}{EXPERIENCE}
${experience}
\\end{rSection}

%---------------- PROJECTS ----------------%
\\begin{rSection}{PROJECTS}
${projects}
\\end{rSection}

\\end{document}`;
}
