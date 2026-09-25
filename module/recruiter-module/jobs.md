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
- `title`, `department`, `description`, `requiredSkills`, `preferredSkills`, `experienceLevel`, `education`, `location`, `employmentType`, `status`, `recruiter`

## 8. API Endpoints
- `POST /api/jobs`
- `GET /api/jobs/recruiter/my-jobs`
- `PATCH /api/jobs/:id`
- `DELETE /api/jobs/:id`

## 9. Services
- `client/src/services/recruiter/recruiterService.js`

## 10. Components
- `RecruiterJobManagement.jsx`

## 11. Routes
- `/jobs-recruiter`

## 12. State Management
- React local state updated via `recruiterService`.

## 13. CRUD Operations
- Create: `recruiterService.createJob()`
- Read: `recruiterService.getRecruiterJobs()`
- Update: `recruiterService.updateJob()`
- Delete: `recruiterService.deleteJob()`

## 14. Confirmation Dialogs
- Mandatory confirmation modal displayed for every Create, Update, Publish, Close, or Delete mutation prior to API execution.

## 15. Data Flow
```text
Recruiter Action -> Input Validation -> Confirmation Dialog -> Confirm -> API Request -> MongoDB -> Response -> Re-fetch & UI Update
```

## 16. Connections With Other Modules
- Jobs published here appear in Candidate Job Discovery (`/jobs`).

## 17. Authentication / Authorization
- Requires JWT token (`protect`) and `authorize('hr', 'recruiter', 'admin')`.

## 18. Real Database Source
- MongoDB `jobs` collection.

## 19. Dependencies
- `lucide-react`, `recruiterService.js`.

## 20. Current Limitations
- None.

## 21. Known Issues
- None.

## 22. Future Extensions
- Automated AI job description generator.

## 23. Source Files
- `client/src/components/recruiter/RecruiterJobManagement.jsx`
- `server/controllers/jobController.js`
- `server/routes/jobRoutes.js`
