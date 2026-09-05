# CANDIDATEIQ — FRONTEND-FIRST COMPLETE MODULE EXECUTION

## Project Strategy & Architecture Master Guide

**Product**: CandidateIQ — AI-Driven Candidate Profiling Using Technical and Behavioural Analytics  
**Goal**: Build and completely verify the frontend application first using realistic dummy data and functional CRUD operations before proceeding to backend end-to-end integration.

---

## 1. DEVELOPMENT STRATEGY

### Stage 1 — Frontend Completion (Active)
```text
Existing Frontend Audit → Design System → Layouts & Routing → Auth UI → Candidate Modules → Recruiter Modules → Admin Modules → AI Feature UI → Centralized Mock Services CRUD → Cross-module Workflows → Validation & Testing → Frontend Complete Gate
```

### Stage 2 — Backend Integration (Only after Stage 1 Gate Approval)
```text
Frontend Mock Data Services → API Contracts → Express/MongoDB Backend → Auth & JWT → Real CRUD APIs → AI Services → Frontend API Integration → E2E Verification
```

---

## 2. CENTRALIZED MOCK DATA & SERVICE ARCHITECTURE

```text
client/src/
├── data/
│   ├── mockUsers.js
│   ├── mockCandidates.js
│   ├── mockJobs.js
│   ├── mockApplications.js
│   ├── mockInterviews.js
│   └── mockAnalytics.js
└── services/
    ├── api.js (Real Axios Backend Bridge)
    └── mockApi/
        ├── authService.js
        ├── candidateService.js
        ├── jobService.js
        ├── applicationService.js
        ├── interviewService.js
        └── analyticsService.js
```

---

## 3. CORE MODULE PHASES & MATRIX

- **Phase 0**: Existing Project Audit & `PROJECT_AUDIT.md`
- **Phase 1**: Frontend Foundation, Design System & Shared UI
- **Phase 2**: Authentication & Role-Based Access (Candidate, Recruiter, Admin)
- **Phase 3**: Candidate Profile & Full CRUD (Education, Experience, Skills, Projects, Certifications)
- **Phase 4**: Resume Upload, File Validation & Mock AI Parsing
- **Phase 5**: AI Skill Analysis & Proficiency Evidence
- **Phase 6**: Job Management & Recruiter CRUD (Create, Edit, Delete, Publish, Close)
- **Phase 7**: Candidate Job Discovery, Search, Filtering & Saved Jobs
- **Phase 8**: Application Management & Multi-Stage Hiring Funnel
- **Phase 9**: Candidate-Job Matching & Explainable Match Scoring
- **Phase 10**: AI Mock Interview Room (Technical & Behavioural)
- **Phase 11**: Interview Analytics & Scorecard Breakdown
- **Phase 12**: Interactive Skill Gap Analysis
- **Phase 13**: Candidate Intelligence Profile (Unified Composite Score)
- **Phase 14**: Recruiter Command Dashboard & Interactive Analytics
- **Phase 15**: Candidate Pool Management & Filtering
- **Phase 16**: Multi-Candidate Side-by-Side Comparison Matrix
- **Phase 17**: AI Recruitment Intelligence Assistant Chat
- **Phase 18**: Admin System & AI Usage Analytics
- **Phase 19**: Global UX States (Loading, Empty, Error, Toast Feedback, Confirmation Dialogs)
- **Phase 20**: Responsive Layout Verification (Mobile, Tablet, Desktop)
- **Phase 21**: Frontend CRUD Matrix Verification
- **Phase 22**: Complete End-to-End Cross-Module Workflow Simulation
