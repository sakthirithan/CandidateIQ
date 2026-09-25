# HR Interview Management Feature Specification

## 1. Overview
Allows recruiters to schedule HR/technical screening interviews with shortlisted candidates, setting dates, start times, round types, and notes.

## 2. Business Purpose
Streamlines interview scheduling between recruiters and candidates, updating candidate application statuses to `interview_scheduled` and generating `Interview` records in MongoDB.

## 3. Current Status
`IMPLEMENTED`

## 4. Frontend Implementation
- Component: `client/src/components/recruiter/RecruiterCandidateManagement.jsx`
- Schedule HR Interview Modal with form inputs for Date, Time, Round Type, and Notes
- Submits scheduled interview data to backend API.

## 5. Backend Implementation
- Controller: `server/controllers/interviewController.js` (`scheduleInterview`, `getRecruiterInterviews`)
- Endpoints: `POST /api/interviews/schedule`, `GET /api/interviews/recruiter`

## 6. Database Models
- `Interview` (`server/models/Interview.js`)
- `Application` (`server/models/Application.js`)
- `Job` (`server/models/Job.js`)

## 7. Database Fields Used
- `Interview.candidate`, `Interview.job`, `Interview.jobTitle`, `Interview.interviewType`, `Interview.status`, `Interview.scheduledDate`, `Interview.notes`

## 8. API Endpoints
- `POST /api/interviews/schedule`
- `GET /api/interviews/recruiter`

## 9. Services
- `client/src/services/recruiter/recruiterService.js`

## 10. Components
- `RecruiterCandidateManagement.jsx`

## 11. Routes
- `/candidates-recruiter`

## 12. State Management
- React state updated via `recruiterService.scheduleInterview()`.

## 13. CRUD Operations
- Create: `recruiterService.scheduleInterview()`
- Read: `recruiterService.getRecruiterInterviews()`

## 14. Confirmation Dialogs
- Confirmation form modal for schedule submission.

## 15. Data Flow
```text
Recruiter -> Select Shortlisted Candidate -> Schedule HR Interview Modal -> Submit -> POST /api/interviews/schedule -> MongoDB -> Application status updated -> Refreshed
```

## 16. Connections With Other Modules
- Scheduled interviews appear in Candidate HR Interviews page (`/hr-interviews`).

## 17. Authentication / Authorization
- Secured with `protect` and `authorize('hr', 'recruiter', 'admin')`.

## 18. Real Database Source
- MongoDB `interviews` and `applications` collections.

## 19. Dependencies
- `recruiterService.js`.

## 20. Current Limitations
- None.

## 21. Known Issues
- None.

## 22. Future Extensions
- Google Calendar / Outlook integration.

## 23. Source Files
- `client/src/components/recruiter/RecruiterCandidateManagement.jsx`
- `server/controllers/interviewController.js`
