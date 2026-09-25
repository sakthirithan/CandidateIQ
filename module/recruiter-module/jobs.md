# Job Management Feature Specification

## 1. Overview
Enables recruiters to create, edit, publish, close, filter, and delete job requisitions.

## 2. Business Purpose
Streamlines hiring requisition lifecycle from drafting job descriptions to publishing positions and receiving applicant submissions.

## 3. Current Status
`IMPLEMENTED`

## 4. Frontend Implementation
- Component: `client/src/components/recruiter/RecruiterJobManagement.jsx`
- Interactive Job Creation Modal and Edit Modal
- Status filtering (`published`, `draft`, `closed`) and search
- Mandatory interactive confirmation dialogs on Create, Edit, Publish, Close, and Delete actions with loading indicators.

## 5. Backend Implementation
- Controller: `server/controllers/jobController.js` (`createJob`, `getRecruiterJobs`, `updateJob`, `deleteJob`)
- Endpoints: `POST /api/jobs`, `GET /api/jobs/recruiter/my-jobs`, `PATCH /api/jobs/:id`, `DELETE /api/jobs/:id`

## 6. Database Models
- `Job` (`server/models/Job.js`)

## 7. Database Fields Used
- `title`, `department`, `description`, `requiredSkills`, `preferredSkills`, `education`, `location`, `employmentType`, `status`, `recruiter`
- `experience`: `{ min: Number, max: Number, unit: String }` (e.g. `2–5 Years`)
- `salary`: `{ min: Number, max: Number, currency: String, period: String }` (e.g. `₹4 LPA – ₹8 LPA`)
- `experienceLevel` (legacy/derived display string fallback)

## 8. Validation Rules
- **Experience**: Minimum experience >= 0, Maximum experience >= Minimum experience. Supported units: `years`, `months`.
- **Salary**: Minimum salary >= 0, Maximum salary >= Minimum salary. Supported currencies: `INR`, `USD`, `EUR`, `GBP`. Supported periods: `year` (LPA), `month`.
- **Enforcement**: Validated on frontend before triggering confirmation modal and re-validated on backend Express controller (`400 Bad Request` if invalid).

## 9. API Endpoints
- `POST /api/jobs`: Accepts structured `experience` and `salary` payload, creates MongoDB job.
- `GET /api/jobs/recruiter/my-jobs`: Fetches recruiter's jobs with experience and salary.
- `PATCH /api/jobs/:id`: Updates job details including experience and salary.
- `DELETE /api/jobs/:id`

## 10. Services
- `client/src/services/recruiter/recruiterService.js`
- `client/src/utils/formatters.js` (`formatExperience`, `formatSalary`)

## 11. Components
- `RecruiterJobManagement.jsx`
- `JobDiscovery.jsx` (Candidate side)
- `JobDetailsView.jsx` (Candidate side)

## 12. Routes
- `/jobs-recruiter`

## 13. State Management
- React local state updated via `recruiterService`.

## 14. CRUD Operations
- Create: `recruiterService.createJob()`
- Read: `recruiterService.getRecruiterJobs()`
- Update: `recruiterService.updateJob()`
- Delete: `recruiterService.deleteJob()`

## 15. Confirmation Dialogs
- Mandatory confirmation modal displayed for every Create, Update, Publish, Close, or Delete mutation prior to API execution.
- Confirmation modal displays a structured summary of Job Title, Experience (formatted e.g. `2–5 Years`), Salary (formatted e.g. `₹4 LPA – ₹8 LPA`), and Location.

## 16. Data Flow
```text
Recruiter Form Input -> Frontend Validation -> Confirmation Modal Summary -> Confirm -> API Request -> Backend Validation -> MongoDB -> Recruiter UI & Candidate Job Discovery
```

## 17. Connections With Other Modules
- Jobs published here appear in Candidate Job Discovery (`/jobs`) and Candidate Job Details (`/candidate/job-details/:id`) with Experience and Salary cleanly formatted. Applications remain directly linked to the Job document.

## 18. Authentication / Authorization
- Requires JWT token (`protect`) and `authorize('hr', 'recruiter', 'admin')`.

## 19. Real Database Source
- MongoDB `jobs` collection.

## 20. Dependencies
- `lucide-react`, `recruiterService.js`, `formatters.js`.

## 21. Current Limitations
- None.

## 22. Known Issues
- None.

## 23. Future Extensions
- Automated AI job description generator.

## 24. Source Files
- `client/src/components/recruiter/RecruiterJobManagement.jsx`
- `client/src/utils/formatters.js`
- `server/controllers/jobController.js`
- `server/models/Job.js`
- `server/routes/jobRoutes.js`
