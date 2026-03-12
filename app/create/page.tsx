"use client";

import { useState } from "react";
import Link from "next/link";
import jsPDF from "jspdf";

interface ExperienceItem {
  company?: string;
  title?: string;
  start?: string;
  end?: string;
  bullets?: string[];
}

interface ResumeResult {
  name?: string;
  summary?: string;
  skills?: string[];
  experience?: ExperienceItem[] | string;
  education?: string[] | string;
  projects?: string[] | string;
  error?: string;
}

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
  const [result, setResult] = useState<ResumeResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  function update(field: string, value: string) {
    setForm((s) => ({ ...s, [field]: value }));
  }

  async function handleGenerate() {
    setLoading(true);
    setResult(null);
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
      } else {
        setResult(data);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Request failed. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  function handleDownloadPDF() {
    if (!result) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const maxWidth = pageWidth - margin * 2;
    let y = 20;

    function checkPageBreak(needed: number) {
      if (y + needed > doc.internal.pageSize.getHeight() - 20) {
        doc.addPage();
        y = 20;
      }
    }

    // Name (title)
    if (result.name) {
      doc.setFontSize(22);
      doc.setFont("helvetica", "bold");
      doc.text(result.name, pageWidth / 2, y, { align: "center" });
      y += 10;
    }

    // Contact info from form
    const contactParts = [form.email, form.phone].filter(Boolean);
    if (contactParts.length > 0) {
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(contactParts.join("  |  "), pageWidth / 2, y, { align: "center" });
      y += 10;
    }

    // Divider
    doc.setDrawColor(200);
    doc.line(margin, y, pageWidth - margin, y);
    y += 8;

    // Summary
    if (result.summary) {
      checkPageBreak(20);
      doc.setFontSize(13);
      doc.setFont("helvetica", "bold");
      doc.text("SUMMARY", margin, y);
      y += 7;
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      const lines = doc.splitTextToSize(result.summary, maxWidth);
      doc.text(lines, margin, y);
      y += lines.length * 5 + 6;
    }

    // Skills
    if (result.skills && result.skills.length > 0) {
      checkPageBreak(20);
      doc.setFontSize(13);
      doc.setFont("helvetica", "bold");
      doc.text("SKILLS", margin, y);
      y += 7;
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      const skillsText = Array.isArray(result.skills)
        ? result.skills.join(", ")
        : String(result.skills);
      const lines = doc.splitTextToSize(skillsText, maxWidth);
      doc.text(lines, margin, y);
      y += lines.length * 5 + 6;
    }

    // Experience
    if (result.experience) {
      checkPageBreak(20);
      doc.setFontSize(13);
      doc.setFont("helvetica", "bold");
      doc.text("EXPERIENCE", margin, y);
      y += 7;

      if (Array.isArray(result.experience)) {
        result.experience.forEach((exp) => {
          checkPageBreak(25);
          doc.setFontSize(11);
          doc.setFont("helvetica", "bold");
          const title = [exp.title, exp.company].filter(Boolean).join(" at ");
          doc.text(title || "Position", margin, y);
          y += 5;

          if (exp.start || exp.end) {
            doc.setFontSize(9);
            doc.setFont("helvetica", "italic");
            doc.text(`${exp.start || ""} - ${exp.end || "Present"}`, margin, y);
            y += 5;
          }

          if (exp.bullets && Array.isArray(exp.bullets)) {
            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            exp.bullets.forEach((bullet) => {
              checkPageBreak(8);
              const lines = doc.splitTextToSize(`• ${bullet}`, maxWidth - 5);
              doc.text(lines, margin + 5, y);
              y += lines.length * 5;
            });
          }
          y += 4;
        });
      } else {
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        const lines = doc.splitTextToSize(String(result.experience), maxWidth);
        doc.text(lines, margin, y);
        y += lines.length * 5 + 6;
      }
    }

    // Education
    if (result.education) {
      checkPageBreak(20);
      doc.setFontSize(13);
      doc.setFont("helvetica", "bold");
      doc.text("EDUCATION", margin, y);
      y += 7;
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");

      if (Array.isArray(result.education)) {
        result.education.forEach((edu) => {
          checkPageBreak(8);
          const lines = doc.splitTextToSize(
            typeof edu === "string" ? edu : JSON.stringify(edu),
            maxWidth,
          );
          doc.text(lines, margin, y);
          y += lines.length * 5 + 3;
        });
      } else {
        const lines = doc.splitTextToSize(String(result.education), maxWidth);
        doc.text(lines, margin, y);
        y += lines.length * 5 + 6;
      }
    }

    // Projects
    if (result.projects) {
      checkPageBreak(20);
      doc.setFontSize(13);
      doc.setFont("helvetica", "bold");
      doc.text("PROJECTS", margin, y);
      y += 7;
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");

      if (Array.isArray(result.projects)) {
        result.projects.forEach((proj) => {
          checkPageBreak(8);
          const lines = doc.splitTextToSize(
            typeof proj === "string" ? proj : JSON.stringify(proj),
            maxWidth,
          );
          doc.text(lines, margin, y);
          y += lines.length * 5 + 3;
        });
      } else {
        const lines = doc.splitTextToSize(String(result.projects), maxWidth);
        doc.text(lines, margin, y);
        y += lines.length * 5 + 6;
      }
    }

    const filename = result.name ? `${result.name.replace(/\s+/g, "_")}_Resume.pdf` : "Resume.pdf";
    doc.save(filename);
  }

  function renderArrayOrString(value: unknown): string[] {
    if (Array.isArray(value))
      return value.map((v) => (typeof v === "string" ? v : JSON.stringify(v)));
    if (typeof value === "string" && value) return [value];
    return [];
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
                <label className="block text-sm font-medium text-zinc-700 mb-1">{f.label}</label>
                <input
                  className="w-full rounded-lg border border-zinc-300 bg-white p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-shadow"
                  placeholder={f.label}
                  value={form[f.key]}
                  onChange={(e) => update(f.key, e.target.value)}
                />
              </div>
            ) : (
              <div key={f.key}>
                <label className="block text-sm font-medium text-zinc-700 mb-1">{f.label}</label>
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

        {/* Generated Resume Display */}
        {result && !error && (
          <div className="mt-8 space-y-6">
            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleDownloadPDF}
                className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Download as PDF
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(result, null, 2));
                }}
                className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
                Copy JSON
              </button>
            </div>

            {/* Resume Preview */}
            <div className="rounded-lg border border-zinc-200 bg-white">
              {/* Header */}
              <div className="border-b border-zinc-200 px-6 py-6 text-center">
                {result.name && <h3 className="text-2xl font-bold text-zinc-900">{result.name}</h3>}
                {(form.email || form.phone) && (
                  <p className="mt-1 text-sm text-zinc-500">
                    {[form.email, form.phone].filter(Boolean).join("  |  ")}
                  </p>
                )}
              </div>

              <div className="divide-y divide-zinc-100">
                {/* Summary */}
                {result.summary && (
                  <div className="px-6 py-5">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                      Summary
                    </h4>
                    <p className="mt-2 text-sm text-zinc-700 leading-relaxed">{result.summary}</p>
                  </div>
                )}

                {/* Skills */}
                {result.skills &&
                  (Array.isArray(result.skills) ? result.skills.length > 0 : true) && (
                    <div className="px-6 py-5">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                        Skills
                      </h4>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {(Array.isArray(result.skills) ? result.skills : [result.skills]).map(
                          (skill, i) => (
                            <span
                              key={i}
                              className="rounded-full bg-zinc-100 px-3 py-1 text-sm text-zinc-700"
                            >
                              {String(skill)}
                            </span>
                          ),
                        )}
                      </div>
                    </div>
                  )}

                {/* Experience */}
                {result.experience && (
                  <div className="px-6 py-5">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                      Experience
                    </h4>
                    <div className="mt-3 space-y-4">
                      {Array.isArray(result.experience) ? (
                        result.experience.map((exp: ExperienceItem, i: number) => (
                          <div key={i}>
                            <p className="text-sm font-semibold text-zinc-900">
                              {[exp.title, exp.company].filter(Boolean).join(" at ")}
                            </p>
                            {(exp.start || exp.end) && (
                              <p className="text-xs text-zinc-500">
                                {exp.start || ""} - {exp.end || "Present"}
                              </p>
                            )}
                            {exp.bullets && Array.isArray(exp.bullets) && (
                              <ul className="mt-1 space-y-1">
                                {exp.bullets.map((b, j) => (
                                  <li key={j} className="flex gap-2 text-sm text-zinc-600">
                                    <span className="text-zinc-400 shrink-0">&#x2022;</span>
                                    {b}
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-zinc-700 whitespace-pre-wrap">
                          {String(result.experience)}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Education */}
                {renderArrayOrString(result.education).length > 0 && (
                  <div className="px-6 py-5">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                      Education
                    </h4>
                    <div className="mt-2 space-y-1">
                      {renderArrayOrString(result.education).map((edu, i) => (
                        <p key={i} className="text-sm text-zinc-700">
                          {edu}
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                {/* Projects */}
                {renderArrayOrString(result.projects).length > 0 && (
                  <div className="px-6 py-5">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                      Projects
                    </h4>
                    <div className="mt-2 space-y-1">
                      {renderArrayOrString(result.projects).map((proj, i) => (
                        <p key={i} className="text-sm text-zinc-700">
                          {proj}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!result && !error && !loading && (
          <p className="mt-8 text-center text-sm text-zinc-400">
            Generated resume will appear here.
          </p>
        )}
      </div>
    </div>
  );
}
