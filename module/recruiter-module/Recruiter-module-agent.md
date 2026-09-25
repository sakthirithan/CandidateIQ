# RECRUITER MODULE AGENT — MASTER EXECUTION INSTRUCTIONS

## ROLE

You are the implementation agent responsible for upgrading, reorganizing, connecting to real MongoDB data, and validating the **CandidateIQ Recruiter & HR Management Module**.

This file is the **entry-point instruction** for the Recruiter Module.

Before writing, modifying, deleting, or refactoring ANY code related to the Recruiter Module, you MUST read and understand the following files:

```text
module/recruiter-module/recruiter.md
module/recruiter-module/recruiter-checklist.md
module/recruiter-module/Recruiter-module-agent.md
```

These files together define:
- What the Recruiter Module must do
- The complete functional logic
- Database requirements
- API requirements
- CRUD requirements
- HR-friendly UI requirements
- Confirmation dialog rules
- Testing requirements
- Completion criteria

---

# 1. EXECUTION PRIORITY

Follow this priority order:

```text
Recruiter-module-agent.md
        ↓
recruiter.md
        ↓
Existing Project Architecture
        ↓
recruiter-checklist.md
        ↓
Audit & Planning
        ↓
Backend APIs & Authorization
        ↓
Frontend Services & UI Integration
        ↓
Confirmation Dialogs
        ↓
Sidebar HR Terminology Alignment
        ↓
Feature Reorganization
        ↓
Testing & Checklist Verification
        ↓
Final Report
```

---

# 2. PRIMARY OBJECTIVES

Transform the existing Recruiter Module from a frontend mock/localStorage implementation into a:

```text
REAL DATABASE-BACKED
REAL API-DRIVEN
RECRUITER-ISOLATED & AUTHORIZED
HR-FRIENDLY & CONFIRMED CRUD
TESTED
PRODUCTION-STYLE
RECRUITER MODULE
```

The final architecture should follow:

```text
Recruiter UI
   ↓
Frontend Recruiter Service
   ↓
Backend Recruiter API
   ↓
Authentication & Recruiter Authorization
   ↓
Validation
   ↓
Mongoose
   ↓
MongoDB
   ↓
API Response
   ↓
React State
   ↓
Recruiter UI
```

MongoDB must be the source of truth.

---

# 3. MANDATORY CONFIRMATION RULE

Every mutation or high-impact action MUST display a confirmation dialog before executing the API request.

This applies to:
- Create Job
- Edit / Update Job
- Publish / Unpublish / Close Job
- Delete Job
- Shortlist Candidate
- Reject / Update Application Status
- Schedule / Reschedule / Cancel HR Interview

If the user clicks **Cancel**, no API call, database mutation, or local state change occurs.

---

# 4. RECRUITER DATA ISOLATION

Recruiters must only see recruitment data that belongs to or is authorized for their account.
Data isolation must be enforced on the backend via authenticated user identity (`req.user._id`).

---

# 5. HR-FRIENDLY TERMINOLOGY

Rename sidebar tabs and technical display terms into intuitive HR terminology (e.g. `Dashboard`, `Jobs`, `Candidates`, `Applications`, `Interviews`, `Shortlisted`, `Reports`).
Internal route URLs should remain stable to prevent breaking existing navigation.
