"use client";

import { useState } from "react";

export default function CreatePage() {
  const [form, setForm] = useState<any>({
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
  const [result, setResult] = useState<any>(null);

  function update(field: string, value: string) {
    setForm((s: any) => ({ ...s, [field]: value }));
  }

  async function handleGenerate() {
    setLoading(true);
    setResult(null);
    try {
      const payload = {
        name: form.name,
        email: form.email,
        phone: form.phone,
        skills: form.skills
          .split(",")
          .map((s: string) => s.trim())
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
      <h2 className="text-2xl font-semibold">Resume Creator</h2>
      <p className="mt-2 text-sm text-zinc-600">Fill basic details and generate a resume.</p>

      <input
        className="mt-4 w-full rounded border p-2"
        placeholder="Name"
        value={form.name}
        onChange={(e) => update("name", e.target.value)}
      />
      <input
        className="mt-2 w-full rounded border p-2"
        placeholder="Email"
        value={form.email}
        onChange={(e) => update("email", e.target.value)}
      />
      <input
        className="mt-2 w-full rounded border p-2"
        placeholder="Phone"
        value={form.phone}
        onChange={(e) => update("phone", e.target.value)}
      />
      <input
        className="mt-2 w-full rounded border p-2"
        placeholder="Skills (comma separated)"
        value={form.skills}
        onChange={(e) => update("skills", e.target.value)}
      />
      <textarea
        className="mt-2 w-full rounded border p-2"
        placeholder="Summary"
        value={form.summary}
        onChange={(e) => update("summary", e.target.value)}
      />
      <textarea
        className="mt-2 w-full rounded border p-2"
        placeholder="Education"
        value={form.education}
        onChange={(e) => update("education", e.target.value)}
      />
      <textarea
        className="mt-2 w-full rounded border p-2"
        placeholder="Experience"
        value={form.experience}
        onChange={(e) => update("experience", e.target.value)}
      />
      <textarea
        className="mt-2 w-full rounded border p-2"
        placeholder="Projects"
        value={form.projects}
        onChange={(e) => update("projects", e.target.value)}
      />
      <textarea
        className="mt-2 w-full rounded border p-2"
        placeholder="Certifications"
        value={form.certifications}
        onChange={(e) => update("certifications", e.target.value)}
      />

      <div className="mt-4">
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="rounded bg-black px-4 py-2 text-white disabled:opacity-60"
        >
          {loading ? "Generating..." : "Generate Resume"}
        </button>
      </div>

      <div className="mt-6">
        {result ? (
          <pre className="rounded border bg-white p-4 text-sm">
            {JSON.stringify(result, null, 2)}
          </pre>
        ) : (
          <p className="text-sm text-zinc-500">Generated resume will appear here.</p>
        )}
      </div>
    </div>
  );
}
