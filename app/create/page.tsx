"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

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
  const router = useRouter();
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
  const [error, setError] = useState<string | null>(null);

  function update(field: string, value: string) {
    setForm((state) => ({ ...state, [field]: value }));
  }

  async function handleGenerate() {
    setLoading(true);
    setError(null);

    try {
      const payload = {
        name: form.name,
        email: form.email,
        phone: form.phone,
        skills: form.skills
          .split(",")
          .map((item) => item.trim())
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

      if (data.error || !data.resume) {
        throw new Error(data.error || "Unexpected response from server.");
      }

      sessionStorage.setItem(
        "generated-resume-report",
        JSON.stringify({
          resume: data.resume,
          createdAt: new Date().toISOString(),
        }),
      );
      router.push("/create/report");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Request failed. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="mx-auto max-w-3xl px-6 py-12">
        <Link
          href="/"
          className="mb-6 inline-block text-sm text-zinc-500 transition-colors hover:text-black"
        >
          &larr; Back to Home
        </Link>

        <h2 className="text-3xl font-bold text-zinc-900">Resume Creator</h2>
        <p className="mt-2 text-zinc-600">
          Fill in your details to generate an ATS-friendly resume PDF.
        </p>

        <div className="mt-6 space-y-3">
          {fields.map((field) =>
            field.type === "input" ? (
              <div key={field.key}>
                <label className="mb-1 block text-sm font-medium text-zinc-700">
                  {field.label}
                </label>
                <input
                  className="w-full rounded-lg border border-zinc-300 bg-white p-2.5 text-sm transition-shadow focus:border-transparent focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder={field.label}
                  value={form[field.key]}
                  onChange={(e) => update(field.key, e.target.value)}
                />
              </div>
            ) : (
              <div key={field.key}>
                <label className="mb-1 block text-sm font-medium text-zinc-700">
                  {field.label}
                </label>
                <textarea
                  className="min-h-[80px] w-full rounded-lg border border-zinc-300 bg-white p-2.5 text-sm transition-shadow focus:border-transparent focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder={field.label}
                  value={form[field.key]}
                  onChange={(e) => update(field.key, e.target.value)}
                />
              </div>
            ),
          )}
        </div>

        <div className="mt-6">
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg bg-black px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading && (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-500 border-t-white" />
            )}
            {loading ? "Generating..." : "Generate Resume"}
          </button>
        </div>

        {error && (
          <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-sm font-medium text-red-800">Error</p>
            <p className="mt-1 text-sm text-red-600">{error}</p>
          </div>
        )}

        {!error && !loading && (
          <p className="mt-8 text-center text-sm text-zinc-400">
            Your generated resume PDF will be prepared on the next page.
          </p>
        )}
      </div>
    </div>
  );
}
