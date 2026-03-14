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

function addWrappedText(
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight = 14,
) {
  const lines = doc.splitTextToSize(text, maxWidth);
  doc.text(lines, x, y);
  return y + lines.length * lineHeight;
}

function downloadResumePdf(resume: ResumeDocument) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageHeight = doc.internal.pageSize.getHeight();
  const left = 42;
  const right = 42;
  const maxWidth = doc.internal.pageSize.getWidth() - left - right;
  const pageBottom = pageHeight - 42;
  const accent = [24, 24, 27] as const;
  const muted = [82, 82, 91] as const;
  const light = [212, 212, 216] as const;
  let y = 46;

  function ensureSpace(minHeight = 40) {
    if (y + minHeight <= pageBottom) {
      return;
    }

    doc.addPage();
    y = 46;
  }

  function textBlockHeight(text: string, width: number, lineHeight = 14) {
    const lines = doc.splitTextToSize(text, width);
    return lines.length * lineHeight;
  }

  function section(title: string) {
    ensureSpace(36);
    doc.setDrawColor(...light);
    doc.setLineWidth(0.8);
    doc.line(left, y, left + maxWidth, y);
    y += 14;
    doc.setTextColor(...accent);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text(title.toUpperCase(), left, y);
    y += 16;
  }

  doc.setFillColor(250, 250, 250);
  doc.roundedRect(left - 14, y - 22, maxWidth + 28, 78, 10, 10, "F");
  doc.setDrawColor(235, 235, 235);
  doc.roundedRect(left - 14, y - 22, maxWidth + 28, 78, 10, 10, "S");

  doc.setTextColor(...accent);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.text(resume.name || "Resume", left, y);
  y += 22;

  doc.setTextColor(...muted);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  const contact = [resume.email, resume.phone].filter(Boolean).join(" | ");
  if (contact) {
    doc.text(contact, left, y);
    y += 16;
  } else {
    y += 8;
  }
  y += 22;

  if (resume.summary) {
    section("Professional Summary");
    doc.setTextColor(...muted);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10.5);
    ensureSpace(textBlockHeight(resume.summary, maxWidth, 14) + 12);
    y = addWrappedText(doc, resume.summary, left, y, maxWidth, 14);
    y += 8;
  }

  if (resume.skills && resume.skills.length > 0) {
    section("Skills");
    doc.setTextColor(...muted);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    const skillsText = resume.skills.join(", ");
    ensureSpace(textBlockHeight(skillsText, maxWidth, 14) + 12);
    y = addWrappedText(doc, skillsText, left, y, maxWidth, 14);
    y += 8;
  }

  if (resume.experience && resume.experience.length > 0) {
    section("Experience");
    for (const item of resume.experience) {
      const roleHeading = [item.title, item.company].filter(Boolean).join(" - ") || "Experience";
      const roleHeight = textBlockHeight(roleHeading, maxWidth - 90, 14);
      const bulletsHeight = (item.bullets || []).reduce((total, bullet) => {
        return total + textBlockHeight(`• ${bullet}`, maxWidth - 8, 14) + 4;
      }, 0);
      ensureSpace(roleHeight + bulletsHeight + 28);

      doc.setTextColor(...accent);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11.5);
      y = addWrappedText(doc, roleHeading, left, y, maxWidth - 90, 14);
      if (item.period) {
        doc.setTextColor(...muted);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9.5);
        doc.text(item.period, left + maxWidth, y - 14, { align: "right" });
      }
      y += 4;

      doc.setTextColor(...muted);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      for (const bullet of item.bullets || []) {
        ensureSpace(textBlockHeight(`• ${bullet}`, maxWidth - 8, 14) + 6);
        doc.setTextColor(161, 161, 170);
        doc.text("•", left + 8, y);
        doc.setTextColor(...muted);
        y = addWrappedText(doc, bullet, left + 18, y, maxWidth - 18, 14);
        y += 4;
      }
      y += 6;
    }
  }

  if (resume.projects && resume.projects.length > 0) {
    section("Projects");
    for (const project of resume.projects) {
      const projectName = project.name || "Project";
      const detailsHeight = (project.details || []).reduce((total, detail) => {
        return total + textBlockHeight(`• ${detail}`, maxWidth - 8, 14) + 4;
      }, 0);
      ensureSpace(18 + detailsHeight + 20);

      doc.setTextColor(...accent);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11.5);
      y = addWrappedText(doc, projectName, left, y, maxWidth, 14);
      y += 4;

      doc.setTextColor(...muted);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      for (const detail of project.details || []) {
        ensureSpace(textBlockHeight(`• ${detail}`, maxWidth - 8, 14) + 6);
        doc.setTextColor(161, 161, 170);
        doc.text("•", left + 8, y);
        doc.setTextColor(...muted);
        y = addWrappedText(doc, detail, left + 18, y, maxWidth - 18, 14);
        y += 4;
      }
      y += 6;
    }
  }

  if (resume.education && resume.education.length > 0) {
    section("Education");
    for (const item of resume.education) {
      const educationHeading = [item.degree, item.institution].filter(Boolean).join(" - ");
      const headingHeight = educationHeading ? textBlockHeight(educationHeading, maxWidth, 14) : 0;
      const detailsHeight = item.details ? textBlockHeight(item.details, maxWidth, 14) : 0;
      ensureSpace(headingHeight + detailsHeight + 18);

      if (educationHeading) {
        doc.setTextColor(...accent);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        y = addWrappedText(doc, educationHeading, left, y, maxWidth, 14);
      }
      if (item.details) {
        doc.setTextColor(...muted);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        y = addWrappedText(doc, item.details, left, y, maxWidth, 14);
      }
      y += 8;
    }
  }

  if (resume.certifications && resume.certifications.length > 0) {
    section("Certifications");
    doc.setTextColor(...muted);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    for (const cert of resume.certifications) {
      ensureSpace(textBlockHeight(`• ${cert}`, maxWidth - 8, 14) + 6);
      doc.setTextColor(161, 161, 170);
      doc.text("•", left + 8, y);
      doc.setTextColor(...muted);
      y = addWrappedText(doc, cert, left + 18, y, maxWidth - 18, 14);
      y += 4;
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
