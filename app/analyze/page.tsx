"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

async function extractResumeText(file: File) {
  const lowerName = file.name.toLowerCase();

  if (lowerName.endsWith(".txt")) {
    return (await file.text()).trim();
  }

  if (lowerName.endsWith(".pdf")) {
    const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
    pdfjs.GlobalWorkerOptions.workerSrc = new URL(
      "pdfjs-dist/legacy/build/pdf.worker.min.mjs",
      import.meta.url,
    ).toString();

    const data = new Uint8Array(await file.arrayBuffer());
    const loadingTask = pdfjs.getDocument({
      data,
      disableFontFace: true,
      isEvalSupported: false,
      useWorkerFetch: false,
    });

    const pdf = await loadingTask.promise;

    try {
      const pages = await Promise.all(
        Array.from({ length: pdf.numPages }, async (_, index) => {
          const page = await pdf.getPage(index + 1);
          const content = await page.getTextContent();

          return content.items
            .map((item) => ("str" in item ? item.str : ""))
            .join(" ")
            .trim();
        }),
      );

      return pages.filter(Boolean).join("\n\n").trim();
    } finally {
      await pdf.destroy();
    }
  }

  throw new Error("Unsupported file type. Please upload a PDF or TXT file.");
}

export default function AnalyzePage() {
  const router = useRouter();
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const hasResume = resumeText.trim().length > 0;

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);
    setSelectedFileName(file.name);

    try {
      const text = await extractResumeText(file);

      if (!text) {
        setError("File extraction failed: No readable text found in the uploaded file.");
      } else {
        setResumeText(text);
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to upload and extract the selected file.";
      setError(`File extraction failed: ${message}`);
      setSelectedFileName(null);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function handleAnalyze() {
    if (!resumeText.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText, jobDescription: jobDescription || undefined }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.error || `Server error (${res.status})`);
      }

      const data = await res.json();

      if (data.error) {
        setError(data.error);
      } else {
        sessionStorage.setItem(
          "resume-analysis-report",
          JSON.stringify({
            result: data,
            selectedFileName,
            jobDescription,
            createdAt: new Date().toISOString(),
          }),
        );
        router.push("/analyze/report");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Request failed. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
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

        <h2 className="text-3xl font-bold text-zinc-900">Resume Analyzer</h2>
        <p className="mt-2 text-zinc-600">
          Upload your resume, optionally add a job description, and run the analysis.
        </p>

        {/* File Upload */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-zinc-700 mb-2">
            Upload Resume (PDF or TXT)
          </label>
          <div className="flex items-center gap-3">
            <label className="cursor-pointer rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors">
              {uploading ? "Extracting..." : "Choose File"}
              <input
                ref={fileRef}
                type="file"
                accept=".pdf,.txt"
                onChange={handleFileUpload}
                disabled={uploading}
                className="hidden"
              />
            </label>
            {uploading && (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-300 border-t-black" />
            )}
          </div>
          <p className="mt-2 text-xs text-zinc-500">
            PDF text is extracted in your browser before analysis. Text files are also supported.
          </p>
          {selectedFileName && !uploading && (
            <p className="mt-2 text-sm text-zinc-600">Selected file: {selectedFileName}</p>
          )}
        </div>

        {/* Job Description */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-zinc-700 mb-2">
            Job Description <span className="text-zinc-400 font-normal">(optional)</span>
          </label>
          <textarea
            className="w-full min-h-[100px] rounded-lg border border-zinc-300 bg-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-shadow"
            value={jobDescription}
            onChange={(e) => {
              setJobDescription(e.target.value);
            }}
            placeholder="Paste a job description if you want role-specific matching..."
          />
        </div>

        {/* Analyze Button */}
        <div className="mt-6">
          <button
            onClick={handleAnalyze}
            disabled={loading || !hasResume}
            className="inline-flex items-center gap-2 rounded-lg bg-black px-6 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading && (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-500 border-t-white" />
            )}
            {loading ? "Analyzing..." : "Analyze Resume"}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-sm font-medium text-red-800">Error</p>
            <p className="mt-1 text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Empty state */}
        {!error && !loading && (
          <p className="mt-8 text-center text-sm text-zinc-400">
            Upload a resume to enable analysis.
          </p>
        )}
      </div>
    </div>
  );
}
