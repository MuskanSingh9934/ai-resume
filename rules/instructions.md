Create a Next.js (App Router) project using TypeScript that has two main features: AI Resume Analyzer and AI Resume Creator using Google Gemini API.

Feature 1: Resume Analyzer

- Create a page where users can upload or paste their resume text.
- Add an optional field to paste a Job Description (JD).
- If JD is provided, compare the resume with the JD and provide a match score.
- If JD is not provided, perform a normal ATS-style resume analysis.

The AI analysis should include:

- ATS Score (out of 100)
- Industry-level analysis
- Section-by-section review (Summary, Skills, Experience, Education, Projects)
- Missing skills or keywords
- Suggestions for improvement

Feature 2: Resume Creator

- Create a form where users can enter basic resume details:
  - Name
  - Contact details
  - Skills
  - Education
  - Experience
  - Projects
  - Certifications

- Send the user data to Gemini and generate a professional ATS-friendly resume.
- Display the generated resume in a structured format.

Technical Requirements:

- Use Next.js App Router
- Use TypeScript
- Create API routes for Gemini requests
- Use @google/generative-ai package
- Use environment variable GEMINI_API_KEY
- Create two pages: /analyze and /create
- Keep UI simple with forms and result sections
- Return AI responses as structured text.
