# Module: Interview Evaluation Analytics & Reports

## 1. Overview
Multi-dimensional evaluation and reporting engine that calculates technical, behavioural, communication, problem-solving, and depth competency scores from completed candidate interview attempts, generating detailed radar charts, evidence callouts, and downloadable reports.

## 2. Status
✅ IMPLEMENTED

## 3. Business Purpose
Provides candidates with transparent performance feedback for self-improvement and equips recruiters with objective competency evidence to support hiring decisions.

## 4. Frontend Features
- Radar chart visualization comparing Candidate Competency Scores against Target Role Benchmarks.
- Breakdown scores: Technical (0-100), Communication (0-100), Problem Solving (0-100), Depth (0-100), Relevance (0-100).
- Behavioural Evidence callouts (STAR framework quotes, positive indicators, concern flags).
- Interview Review Detail view (`InterviewReviewDetail.jsx`) with question-by-question candidate response inspection.
- Interview Comparison Modal (`InterviewComparisonModal.jsx`) comparing historical mock attempts.
- Profile Review Hub (`ProfileReviewHub.jsx`) consolidating past evaluations, evidence intelligence, and comparison pages.

## 5. Backend Features
- Analytics dashboard endpoint (`GET /api/analytics/dashboard`).
- Interview evaluation endpoint (`POST /api/interviews/:id/submit`).

## 6. Database / Schema
- Schema: `Interview` ([Interview.js](file:///d:/Mini-Project/server/models/Interview.js))
- Local Storage Entity: `candidateiq_reviews`

## 7. Schema Fields
- `overallScore`: Number
- `scores`: `{ technical, communication, problemSolving, depth, relevance, behaviouralEvidence }`
- `evaluations`: `[{ questionId, question, candidateResponse, score, feedback, strength, improvement }]`

## 8. API Endpoints
- `GET /api/analytics/dashboard`
- `POST /api/interviews/:id/submit`

## 9. Services
- `analyticsService.js` ([mockApi](file:///d:/Mini-Project/client/src/services/mockApi/analyticsService.js))
- `evidenceIntelligenceService.js` ([mockApi](file:///d:/Mini-Project/client/src/services/mockApi/evidenceIntelligenceService.js))
- `analyticsController.js` ([server](file:///d:/Mini-Project/server/controllers/analyticsController.js))

## 10. Components
- [`InterviewEvaluationAnalytics.jsx`](file:///d:/Mini-Project/client/src/components/candidate/InterviewEvaluationAnalytics.jsx)
- [`ProfileReviewHub.jsx`](file:///d:/Mini-Project/client/src/components/candidate/ProfileReviewHub.jsx)
- [`InterviewReviewDetail.jsx`](file:///d:/Mini-Project/client/src/components/candidate/InterviewReviewDetail.jsx)
- [`DynamicInterviewReport.jsx`](file:///d:/Mini-Project/client/src/components/candidate/DynamicInterviewReport.jsx)
- [`InterviewComparisonModal.jsx`](file:///d:/Mini-Project/client/src/components/candidate/InterviewComparisonModal.jsx)

## 11. Routes / Pages
- `/profile-review`
- `/profile-review/compare`
- `/profile-review/:interviewId`
- `/interview-evaluation`
- `/interview-results`

## 12. State Management
- Local React state synchronized with `storageReviews` in `storageService.js`.

## 13. Dependencies
- Recharts (Radar, Bar, and Line charts), Lucide React icons.

## 14. Consumers
- Candidate Profile Hub, Recruiter Candidate Management.

## 15. Data Flow
```text
Complete Interview Session -> Compute Competency Scores -> Save Review Record -> Render Radar Charts & Behavioural Evidence -> Export Report
```

## 16. External Dependencies
- Recharts Library.

## 17. Environment Variables
None required.

## 18. Current Limitations
None.

## 19. Known Issues
None.

## 20. Future Extensions
- PDF export download generator.

## 21. Source Files
- [`client/src/components/candidate/InterviewEvaluationAnalytics.jsx`](file:///d:/Mini-Project/client/src/components/candidate/InterviewEvaluationAnalytics.jsx)
- [`client/src/components/candidate/ProfileReviewHub.jsx`](file:///d:/Mini-Project/client/src/components/candidate/ProfileReviewHub.jsx)
- [`server/controllers/analyticsController.js`](file:///d:/Mini-Project/server/controllers/analyticsController.js)
