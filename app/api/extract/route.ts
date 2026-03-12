import { NextResponse } from "next/server";
import * as pdfParse from "pdf-parse";

export async function POST(req: Request) {
  try {
    const { filename, data } = await req.json();
    if (!data) return NextResponse.json({ error: "Missing file data" }, { status: 400 });

    const buffer = Buffer.from(data, "base64");

    // If it's a PDF, try to extract text
    if (filename?.toLowerCase?.().endsWith(".pdf")) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const parseFn = (pdfParse as any).default ?? pdfParse;
        const parsed = await parseFn(buffer);
        return NextResponse.json({ text: (parsed as { text?: string }).text || "" });
      } catch (err) {
        console.error("PDF parse error", err);
        return NextResponse.json({ error: "Failed to parse PDF" }, { status: 500 });
      }
    }

    // Otherwise treat as plain text
    return NextResponse.json({ text: buffer.toString("utf-8") });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
