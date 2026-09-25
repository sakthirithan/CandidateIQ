# MODULE: RECRUITER & HR MANAGEMENT — SPECIFICATION

## 1. MODULE OVERVIEW

The **Recruiter Module** enables HR professionals and talent acquisition leads to post and manage job requisitions, review candidate applications, analyze candidate AI match profiles, shortlist top candidates, schedule HR interviews, compare candidate metrics side-by-side, and consult the AI Recruitment Assistant.

---

## 2. EXISTING ROUTES & COMPONENTS

| Route | Main Component | Purpose |
| :--- | :--- | :--- |
| `/recruiter-dashboard` | `client/src/components/recruiter/RecruiterIQDashboard.jsx` | Overview of active jobs, applicant counts, pending reviews, scheduled interviews |
| `/jobs-recruiter` | `client/src/components/recruiter/RecruiterJobManagement.jsx` | Job creation, editing, publishing, status toggling, deletion |
| `/candidates-recruiter` | `client/src/components/recruiter/RecruiterCandidateManagement.jsx` | Candidate pipeline review, match filtering, shortlisting, HR interview scheduling |
| `/candidate-intelligence` | `client/src/components/recruiter/CandidateIntelligenceProfile.jsx` | Deep-dive candidate skill confidence and evidence callouts |
| `/comparison` | `client/src/components/recruiter/CandidateIQComparison.jsx` | Side-by-side comparison matrix for candidate metrics |
| `/assistant` | `client/src/components/recruiter/AIRecruitmentAssistantIQ.jsx` | AI-assisted candidate evaluation and job query assistant |

---

## 3. DATABASE MODELS & RELATIONSHIPS

The Recruiter Module interacts with the following MongoDB collections via Mongoose:

```text
User (Recruiter & Candidate)
   ↓
Job (created by Recruiter)
   ↓
Application (Candidate applied to Job)
   ↓
Interview (HR / Final Interview scheduled by Recruiter)
```

- **`User`** (`server/models/User.js`): Account credentials, role (`hr` / `recruiter`), payment status, activation.
- **`Job`** (`server/models/Job.js`): Title, department, description, skills, experience, status (`published`, `draft`, `closed`), recruiter ID (`recruiter`).
- **`Application`** (`server/models/Application.js`): Job reference, candidate reference, candidate profile reference, application status (`applied`, `under_review`, `shortlisted`, `rejected`, `selected`), match score analysis.
- **`Interview`** (`server/models/Interview.js`): Candidate reference, job reference, interview type, scheduled date, difficulty, evaluation scores.

---

## 4. API SPECIFICATION (`/api/recruiter` or `/api/jobs` / `/api/analytics`)

Recruiter operations require backend protection (`protect` + `authorize('hr', 'recruiter', 'admin')`).

### Endpoints:
1. `GET /api/jobs/recruiter/dashboard` — Returns recruiter-specific metrics (Active Jobs, Total Applicants, Shortlisted, Interviews Scheduled).
2. `GET /api/jobs/recruiter/jobs` — Returns jobs created by authenticated recruiter.
3. `POST /api/jobs` — Creates a new job posting assigned to `req.user._id`.
4. `PATCH /api/jobs/:id` — Updates job details or status (`published`, `draft`, `closed`).
5. `DELETE /api/jobs/:id` — Deletes job requisition.
6. `GET /api/jobs/recruiter/applications` — Returns applications for jobs posted by recruiter.
7. `PATCH /api/jobs/applications/:id/status` — Updates application status (`shortlisted`, `rejected`, `under_review`).
8. `POST /api/interviews/schedule` — Schedules an HR/technical interview with a candidate.
9. `GET /api/interviews/recruiter` — Returns scheduled interviews for recruiter's jobs.

---

## 5. MANDATORY CONFIRMATION DIALOG FLOWS

All high-impact recruiter actions must invoke an interactive confirmation modal:
- **Create Job**: Prompt confirmation before writing to MongoDB.
- **Edit Job**: Prompt confirmation before saving updates.
- **Publish / Close Job**: Prompt confirmation before updating job status.
- **Delete Job**: Prompt confirmation before deleting from MongoDB.
- **Shortlist / Reject Candidate**: Prompt confirmation before updating application status.
- **Schedule HR Interview**: Prompt confirmation before creating interview record.

---

## 6. HR-FRIENDLY SIDEBAR NAVIGATION

Existing technical labels are mapped to clear HR terminology:

| Original/Internal Name | HR-Friendly Display Label | Stable Route |
| :--- | :--- | :--- |
| `Recruiter Dashboard` | **Dashboard** | `/recruiter-dashboard` |
| `Job Management` | **Jobs** | `/jobs-recruiter` |
| `Candidate Management` | **Candidates & Applications** | `/candidates-recruiter` |
| `Candidate Intelligence` | **Candidate Intelligence** | `/candidate-intelligence` |
| `Candidate Comparison` | **Compare Candidates** | `/comparison` |
| `AI Assistant` | **AI Assistant** | `/assistant` |
