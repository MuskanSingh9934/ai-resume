"use client";

import { useState } from "react";

export default function AnalyzePage() {
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  async function handleAnalyze() {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText, jobDescription: jobDescription || undefined }),
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setResult({ error: "Request failed" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl py-12 px-6">
      <h2 className="text-2xl font-semibold">Resume Analyzer</h2>
      <p className="mt-2 text-sm text-zinc-600">Paste your resume text below.</p>

      <textarea
        className="mt-4 w-full min-h-[160px] rounded border p-3"
        value={resumeText}
        onChange={(e) => setResumeText(e.target.value)}
        placeholder="Paste resume text..."
      />

      <textarea
        className="mt-4 w-full min-h-[100px] rounded border p-3"
        value={jobDescription}
        onChange={(e) => setJobDescription(e.target.value)}
        placeholder="Optional: paste job description to match against..."
      />

      <div className="mt-4 flex gap-2">
        <button
          onClick={handleAnalyze}
          disabled={loading || !resumeText}
          className="rounded bg-black px-4 py-2 text-white disabled:opacity-60"
        >
          {loading ? "Analyzing..." : "Analyze"}
        </button>
      </div>

      <div className="mt-6">
        {result ? (
          <pre className="rounded border bg-white p-4 text-sm">
            {JSON.stringify(result, null, 2)}
          </pre>
        ) : (
          <p className="text-sm text-zinc-500">Results will appear here.</p>
        )}
      </div>
    </div>
  );
}
