# AI Resume Toolkit

AI Resume Toolkit is a Next.js application for analyzing resumes and generating ATS-friendly resumes with Google Gemini. It supports resume review, job-description matching, AI-assisted resume creation, and PDF export.

## What It Does

This project helps users:

- upload a resume in PDF or TXT format
- analyze resume quality for ATS systems
- compare a resume against a job description
- generate a new ATS-friendly resume from user details
- export resume output as PDF

## Features

- Resume analysis with ATS-style scoring
- Job description matching for role-specific feedback
- AI-generated resume content using Gemini
- PDF and TXT resume text extraction
- Resume report pages for analysis and generated output
- PDF export support for generated resumes
- Mock fallback responses when AI output is unavailable

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- Google Generative AI SDK

## Setup

### 1. Clone the project

```bash
git clone <your-repository-url>
cd ai-resume
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root:

```env
GEMINI_API_KEY=your_google_gemini_api_key
```

Notes:

- `GEMINI_API_KEY` is optional, but recommended.
- If the key is missing or the AI response cannot be parsed, the app falls back to mock responses.
- The LaTeX PDF compile route uses `https://latexonline.cc/compile`, so that feature requires internet access.

### 4. Run the development server

```bash
npm run dev
```

Open `http://localhost:3000` in your browser.

### 5. Build for production

```bash
npm run build
npm start
```

## Project Structure

```text
ai-resume/
├── app/
│   ├── analyze/
│   │   ├── page.tsx
│   │   └── report/page.tsx
│   ├── api/
│   │   ├── analyze/route.ts
│   │   ├── compile-latex/route.ts
│   │   ├── extract/route.ts
│   │   └── generate-resume/route.ts
│   ├── create/
│   │   ├── page.tsx
│   │   └── report/page.tsx
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── lib/
│   ├── genai.ts
│   ├── helper.ts
│   └── resume-cls.ts
├── public/
├── rules/
├── package.json
└── README.md
```

## Folder Description

### `app/`

Main Next.js App Router code.

- `app/page.tsx`: landing page
- `app/analyze/page.tsx`: resume upload and analysis form
- `app/analyze/report/page.tsx`: analysis results page
- `app/create/page.tsx`: resume creation form
- `app/create/report/page.tsx`: generated resume preview and export page
- `app/api/*`: backend endpoints for extraction, analysis, resume generation, and PDF compilation

### `lib/`

Shared utility code.

- `lib/genai.ts`: Gemini API wrapper and mock fallback data
- `lib/helper.ts`: prompt templates for analysis and resume generation
- `lib/resume-cls.ts`: LaTeX helper utilities for self-contained resume output

### `public/`

Static assets used by the frontend.

### `rules/`

Project prompt and instruction files used by the app logic.

## API Endpoints

- `POST /api/extract`: extracts text from uploaded PDF or TXT files
- `POST /api/analyze`: analyzes resume text and optionally compares it with a job description
- `POST /api/generate-resume`: generates resume JSON from user input
- `POST /api/compile-latex`: compiles LaTeX resume content to PDF through an external service

## Notes

- Production builds use webpack in this project for build stability.
- PDF text extraction works best for text-based PDFs, not scanned image-only files.
- Some AI and PDF compilation features depend on external network access.
