import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-center py-32 px-6 bg-white dark:bg-black sm:items-start">
        <h1 className="text-4xl font-bold text-black dark:text-white">AI Resume Toolkit</h1>
        <p className="mt-4 max-w-xl text-lg text-zinc-600 dark:text-zinc-300">
          Analyze or generate ATS-friendly resumes using Google Gemini.
        </p>

        <div className="mt-10 flex w-full max-w-md flex-col gap-4 sm:flex-row">
          <Link
            href="/analyze"
            className="flex h-12 w-full items-center justify-center rounded-md bg-black text-white"
          >
            Analyze Resume
          </Link>
          <Link
            href="/create"
            className="flex h-12 w-full items-center justify-center rounded-md border border-black"
          >
            Create Resume
          </Link>
        </div>
      </main>
    </div>
  );
}
