"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface AnalysisResult {
  atsScore?: number;
  industry?: string;
  sections?: Record<string, string>;
  missingSkills?: string[];
  suggestions?: string[];
  error?: string;
}

interface StoredReport {
  result: AnalysisResult;
  selectedFileName?: string | null;
  jobDescription?: string;
  createdAt?: string;
}

function getScoreColor(score: number) {
  if (score >= 80) return "text-green-600";
  if (score >= 60) return "text-yellow-600";
  return "text-red-600";
}

function getScoreBg(score: number) {
  if (score >= 80) return "bg-green-50 border-green-200";
  if (score >= 60) return "bg-yellow-50 border-yellow-200";
  return "bg-red-50 border-red-200";
}

export default function AnalyzeReportPage() {
  const router = useRouter();
  const [report] = useState<StoredReport | null>(() => {
    if (typeof window === "undefined") {
      return null;
    }

    const raw = sessionStorage.getItem("resume-analysis-report");
    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw) as StoredReport;
    } catch {
      sessionStorage.removeItem("resume-analysis-report");
      return null;
    }
  });

  useEffect(() => {
    if (!report) {
      router.replace("/analyze");
    }
  }, [report, router]);

  if (!report) {
    return null;
  }

  const { result, selectedFileName, jobDescription, createdAt } = report;

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="mx-auto max-w-3xl px-6 py-12">
        <Link
          href="/analyze"
          className="inline-block mb-6 text-sm text-zinc-500 transition-colors hover:text-black"
        >
          &larr; Back to Analyze
        </Link>

        <div className="rounded-2xl border border-zinc-200 bg-white p-6">
          <h1 className="text-3xl font-bold text-zinc-900">Resume Analysis Report</h1>
          <p className="mt-2 text-sm text-zinc-600">
            {selectedFileName ? `File: ${selectedFileName}` : "Uploaded resume"}
          </p>
          {createdAt && (
            <p className="mt-1 text-sm text-zinc-500">
              Generated on {new Date(createdAt).toLocaleString()}
            </p>
          )}
          <p className="mt-3 text-sm text-zinc-600">
            {jobDescription?.trim()
              ? "This report includes job-description matching."
              : "This report is based on general ATS analysis without a job description."}
          </p>
        </div>

        <div className="mt-8 space-y-6">
          {result.atsScore !== undefined && (
            <div className={`rounded-lg border p-6 text-center ${getScoreBg(result.atsScore)}`}>
              <p className="text-sm font-medium uppercase tracking-wide text-zinc-600">
                ATS Score
              </p>
              <p className={`mt-2 text-5xl font-bold ${getScoreColor(result.atsScore)}`}>
                {result.atsScore}
                <span className="text-2xl text-zinc-400">/100</span>
              </p>
              {result.industry && (
                <p className="mt-2 text-sm text-zinc-600">Industry: {result.industry}</p>
              )}
            </div>
          )}

          {result.sections && Object.keys(result.sections).length > 0 && (
            <div className="rounded-lg border border-zinc-200 bg-white">
              <div className="border-b border-zinc-200 px-6 py-4">
                <h3 className="font-semibold text-zinc-900">Section-by-Section Review</h3>
              </div>
              <div className="divide-y divide-zinc-100">
                {Object.entries(result.sections).map(([key, value]) => (
                  <div key={key} className="px-6 py-4">
                    <p className="text-sm font-medium capitalize text-zinc-900">{key}</p>
                    <p className="mt-1 text-sm text-zinc-600">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.missingSkills && result.missingSkills.length > 0 && (
            <div className="rounded-lg border border-zinc-200 bg-white p-6">
              <h3 className="font-semibold text-zinc-900">Missing Skills</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {result.missingSkills.map((skill, index) => (
                  <span
                    key={index}
                    className="rounded-full border border-red-200 bg-red-50 px-3 py-1 text-sm text-red-700"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {result.suggestions && result.suggestions.length > 0 && (
            <div className="rounded-lg border border-zinc-200 bg-white p-6">
              <h3 className="font-semibold text-zinc-900">Suggestions</h3>
              <ul className="mt-3 space-y-2">
                {result.suggestions.map((suggestion, index) => (
                  <li key={index} className="flex gap-2 text-sm text-zinc-600">
                    <span className="mt-0.5 shrink-0 text-zinc-400">&#x2022;</span>
                    {suggestion}
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
