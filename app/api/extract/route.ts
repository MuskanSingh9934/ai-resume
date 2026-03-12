import { NextResponse } from 'next/server';
import pdf from 'pdf-parse';

export async function POST(req: Request) {
  try {
    const { filename, data } = await req.json();
    if (!data) return NextResponse.json({ error: 'Missing file data' }, { status: 400 });

    const buffer = Buffer.from(data, 'base64');

    // If it's a PDF, try to extract text
    if (filename?.toLowerCase?.().endsWith('.pdf')) {
      try {
        const parsed: any = await pdf(buffer);
        return NextResponse.json({ text: parsed.text || '' });
      } catch (err) {
        console.error('PDF parse error', err);
        return NextResponse.json({ error: 'Failed to parse PDF' }, { status: 500 });
      }
    }

    // Otherwise treat as plain text
    return NextResponse.json({ text: buffer.toString('utf-8') });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
