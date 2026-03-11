## Goals

### 1. Create Home Page

Create a homepage with:
Title: AI Resume Toolkit

Two buttons:

1️⃣ Analyze Resume
2️⃣ Create Resume

Buttons navigate to:

/analyze
/create

### 2. Build Resume Analyzer UI

Create page /analyze with:
Inputs:
Resume Textarea OR file upload
Optional Job Description textarea

Analyze Button

Output section:
ATS Score
Industry Level Review
Section-wise Feedback
Missing Skills
Suggestions

### 3. Create Gemini Analyze API

Create API route:

/api/analyze

Logic:

Receive:
resumeText
jobDescription (optional)

Prompt Gemini:
If JD exists:
Compare resume with JD
Give match score

If no JD:
Do ATS analysis
Return structured response.

### 4. Connect Analyzer Frontend

Call /api/analyze

Send resume text + JD

Display response in UI cards

Example sections:

ATS Score
Strengths
Weaknesses
Missing Skills
Suggestions

### 5. Build Resume Creator Form

Create /create page.

Form fields:

Name
Email
Phone
Skills
Education
Experience
Projects
Certifications
Summary

Submit button:

Generate Resume

### 6. Create Gemini Resume Generator API

Create API route:

/api/generate-resume

Process:

Receive user details

Send prompt to Gemini:

"Generate an ATS-friendly resume using this data"

Return formatted resume.

### 7. Display Generated Resume

Show result as:

Name
Summary
Skills
Experience
Education
Projects

Optional:

Allow copy

### 8. Allow download as PDF

Improve UI

Add:

Cards

Loading spinner

Clean layout

Responsive design

### 9. Add File Upload (Optional Advanced)

Allow:

Upload PDF resume

Extract text then send to Gemini.

### 10.Final Polish

Add:

Error handling

Loading states

Better prompts

Clean output formatting

### Final Project Features

Your app will have:

✅ Resume Analyzer
✅ JD Matching
✅ ATS Score
✅ Section Review
✅ Resume Creator
✅ Gemini AI Integration
