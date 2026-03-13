import { NextResponse } from "next/server";
import * as pdfjs from "pdfjs-dist/legacy/build/pdf.mjs";

export const runtime = "nodejs";

async function extractPdfText(buffer: Buffer) {
  const loadingTask = pdfjs.getDocument({
    data: new Uint8Array(buffer),
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

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") ?? "";

    let filename = "";
    let buffer: Buffer;

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file");

      if (!(file instanceof File)) {
        return NextResponse.json({ error: "Missing file upload" }, { status: 400 });
      }

      filename = file.name;
      buffer = Buffer.from(await file.arrayBuffer());
    } else {
      const body = await req.json();
      if (!body?.data) {
        return NextResponse.json({ error: "Missing file data" }, { status: 400 });
      }

      filename = body.filename ?? "";
      buffer = Buffer.from(body.data, "base64");
    }

    const lowerFilename = filename?.toLowerCase?.() ?? "";

    if (lowerFilename.endsWith(".pdf")) {
      try {
        const text = await extractPdfText(buffer);

        if (!text) {
          return NextResponse.json(
            { error: "PDF did not contain readable text. It may be image-only or scanned." },
            { status: 422 },
          );
        }

        return NextResponse.json({ text });
      } catch (err) {
        console.error("PDF parse error", err);
        return NextResponse.json({ error: "Failed to parse PDF" }, { status: 500 });
      }
    }

    if (lowerFilename.endsWith(".txt")) {
      const text = buffer.toString("utf-8").trim();
      if (!text) {
        return NextResponse.json({ error: "Text file is empty" }, { status: 422 });
      }

      return NextResponse.json({ text });
    }

    return NextResponse.json(
      { error: "Unsupported file type. Please upload a PDF or TXT file." },
      { status: 400 },
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
