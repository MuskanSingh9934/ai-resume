import { NextResponse } from "next/server";
import { makeSelfContained } from "@/lib/resume-cls";

export async function POST(req: Request) {
  try {
    const { latex } = await req.json();

    if (!latex || typeof latex !== "string") {
      return NextResponse.json({ error: "Missing LaTeX source" }, { status: 400 });
    }

    // Make the LaTeX self-contained so external compilers can handle it
    const selfContained = makeSelfContained(latex);

    // Try latexonline.cc
    const pdfBuffer = await compileWithLatexOnline(selfContained);

    if (!pdfBuffer) {
      return NextResponse.json(
        {
          error: "LaTeX compilation failed. You can download the .tex file and compile it locally.",
        },
        { status: 502 },
      );
    }

    return new Response(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="Resume.pdf"',
      },
    });
  } catch (err) {
    console.error("compile-latex error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

async function compileWithLatexOnline(latex: string): Promise<ArrayBuffer | null> {
  try {
    const res = await fetch("https://latexonline.cc/compile", {
      method: "POST",
      headers: { "Content-Type": "application/x-tex" },
      body: latex,
    });

    if (!res.ok) {
      console.error("latexonline.cc error:", res.status, await res.text().catch(() => ""));
      return null;
    }

    const contentType = res.headers.get("content-type") || "";
    if (!contentType.includes("pdf")) {
      console.error("latexonline.cc returned non-PDF content-type:", contentType);
      return null;
    }

    return await res.arrayBuffer();
  } catch (err) {
    console.error("latexonline.cc fetch error:", err);
    return null;
  }
}
