import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50">
      <main className="flex w-full max-w-3xl flex-col items-center justify-center py-32 px-6">
        <h1 className="text-5xl font-bold text-zinc-900 text-center">AI Resume Toolkit</h1>
        <p className="mt-4 max-w-xl text-center text-lg text-zinc-600">
          Analyze or generate ATS-friendly resumes using Google Gemini.
        </p>

        <div className="mt-10 flex w-full max-w-md flex-col gap-4 sm:flex-row">
          <Link
            href="/analyze"
            className="flex h-12 w-full items-center justify-center rounded-lg bg-black text-sm font-medium text-white hover:bg-zinc-800 transition-colors"
          >
            Analyze Resume
          </Link>
          <Link
            href="/create"
            className="flex h-12 w-full items-center justify-center rounded-lg border border-zinc-300 bg-white text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
          >
            Create Resume
          </Link>
        </div>

        <div className="mt-16 grid w-full max-w-lg grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-zinc-200 bg-white p-5">
            <h3 className="text-sm font-semibold text-zinc-900">ATS Analysis</h3>
            <p className="mt-1 text-sm text-zinc-500">
              Upload your resume and get ATS scoring with detailed feedback.
            </p>
          </div>
          <div className="rounded-lg border border-zinc-200 bg-white p-5">
            <h3 className="text-sm font-semibold text-zinc-900">JD Matching</h3>
            <p className="mt-1 text-sm text-zinc-500">
              Add a job description only if you want role-specific matching.
            </p>
          </div>
          <div className="rounded-lg border border-zinc-200 bg-white p-5">
            <h3 className="text-sm font-semibold text-zinc-900">Resume Generation</h3>
            <p className="mt-1 text-sm text-zinc-500">
              Create a professional, ATS-friendly resume from your details.
            </p>
          </div>
          <div className="rounded-lg border border-zinc-200 bg-white p-5">
            <h3 className="text-sm font-semibold text-zinc-900">PDF Export</h3>
            <p className="mt-1 text-sm text-zinc-500">
              Download your generated resume as a formatted PDF document.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
