# Module: AI Mock Interview & Practice Room

## 1. Overview
Candidate-aware AI Mock Interview engine that generates personalized interview questions combining Candidate Profile skills/projects/skill gaps, Primary Resume analysis, and target Job Description requirements across MCQ, Voice, Text, and Random interview formats.

## 2. Status
✅ IMPLEMENTED

## 3. Business Purpose
Allows candidates to practice interactive technical and behavioural interview rounds tailored to specific job requisitions, evaluate response quality, track tab switches / anti-cheat signals, and build candidate intelligence.

## 4. Frontend Features
- Dynamic job creation flow loading real job title, company, and full description.
- Method format selection: MCQ (40 Qs), Voice (5/10 Qs), Text (10/15 Qs), Random (20 Qs).
- Difficulty selection: Easy, Medium, Hard, Random.
- 4-step AI generation progress indicator.
- Candidate guidelines & mandatory checkbox confirmation screen.
- Full-screen interactive test workspace with light/dark theme toggle, timer countdown, tab-switch monitoring, draft answer saving, and question navigator.
- Question origin source badge tag (`RESUME_PROJECT`, `SKILL_GAP`, `JOB_DESCRIPTION`, `RESUME_SKILL`).

## 5. Backend Features
- Question generation service (`generateInterviewQuestions` in `aiService.js`).
- Response evaluation endpoint (`POST /api/interviews/:id/submit`).
- Gemini LLM prompt customization with fallback heuristic question generators.

## 6. Database / Schema
- Schema: `Interview` ([Interview.js](file:///d:/Mini-Project/server/models/Interview.js))
- Local Storage Entity: `candidateiq_mock_interviews`

## 7. Schema Fields
- `_id`: ObjectId / String
- `candidate`: ObjectId / String
- `job`: ObjectId / String
- `title`: String
- `type`: String (`'technical'`, `'behavioural'`)
- `questions`: `[{ questionId, category, question, targetSkill, candidateResponse, score, feedback, source, sourceReference }]`
- `overallScore`: Number
- `scores`: `{ technical, communication, problemSolving, depth, relevance }`
- `status`: String (`'scheduled'`, `'in_progress'`, `'completed'`)

## 8. API Endpoints
- `POST /api/interviews/generate`
- `POST /api/interviews/:id/submit`
- `GET /api/interviews/history`

## 9. Services
- `interviewService.js` ([mockApi](file:///d:/Mini-Project/client/src/services/mockApi/interviewService.js))
- `interviewController.js` ([server](file:///d:/Mini-Project/server/controllers/interviewController.js))
- `aiService.js` ([server](file:///d:/Mini-Project/server/services/aiService.js))

## 10. Components
- [`AIMockInterviewRoom.jsx`](file:///d:/Mini-Project/client/src/components/candidate/AIMockInterviewRoom.jsx)
- [`ScheduleMockInterviewModal.jsx`](file:///d:/Mini-Project/client/src/components/candidate/ScheduleMockInterviewModal.jsx)
- [`CustomQuestionBankUploadModal.jsx`](file:///d:/Mini-Project/client/src/components/candidate/CustomQuestionBankUploadModal.jsx)

## 11. Routes / Pages
- `/interview`
- `/interview-results`

## 12. State Management
- Local React state synchronized with `storageMockInterviews` in `storageService.js`.

## 13. Dependencies
- Candidate Profile (`mockCandidateService.js`)
- Primary Resume (`storageResumes`)
- Job Requisitions (`mockJobService.js`)
- AI Provider (`interviewService.js` / `aiService.js`)

## 14. Consumers
- Profile Review Hub ([`ProfileReviewHub.jsx`](file:///d:/Mini-Project/client/src/components/candidate/ProfileReviewHub.jsx))
- Candidate Analytics ([`InterviewEvaluationAnalytics.jsx`](file:///d:/Mini-Project/client/src/components/candidate/InterviewEvaluationAnalytics.jsx))

## 15. Data Flow
```text
Select Job Requisition -> Extract AI Features -> Load Candidate Profile & Resume -> Generate Candidate-Aware Questions -> Interactive Test Session -> Submit Answers -> Compute AI Evaluation & Metrics -> Persist Attempt
```

## 16. External Dependencies
- Web Speech API (Browser speech-to-text), Lucide React icons.

## 17. Environment Variables
- `GEMINI_API_KEY`

## 18. Current Limitations
- Web Speech API recognition requires browser microphone permissions.

## 19. Known Issues
None.

## 20. Future Extensions
- Video stream emotion / eye-tracking analytics integration.

## 21. Source Files
- [`client/src/components/candidate/AIMockInterviewRoom.jsx`](file:///d:/Mini-Project/client/src/components/candidate/AIMockInterviewRoom.jsx)
- [`client/src/services/mockApi/interviewService.js`](file:///d:/Mini-Project/client/src/services/mockApi/interviewService.js)
- [`server/controllers/interviewController.js`](file:///d:/Mini-Project/server/controllers/interviewController.js)
