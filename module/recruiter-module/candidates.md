# Candidate & Application Management Feature Specification

## 1. Overview
Enables recruiters to explore applicant pipelines, review AI candidate-job match percentages, shortlist top talent, reject unaligned applications, and inspect candidate intelligence profiles.

## 2. Business Purpose
Provides structured candidate evaluation workflows with explainable AI match scores and stage progression.

## 3. Current Status
`IMPLEMENTED`

## 4. Frontend Implementation
- Component: `client/src/components/recruiter/RecruiterCandidateManagement.jsx`
- Candidate Detail Cascade Tabs (`application` - Unstop-style submission snapshot, `profile`, `skills`, `jobMatch`, `skillGap`)
- Search bar and multi-field filters (Job, Match Score, Application Status)
- Mandatory confirmation dialogs on Shortlist and Reject actions.

## 5. Backend Implementation
- Controller: `server/controllers/jobController.js` (`getRecruiterApplications`, `updateApplicationStatus`, `applyToJob`)
- Endpoints: `GET /api/jobs/recruiter/applications`, `PATCH /api/jobs/applications/:id/status`, `POST /api/jobs/:id/apply`

## 6. Database Models
- `Application` (`server/models/Application.js`)
- `User` (`server/models/User.js`)
- `CandidateProfile` (`server/models/CandidateProfile.js`)
- `Job` (`server/models/Job.js`)

## 7. Database Fields Used
- `Application.job`, `Application.candidate`, `Application.recruiter`, `Application.candidateProfile`, `Application.resumeSnapshot`, `Application.candidateSnapshot`, `Application.professionalSnapshot`, `Application.expectedCompensation`, `Application.screeningAnswers`, `Application.termsAccepted`, `Application.status`, `Application.overallScore`, `Application.matchAnalysis`

## 8. API Endpoints
- `GET /api/jobs/recruiter/applications`
- `PATCH /api/jobs/applications/:id/status`
- `POST /api/jobs/:id/apply`
- `GET /api/jobs/candidate/my-applications`

## 9. Services
- `client/src/services/recruiter/recruiterService.js`

## 10. Components
- `RecruiterCandidateManagement.jsx`

## 11. Routes
- `/candidates-recruiter`

## 12. State Management
- React local state synchronized with MongoDB backend responses.

## 13. CRUD Operations
- Read: `recruiterService.getRecruiterApplications()`
- Update: `recruiterService.updateApplicationStatus()`

## 14. Confirmation Dialogs
- Confirmation modal displayed on Shortlist and Reject actions.

## 15. Data Flow
```text
Recruiter Selects Candidate -> Review Match Score -> Click Shortlist/Reject -> Confirmation Modal -> Confirm -> PATCH API -> MongoDB -> Refresh Pipeline
```

## 16. Connections With Other Modules
- Application statuses update Candidate Tracker (`/tracker`).

## 17. Authentication / Authorization
- Secured with `protect` and `authorize('hr', 'recruiter', 'admin')`.

## 18. Real Database Source
- MongoDB `applications`, `users`, and `candidateprofiles` collections.

## 19. Dependencies
- `matchingService.js`, `recruiterService.js`, `lucide-react`.

## 20. Current Limitations
- None.

## 21. Known Issues
- None.

## 22. Future Extensions
- Automated email dispatch upon shortlisting.

## 23. Source Files
- `client/src/components/recruiter/RecruiterCandidateManagement.jsx`
- `server/controllers/jobController.js`
