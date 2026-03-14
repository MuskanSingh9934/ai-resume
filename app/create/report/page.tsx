"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import jsPDF from "jspdf";

interface ResumeEducation {
  degree?: string;
  institution?: string;
  details?: string;
}

interface ResumeExperience {
  title?: string;
  company?: string;
  period?: string;
  bullets?: string[];
}

interface ResumeProject {
  name?: string;
  details?: string[];
}

interface ResumeDocument {
  name?: string;
  email?: string;
  phone?: string;
  summary?: string;
  skills?: string[];
  education?: ResumeEducation[];
  experience?: ResumeExperience[];
  projects?: ResumeProject[];
  certifications?: string[];
}

interface StoredResumeReport {
  resume: ResumeDocument;
  createdAt?: string;
}

function addWrappedText(doc: jsPDF, text: string, x: number, y: number, maxWidth: number) {
  const lines = doc.splitTextToSize(text, maxWidth);
  doc.text(lines, x, y);
  return y + lines.length * 6;
}

function downloadResumePdf(resume: ResumeDocument) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageHeight = doc.internal.pageSize.getHeight();
  const left = 48;
  const right = 48;
  const maxWidth = doc.internal.pageSize.getWidth() - left - right;
  let y = 56;

  function ensureSpace(minHeight = 40) {
    if (y + minHeight <= pageHeight - 40) {
      return;
    }

    doc.addPage();
    y = 56;
  }

  function section(title: string) {
    ensureSpace(32);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(title.toUpperCase(), left, y);
    y += 8;
    doc.setLineWidth(0.6);
    doc.line(left, y, left + maxWidth, y);
    y += 16;
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text(resume.name || "Resume", left, y);
  y += 18;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  const contact = [resume.email, resume.phone].filter(Boolean).join(" | ");
  if (contact) {
    doc.text(contact, left, y);
    y += 22;
  } else {
    y += 10;
  }

  if (resume.summary) {
    section("Professional Summary");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    y = addWrappedText(doc, resume.summary, left, y, maxWidth);
    y += 10;
  }

  if (resume.skills && resume.skills.length > 0) {
    section("Skills");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    y = addWrappedText(doc, resume.skills.join(", "), left, y, maxWidth);
    y += 10;
  }

  if (resume.experience && resume.experience.length > 0) {
    section("Experience");
    for (const item of resume.experience) {
      ensureSpace(60);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text(
        [item.title, item.company].filter(Boolean).join(" - ") || "Experience",
        left,
        y,
      );
      if (item.period) {
        doc.setFont("helvetica", "normal");
        doc.text(item.period, left + maxWidth, y, { align: "right" });
      }
      y += 14;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      for (const bullet of item.bullets || []) {
        ensureSpace(28);
        const lines = doc.splitTextToSize(`• ${bullet}`, maxWidth - 8);
        doc.text(lines, left + 8, y);
        y += lines.length * 6 + 4;
      }
      y += 6;
    }
  }

  if (resume.projects && resume.projects.length > 0) {
    section("Projects");
    for (const project of resume.projects) {
      ensureSpace(40);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text(project.name || "Project", left, y);
      y += 14;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      for (const detail of project.details || []) {
        ensureSpace(28);
        const lines = doc.splitTextToSize(`• ${detail}`, maxWidth - 8);
        doc.text(lines, left + 8, y);
        y += lines.length * 6 + 4;
      }
      y += 6;
    }
  }

  if (resume.education && resume.education.length > 0) {
    section("Education");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    for (const item of resume.education) {
      ensureSpace(34);
      const heading = [item.degree, item.institution].filter(Boolean).join(" - ");
      if (heading) {
        doc.setFont("helvetica", "bold");
        doc.text(heading, left, y);
        y += 14;
      }
      if (item.details) {
        doc.setFont("helvetica", "normal");
        y = addWrappedText(doc, item.details, left, y, maxWidth);
      }
      y += 10;
    }
  }

  if (resume.certifications && resume.certifications.length > 0) {
    section("Certifications");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    for (const cert of resume.certifications) {
      ensureSpace(20);
      doc.text(`• ${cert}`, left + 8, y);
      y += 16;
    }
  }

  const filename = resume.name ? `${resume.name.replace(/\s+/g, "_")}_Resume.pdf` : "Resume.pdf";
  doc.save(filename);
}

