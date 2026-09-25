# Module: Dedicated Job Interview Room

## 1. Overview
Standalone test room for recruiter-scheduled candidate technical, HR, and final evaluation rounds. Operates independently from header navigation to provide an anti-cheat proctored examination environment with full-screen focus, instructions screen, live response submission, and evaluation logging.

## 2. Status
✅ IMPLEMENTED

## 3. Business Purpose
Provides enterprise recruiters with a formal, proctored interview execution environment for candidate selection rounds, saving responses and evidence for candidate intelligence scoring.

## 4. Frontend Features
- Dedicated standalone route layout without topbar/sidebar distraction.
- Pre-interview setup & instructions view (`instructions` mode).
- Proctored examination room (`room` mode) with timer countdown, question list, and text/voice response input.
- Theme mode switcher (light/dark mode).
- Direct completion callback and result persistence.

## 5. Backend Features
- Recruiter interview scheduling (`scheduleHRInterview` in `applicationService.js`).
- Interview status tracking & answer persistence (`Interview` schema).

## 6. Database / Schema
- Schema: `Interview` ([Interview.js](file:///d:/Mini-Project/server/models/Interview.js))
- Local Storage Entity: `candidateiq_interviews`

## 7. Schema Fields
- `id`: String (e.g., `hr_int_101`, `final_int_102`)
- `candidateId`: String
- `candidateName`: String
- `jobId`: String
- `jobTitle`: String
- `company`: String
- `title`: String
- `type`: String (`'HR'`, `'FINAL'`, `'technical'`)
- `scheduledDate`: String
- `scheduledTime`: String
- `duration`: String
- `interviewer`: String
- `instructions`: String
- `meetingLink`: String
- `status`: String (`'Scheduled'`, `'In Progress'`, `'Completed'`)

## 8. API Endpoints
- `POST /api/interviews/generate`
- `POST /api/interviews/:id/submit`

## 9. Services
- `candidateIQService.js` ([services](file:///d:/Mini-Project/client/src/services/candidateIQ/candidateIQService.js))
- `storageService.js` (`storageInterviews`)

## 10. Components
- [`JobInterviewRoom.jsx`](file:///d:/Mini-Project/client/src/components/candidate/JobInterviewRoom.jsx)
- [`CandidateHRInterviews.jsx`](file:///d:/Mini-Project/client/src/components/candidate/CandidateHRInterviews.jsx)

## 11. Routes / Pages
- `/job-interview/:interviewId/instructions`
- `/job-interview/:interviewId/room`
- `/job-interview/:interviewId`
- `/hr-interviews`

## 12. State Management
- Local React state synchronized with `storageInterviews` in `storageService.js`.

## 13. Dependencies
- [`storageService.js`](file:///d:/Mini-Project/client/src/services/storage/storageService.js)
- [`candidateIQService.js`](file:///d:/Mini-Project/client/src/services/candidateIQ/candidateIQService.js)

## 14. Consumers
- Recruiter Candidate Management ([`RecruiterCandidateManagement.jsx`](file:///d:/Mini-Project/client/src/components/recruiter/RecruiterCandidateManagement.jsx))

## 15. Data Flow
```text
Recruiter Schedules HR/Final Round -> Candidate Sees Notification / HR Interviews List -> Launch Job Interview Room -> Instructions Screen -> Enter Room -> Submit Responses -> Save to storageInterviews -> Update Candidate Status
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
- Automated WebRTC screen recording option.

## 21. Source Files
- [`client/src/components/candidate/JobInterviewRoom.jsx`](file:///d:/Mini-Project/client/src/components/candidate/JobInterviewRoom.jsx)
- [`client/src/components/candidate/CandidateHRInterviews.jsx`](file:///d:/Mini-Project/client/src/components/candidate/CandidateHRInterviews.jsx)
