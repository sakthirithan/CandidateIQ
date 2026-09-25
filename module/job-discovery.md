# Module: Job Discovery & Candidate Applications

## 1. Overview
The Job Discovery module provides logged-in candidates with a dynamic job search and requisition exploration interface. It displays candidate-specific application states (`Not Applied`, `Applied`, `Under Review`, `Shortlisted`, `Interview Scheduled`, `Application Closed`), candidate match compatibility scores, filter controls, and direct application submission.

## 2. Status
✅ IMPLEMENTED

## 3. Business Purpose
Connects candidates with available enterprise job requisitions, calculates individual candidate-job compatibility, enforces duplicate application protection, and manages candidate tracking workflows.

## 4. Frontend Features
- Search bar filtering by title, company, description, or required skills (e.g. React, Python).
- Multi-dimensional filters (Location, Experience level, Employment Type, Department, Required Skill).
- Sorting controls (Match Score High to Low, Most Recent, Highest Salary).
- Candidate-specific application status badges on cards (`✓ Applied on Sep 20, 2026`, `Under Review`, `Shortlisted`, `Interview Scheduled`, `Application Closed`).
- Single-click job details navigation and direct "Apply Now" submission.

## 5. Backend Features
- Published jobs listing endpoint (`GET /api/jobs`) returning candidate-specific metadata (`isApplied`, `applicationId`, `appliedAt`, `status`).
- Job details endpoint (`GET /api/jobs/:id`).
- Application submission endpoint (`POST /api/jobs/:id/apply`) with duplicate application enforcement (`candidate + job`).

## 6. Database / Schema
- Schemas: `Job` ([Job.js](file:///d:/Mini-Project/server/models/Job.js)), `Application` ([Application.js](file:///d:/Mini-Project/server/models/Application.js))

## 7. Schema Fields
- `Application`: `{ candidate, job, status, matchAnalysis, overallScore, createdAt }`
- `Job`: `{ title, department, description, requiredSkills, preferredSkills, experienceLevel, location, salary, status }`

## 8. API Endpoints
- `GET /api/jobs`
- `GET /api/jobs/:id`
- `POST /api/jobs/:id/apply`

## 9. Services
- `jobService.js` ([mockApi](file:///d:/Mini-Project/client/src/services/mockApi/jobService.js))
- `applicationService.js` ([mockApi](file:///d:/Mini-Project/client/src/services/mockApi/applicationService.js))
- `jobController.js` ([server](file:///d:/Mini-Project/server/controllers/jobController.js))

## 10. Components
- [`JobDiscovery.jsx`](file:///d:/Mini-Project/client/src/components/candidate/JobDiscovery.jsx)
- [`JobDetailsView.jsx`](file:///d:/Mini-Project/client/src/components/candidate/JobDetailsView.jsx)
- [`JobTrackerView.jsx`](file:///d:/Mini-Project/client/src/components/candidate/JobTrackerView.jsx)

## 11. Routes / Pages
- `/jobs`
- `/jobs/:jobId`
- `/job-details`
- `/tracker`
- `/applications`

## 12. State Management
- Local React state synchronized with `mockApplicationService` and `storageService.js`.

## 13. Dependencies
- Candidate Profile (`mockCandidateService.js`)
- Matching Engine (`matchingService.js`)
- Auth Utils (`getCurrentUser()`)

## 14. Consumers
- Candidate Dashboard ([`CandidateIQDashboard.jsx`](file:///d:/Mini-Project/client/src/components/candidate/CandidateIQDashboard.jsx))
- AIMockInterviewRoom ([`AIMockInterviewRoom.jsx`](file:///d:/Mini-Project/client/src/components/candidate/AIMockInterviewRoom.jsx))

## 15. Data Flow
```text
Candidate Logs In -> GET /api/jobs -> Fetch Candidate Applications -> Calculate Candidate Match -> Display Job Card with Candidate Badge -> Apply Now -> Store Candidate+Job Application
```

## 16. External Dependencies
- Lucide React icons.

## 17. Environment Variables
None required.

## 18. Current Limitations
None.

## 19. Known Issues
None.

## 20. Future Extensions
- Saved job bookmarks sync across mobile devices.

## 21. Source Files
- [`client/src/components/candidate/JobDiscovery.jsx`](file:///d:/Mini-Project/client/src/components/candidate/JobDiscovery.jsx)
- [`client/src/components/candidate/JobDetailsView.jsx`](file:///d:/Mini-Project/client/src/components/candidate/JobDetailsView.jsx)
- [`server/controllers/jobController.js`](file:///d:/Mini-Project/server/controllers/jobController.js)
