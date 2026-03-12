/* Simple wrapper to call Google Generative API if `GEMINI_API_KEY` is set.
   Falls back to returning null when not configured. This file uses a
   lightweight fetch call so it doesn't rely on a specific client API shape.
*/

export async function generateText(prompt: string) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }

  // Best-effort call to Google's Generative Language REST endpoint.
  // Users should ensure the correct model and URL for their account.
  const url = `https://generativelanguage.googleapis.com/v1beta2/models/text-bison-001:generateText?key=${apiKey}`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        // This body shape may need adjustment depending on API version.
        prompt: { text: prompt },
        // Keep responses short enough to parse reliably.
        maxOutputTokens: 1024,
      }),
    });

    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`Generative API error: ${res.status} ${txt}`);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = await res.json();
    // Try to extract a text candidate from common response shapes.
    const candidate =
      data?.candidates?.[0]?.output ||
      data?.candidates?.[0]?.content ||
      data?.output ||
      data?.result ||
      null;

    if (typeof candidate === "string") return candidate;
    // If the API returns nested objects, stringify them.
    return JSON.stringify(candidate);
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
