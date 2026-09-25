# Module: Resume Parser IQ & ATS Analyzer

## 1. Overview
Automated document processing engine that validates, extracts, structures, and scores uploaded candidate resumes (PDF, DOCX, TXT), generating an explainable ATS Keyword Match score, score breakdown, quality insights, and candidate profile synchronization.

## 2. Status
✅ IMPLEMENTED

## 3. Business Purpose
Eliminates manual profile entry by converting unstructured resume files into structured JSON data, evaluating resume quality against hiring standards, and feeding candidate data into Job Matching and AI Interview generation.

## 4. Frontend Features
- Drag-and-drop file uploader supporting `.pdf`, `.docx`, `.doc`, `.txt` up to 10 MB.
- 5-step parsing progress indicator (`Uploading` -> `Reading Syntax` -> `Extracting Entities` -> `ATS Scoring` -> `Building Profile`).
- ATS Score gauge (0-100) with 6-part weighted category breakdown bars.
- Quality Insights: Strengths, Weaknesses, Missing Keywords, Improvement Recommendations.
- Extracted section selector modal to apply parsed data to `CandidateProfile`.

## 5. Backend Features
- Resume upload controller (`POST /api/resumes/upload`) handling Multer file buffers.
- PDF text extraction via `pdf-parse`.
- Plain text normalization and fallback text parsing.
- Gemini AI JSON schema generation.

## 6. Database / Schema
- Local Storage Entity: `candidateiq_resumes`
- Backend Model: Mongoose `CandidateProfile` / In-Memory `storageResumes`

## 7. Schema Fields
- `id` / `resumeId`: String
- `candidateId`: String
- `filename`: String
- `fileSize`: Number
- `fileType`: String
- `uploadedAt`: Date String
- `isPrimary`: Boolean
- `version`: Number
- `atsScore`: Number
- `scoreBreakdown`: `{ keywordMatch, structure, skillsCoverage, experienceRelevance, projectRelevance, formatting }`
- `parsedData`: Object (Structured candidate profile)

## 8. API Endpoints
- `POST /api/resumes/upload`

## 9. Services
- `resumeParserService.js` ([mockApi](file:///d:/Mini-Project/client/src/services/mockApi/resumeParserService.js))
- `resumeController.js` ([server](file:///d:/Mini-Project/server/controllers/resumeController.js))
- `aiService.js` ([server](file:///d:/Mini-Project/server/services/aiService.js))

## 10. Components
- [`ResumeParserIQModal.jsx`](file:///d:/Mini-Project/client/src/components/candidate/ResumeParserIQModal.jsx)
- [`CandidateIQProfile.jsx`](file:///d:/Mini-Project/client/src/components/candidate/CandidateIQProfile.jsx)

## 11. Routes / Pages
- Accessed via `/profile` modal popup.

## 12. State Management
- `resumeParserService` handles multi-step parsing callbacks; results persist in `storageResumes`.

## 13. Dependencies
- [`storageService.js`](file:///d:/Mini-Project/client/src/services/storage/storageService.js)
- [`aiService.js`](file:///d:/Mini-Project/server/services/aiService.js)

## 14. Consumers
- `CandidateIQProfile.jsx`
- `matchingService.js` (Job Matching Engine)
- `interviewService.js` (Mock Interview Question Generator)

## 15. Data Flow
```text
File Upload -> FileReader / pdf-parse Text Extraction -> Gemini AI / Deterministic Extractor -> ATS Score Breakdown & Insights -> Candidate Profile Auto-Sync -> Persistent Local Storage
```

## 16. External Dependencies
- `pdf-parse` (Node.js PDF text extractor)
- `@google/generative-ai` (Gemini LLM API)

## 17. Environment Variables
- `GEMINI_API_KEY`

## 18. Current Limitations
- Fallback deterministic parser executes if Gemini API key is missing or fails.

## 19. Known Issues
None.

## 20. Future Extensions
- Optical Character Recognition (OCR) for scanned image resumes.

## 21. Source Files
- [`client/src/services/mockApi/resumeParserService.js`](file:///d:/Mini-Project/client/src/services/mockApi/resumeParserService.js)
- [`client/src/components/candidate/ResumeParserIQModal.jsx`](file:///d:/Mini-Project/client/src/components/candidate/ResumeParserIQModal.jsx)
- [`server/controllers/resumeController.js`](file:///d:/Mini-Project/server/controllers/resumeController.js)