export default function CreateReportPage() {
  const router = useRouter();
  const [report] = useState<StoredResumeReport | null>(() => {
    if (typeof window === "undefined") {
      return null;
    }

    const raw = sessionStorage.getItem("generated-resume-report");
    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw) as StoredResumeReport;
    } catch {
      sessionStorage.removeItem("generated-resume-report");
      return null;
    }
  });

  useEffect(() => {
    if (!report) {
      router.replace("/create");
    }
  }, [report, router]);

  if (!report) {
    return null;
  }

  const { resume, createdAt } = report;

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="mx-auto max-w-3xl px-6 py-12">
        <Link
          href="/create"
          className="mb-6 inline-block text-sm text-zinc-500 transition-colors hover:text-black"
        >
          &larr; Back to Creator
        </Link>

        <div className="rounded-2xl border border-zinc-200 bg-white p-6">
          <h1 className="text-3xl font-bold text-zinc-900">Generated Resume</h1>
          <p className="mt-2 text-sm text-zinc-600">
            Your ATS-friendly resume is ready to download as PDF.
          </p>
          {createdAt && (
            <p className="mt-1 text-sm text-zinc-500">
              Generated on {new Date(createdAt).toLocaleString()}
            </p>
          )}
          <div className="mt-5">
            <button
              onClick={() => downloadResumePdf(resume)}
              className="inline-flex items-center gap-2 rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
            >
              Download PDF
            </button>
          </div>
        </div>

        <div className="mt-8 space-y-6">
          {resume.summary && (
            <div className="rounded-lg border border-zinc-200 bg-white p-6">
              <h3 className="font-semibold text-zinc-900">Summary</h3>
              <p className="mt-2 text-sm leading-6 text-zinc-600">{resume.summary}</p>
            </div>
          )}

          {resume.skills && resume.skills.length > 0 && (
            <div className="rounded-lg border border-zinc-200 bg-white p-6">
              <h3 className="font-semibold text-zinc-900">Skills</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {resume.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="rounded-full border border-zinc-200 bg-zinc-100 px-3 py-1 text-sm text-zinc-700"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {resume.experience && resume.experience.length > 0 && (
            <div className="rounded-lg border border-zinc-200 bg-white p-6">
              <h3 className="font-semibold text-zinc-900">Experience</h3>
              <div className="mt-4 space-y-4">
                {resume.experience.map((item, index) => (
                  <div key={index}>
                    <p className="text-sm font-medium text-zinc-900">
                      {[item.title, item.company].filter(Boolean).join(" - ")}
                    </p>
                    {item.period && <p className="mt-1 text-xs text-zinc-500">{item.period}</p>}
                    {item.bullets && item.bullets.length > 0 && (
                      <ul className="mt-2 space-y-2">
                        {item.bullets.map((bullet, bulletIndex) => (
                          <li key={bulletIndex} className="flex gap-2 text-sm text-zinc-600">
                            <span className="mt-0.5 shrink-0 text-zinc-400">&#x2022;</span>
                            {bullet}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {resume.projects && resume.projects.length > 0 && (
            <div className="rounded-lg border border-zinc-200 bg-white p-6">
              <h3 className="font-semibold text-zinc-900">Projects</h3>
              <div className="mt-4 space-y-4">
                {resume.projects.map((project, index) => (
                  <div key={index}>
                    <p className="text-sm font-medium text-zinc-900">{project.name}</p>
                    {project.details && project.details.length > 0 && (
                      <ul className="mt-2 space-y-2">
                        {project.details.map((detail, detailIndex) => (
                          <li key={detailIndex} className="flex gap-2 text-sm text-zinc-600">
                            <span className="mt-0.5 shrink-0 text-zinc-400">&#x2022;</span>
                            {detail}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {resume.education && resume.education.length > 0 && (
            <div className="rounded-lg border border-zinc-200 bg-white p-6">
              <h3 className="font-semibold text-zinc-900">Education</h3>
              <div className="mt-4 space-y-3">
                {resume.education.map((item, index) => (
                  <div key={index}>
                    <p className="text-sm font-medium text-zinc-900">
                      {[item.degree, item.institution].filter(Boolean).join(" - ")}
                    </p>
                    {item.details && <p className="mt-1 text-sm text-zinc-600">{item.details}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {resume.certifications && resume.certifications.length > 0 && (
            <div className="rounded-lg border border-zinc-200 bg-white p-6">
              <h3 className="font-semibold text-zinc-900">Certifications</h3>
              <ul className="mt-3 space-y-2">
                {resume.certifications.map((certification, index) => (
                  <li key={index} className="flex gap-2 text-sm text-zinc-600">
                    <span className="mt-0.5 shrink-0 text-zinc-400">&#x2022;</span>
                    {certification}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
