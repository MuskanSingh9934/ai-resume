"use client";

import { useState } from "react";
import Link from "next/link";

const fields = [
  { key: "name", label: "Name", type: "input" as const },
  { key: "email", label: "Email", type: "input" as const },
  { key: "phone", label: "Phone", type: "input" as const },
  { key: "skills", label: "Skills (comma separated)", type: "input" as const },
  { key: "summary", label: "Summary", type: "textarea" as const },
  { key: "education", label: "Education", type: "textarea" as const },
  { key: "experience", label: "Experience", type: "textarea" as const },
  { key: "projects", label: "Projects", type: "textarea" as const },
  { key: "certifications", label: "Certifications", type: "textarea" as const },
] as const;

export default function CreatePage() {
  const [form, setForm] = useState<Record<string, string>>({
    name: "",
    email: "",
    phone: "",
    skills: "",
    summary: "",
    education: "",
    experience: "",
    projects: "",
    certifications: "",
  });
  const [loading, setLoading] = useState(false);
  const [compiling, setCompiling] = useState(false);
  const [latex, setLatex] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  function update(field: string, value: string) {
    setForm((s) => ({ ...s, [field]: value }));
  }

  async function handleGenerate() {
    setLoading(true);
    setLatex(null);
    setError(null);

    try {
      const payload = {
        name: form.name,
        email: form.email,
        phone: form.phone,
        skills: form.skills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        summary: form.summary,
        education: form.education,
        experience: form.experience,
        projects: form.projects,
        certifications: form.certifications,
      };

      const res = await fetch("/api/generate-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.error || `Server error (${res.status})`);
      }

      const data = await res.json();

      if (data.error) {
        setError(data.error);
      } else if (data.latex) {
        setLatex(data.latex);
      } else {
        setError("Unexpected response from server.");
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Request failed. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDownloadPDF() {
    if (!latex) return;
    setCompiling(true);

    try {
      const res = await fetch("/api/compile-latex", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ latex }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(
          errData?.error || "PDF compilation failed. Try downloading the .tex file instead.",
        );
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = form.name
        ? `${form.name.replace(/\s+/g, "_")}_Resume.pdf`
        : "Resume.pdf";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "PDF compilation failed.";
      setError(message);
    } finally {
      setCompiling(false);
    }
  }

  function handleDownloadTex() {
    if (!latex) return;
    const blob = new Blob([latex], { type: "application/x-tex" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = form.name
      ? `${form.name.replace(/\s+/g, "_")}_Resume.tex`
      : "Resume.tex";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function handleCopy() {
    if (!latex) return;
    navigator.clipboard.writeText(latex);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="mx-auto max-w-3xl py-12 px-6">
        <Link
          href="/"
          className="inline-block text-sm text-zinc-500 hover:text-black transition-colors mb-6"
        >
          &larr; Back to Home
        </Link>

        <h2 className="text-3xl font-bold text-zinc-900">Resume Creator</h2>
        <p className="mt-2 text-zinc-600">
          Fill in your details and generate an ATS-friendly resume.
        </p>

        {/* Form */}
        <div className="mt-6 space-y-3">
          {fields.map((f) =>
            f.type === "input" ? (
              <div key={f.key}>
                <label className="block text-sm font-medium text-zinc-700 mb-1">
                  {f.label}
                </label>
                <input
                  className="w-full rounded-lg border border-zinc-300 bg-white p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-shadow"
                  placeholder={f.label}
                  value={form[f.key]}
                  onChange={(e) => update(f.key, e.target.value)}
                />
              </div>
            ) : (
              <div key={f.key}>
                <label className="block text-sm font-medium text-zinc-700 mb-1">
                  {f.label}
                </label>
                <textarea
                  className="w-full min-h-[80px] rounded-lg border border-zinc-300 bg-white p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-shadow"
                  placeholder={f.label}
                  value={form[f.key]}
                  onChange={(e) => update(f.key, e.target.value)}
                />
              </div>
            ),
          )}
        </div>

        {/* Generate Button */}
        <div className="mt-6">
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg bg-black px-6 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading && (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-500 border-t-white" />
            )}
            {loading ? "Generating..." : "Generate Resume"}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-sm font-medium text-red-800">Error</p>
            <p className="mt-1 text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* LaTeX Output */}
        {latex && !error && (
          <div className="mt-8 space-y-4">
            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              {/* Primary: Download PDF */}
              <button
                onClick={handleDownloadPDF}
                disabled={compiling}
                className="inline-flex items-center gap-2 rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {compiling ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-500 border-t-white" />
                ) : (
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                )}
                {compiling ? "Compiling PDF..." : "Download PDF"}
              </button>

              {/* Secondary: Download .tex */}
              <button
                onClick={handleDownloadTex}
                className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
                Download .tex
              </button>

              {/* Copy */}
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
                {copied ? "Copied!" : "Copy LaTeX"}
              </button>
            </div>

            {/* LaTeX Preview */}
            <div className="rounded-lg border border-zinc-200 bg-zinc-900 overflow-hidden">
              <div className="flex items-center justify-between border-b border-zinc-700 px-4 py-2">
                <span className="text-xs font-medium text-zinc-400">
                  LaTeX Source
                </span>
                <span className="text-xs text-zinc-500 font-mono">
                  {form.name
                    ? `${form.name.replace(/\s+/g, "_")}_Resume.tex`
                    : "Resume.tex"}
                </span>
              </div>
              <pre className="overflow-x-auto p-4 text-sm leading-relaxed text-green-400 font-mono max-h-[500px] overflow-y-auto">
                <code>{latex}</code>
              </pre>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!latex && !error && !loading && (
          <p className="mt-8 text-center text-sm text-zinc-400">
            Generated resume will appear here.
          </p>
        )}
      </div>
    </div>
  );
}
