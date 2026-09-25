# Recruiter Dashboard Feature Specification

## 1. Overview
The Recruiter Dashboard provides HR professionals with real-time recruitment pipeline metrics, active job counts, pipeline applicant numbers, shortlisted counts, and scheduled interview telemetry directly from MongoDB.

## 2. Business Purpose
Allows recruiters to monitor open hiring requisitions, assess overall candidate pipeline throughput, track hiring velocity, and quickly navigate to job management or candidate review.

## 3. Current Status
`IMPLEMENTED`

## 4. Frontend Implementation
- Component: `client/src/components/recruiter/RecruiterIQDashboard.jsx`
- Renders 5 dynamic metric cards (Active Jobs, Total Applicants, Shortlisted, Interviews Scheduled, Selected Hires)
- Renders Candidate Pipeline Stage Breakdown funnel (`Applied` -> `Under Review` -> `Shortlisted` -> `Interview` -> `Selected`)
- Displays live candidate applications stream with search and status badges.

## 5. Backend Implementation
- Controller: `server/controllers/analyticsController.js` (`getRecruiterDashboardOverview`)
- Endpoints: `GET /api/analytics/recruiter-dashboard`

## 6. Database Models
- `Job` (`server/models/Job.js`)
- `Application` (`server/models/Application.js`)
- `Interview` (`server/models/Interview.js`)
- `CandidateProfile` (`server/models/CandidateProfile.js`)

## 7. Database Fields Used
- `Job.status` (`published`, `draft`, `closed`)
- `Application.status` (`applied`, `under_review`, `shortlisted`, `interview_scheduled`, `selected`, `rejected`)
- `Interview.status` (`scheduled`, `in_progress`, `completed`, `cancelled`)

## 8. API Endpoints
- `GET /api/analytics/recruiter-dashboard`
- `GET /api/jobs/recruiter/my-jobs`
- `GET /api/jobs/recruiter/applications`
- `GET /api/interviews/recruiter`

## 9. Services
- `client/src/services/recruiter/recruiterService.js`

## 10. Components
- `RecruiterIQDashboard.jsx`

## 11. Routes
- `/recruiter-dashboard`

## 12. State Management
- Local React state populated asynchronously via `recruiterService.getDashboardStats()` and `getRecruiterApplications()`.

## 13. CRUD Operations
- Read: Recruiter dashboard metric aggregation reads.

## 14. Confirmation Dialogs
- N/A for dashboard read operations.

## 15. Data Flow
```text
Recruiter Login -> JWT Auth -> GET /api/analytics/recruiter-dashboard -> Query MongoDB -> Aggregate Counts -> Render RecruiterIQDashboard
```

## 16. Connections With Other Modules
- Connects to Job Management (`/jobs-recruiter`), Candidate Management (`/candidates-recruiter`), and Candidate Comparison (`/comparison`).

## 17. Authentication / Authorization
- Secured with `protect` and `authorize('hr', 'recruiter', 'admin')`.

## 18. Real Database Source
- MongoDB `jobs`, `applications`, `interviews`, and `candidateprofiles` collections.

## 19. Dependencies
- `axios` (`api.js`), `recharts`, `lucide-react`.

## 20. Current Limitations
- None.

## 21. Known Issues
- None.

## 22. Future Extensions
- Configurable widget layouts for enterprise HR teams.

## 23. Source Files
- `client/src/components/recruiter/RecruiterIQDashboard.jsx`
- `client/src/services/recruiter/recruiterService.js`
- `server/controllers/analyticsController.js`
