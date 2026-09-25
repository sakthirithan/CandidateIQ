# Module: Recruiter Dashboard & Candidate Pool

## 1. Overview
Recruiter workspace for talent acquisition teams to post and edit job requisitions, review candidate pools, filter applicant pipelines by AI compatibility match score, schedule HR/Final interviews, compare candidates side-by-side, and consult the AI Recruitment Assistant IQ.

## 2. Status
✅ IMPLEMENTED

## 3. Business Purpose
Empowers recruiters to manage open hiring requisitions, evaluate candidate profiles with explainable AI evidence callouts, schedule interviews, and streamline candidate shortlisting.

## 4. Frontend Features
- Recruiter IQ Dashboard (`RecruiterIQDashboard.jsx`) with key recruitment metrics (Active Requisitions, Total Applicants, Shortlisted, Interview Stage, Time-to-Hire).
- Job Requisition Management (`RecruiterJobManagement.jsx`) supporting job creation, publishing, editing, and closing.
- Candidate Pool Management (`RecruiterCandidateManagement.jsx`) with search, role filters, match percentage sliders, candidate status badges, and HR interview scheduling modal.
- Candidate Intelligence Profile View (`CandidateIntelligenceProfile.jsx`) detailing candidate background, skill confidence, and evidence callouts.
- Candidate Comparison Matrix (`CandidateIQComparison.jsx`) comparing 2-4 candidates on technical, experience, and behavioural metrics.
- AI Recruitment Assistant IQ (`AIRecruitmentAssistantIQ.jsx`) providing conversational AI queries for candidate ranking and job description crafting.

## 5. Backend Features
- Job creation & management endpoints (`POST /api/jobs`, `GET /api/jobs`).
- Candidate applicants fetch endpoint (`GET /api/jobs/:id/applicants`).
- Candidate profile inspection endpoint (`GET /api/candidates/profile`).

## 6. Database / Schema
- Schemas: `Job` ([Job.js](file:///d:/Mini-Project/server/models/Job.js)), `Application` ([Application.js](file:///d:/Mini-Project/server/models/Application.js)), `CandidateProfile` ([CandidateProfile.js](file:///d:/Mini-Project/server/models/CandidateProfile.js))

## 7. Schema Fields
- `Job`: `{ title, department, description, requiredSkills, preferredSkills, experienceLevel, status, recruiter }`
- `Application`: `{ job, candidate, status, matchAnalysis, overallScore }`

## 8. API Endpoints
- `GET /api/jobs`
- `POST /api/jobs`
- `GET /api/jobs/:id/applicants`

## 9. Services
- `jobService.js` ([mockApi](file:///d:/Mini-Project/client/src/services/mockApi/jobService.js))
- `applicationService.js` ([mockApi](file:///d:/Mini-Project/client/src/services/mockApi/applicationService.js))
- `jobController.js` ([server](file:///d:/Mini-Project/server/controllers/jobController.js))

## 10. Components
- [`RecruiterIQDashboard.jsx`](file:///d:/Mini-Project/client/src/components/recruiter/RecruiterIQDashboard.jsx)
- [`RecruiterJobManagement.jsx`](file:///d:/Mini-Project/client/src/components/recruiter/RecruiterJobManagement.jsx)
- [`RecruiterCandidateManagement.jsx`](file:///d:/Mini-Project/client/src/components/recruiter/RecruiterCandidateManagement.jsx)
- [`CandidateIntelligenceProfile.jsx`](file:///d:/Mini-Project/client/src/components/recruiter/CandidateIntelligenceProfile.jsx)
- [`CandidateIQComparison.jsx`](file:///d:/Mini-Project/client/src/components/recruiter/CandidateIQComparison.jsx)
- [`AIRecruitmentAssistantIQ.jsx`](file:///d:/Mini-Project/client/src/components/recruiter/AIRecruitmentAssistantIQ.jsx)

## 11. Routes / Pages
- `/recruiter-dashboard`
- `/jobs-recruiter`
- `/candidates-recruiter`
- `/candidate-intelligence`
- `/comparison`
- `/assistant`

## 12. State Management
- React local state synchronized with `storageJobs`, `storageApplications`, and `storageInterviews` via `storageService.js`.

## 13. Dependencies
- [`storageService.js`](file:///d:/Mini-Project/client/src/services/storage/storageService.js)
- [`matchingService.js`](file:///d:/Mini-Project/client/src/services/mockApi/matchingService.js)

## 14. Consumers
- Enterprise HR & Recruiter Users.

## 15. Data Flow
```text
Recruiter Creates Job -> Published to Candidate Discovery -> Candidate Applies -> Application Streamed to Candidate Pool -> Recruiter Reviews & Shortlists -> Recruiter Schedules HR Interview -> Candidate Notified
```

## 16. External Dependencies
- Recharts (Metrics & charts), Lucide React icons.

## 17. Environment Variables
None required.

## 18. Current Limitations
None.

## 19. Known Issues
None.

## 20. Future Extensions
- Automated candidate email notification dispatching upon interview scheduling.

## 21. Source Files
- [`client/src/components/recruiter/RecruiterIQDashboard.jsx`](file:///d:/Mini-Project/client/src/components/recruiter/RecruiterIQDashboard.jsx)
- [`client/src/components/recruiter/RecruiterCandidateManagement.jsx`](file:///d:/Mini-Project/client/src/components/recruiter/RecruiterCandidateManagement.jsx)
- [`client/src/components/recruiter/RecruiterJobManagement.jsx`](file:///d:/Mini-Project/client/src/components/recruiter/RecruiterJobManagement.jsx)
