# CandidateIQ — Component & Module Architecture Map

This document provides a comprehensive categorization of all UI components within `client/src/components/`, organized by functional module, folder location, shared usage, and page flow integration.

---

## 📁 1. Directory Structure & Module Organization

All components are organized into dedicated domain folders corresponding to CandidateIQ's 10 core candidate and recruiter modules:

```
client/src/components/
├── candidate/                  # Candidate Modules (01, 03, 04, 05, 07, 08, 09, 10)
│   ├── index.js                # Re-export barrel for candidate components
│   ├── CandidateIQDashboard.jsx
│   ├── CandidateDashboard.jsx
│   ├── CandidateIQProfile.jsx
│   ├── ResumeIntelligence.jsx
│   ├── ResumeUploader.jsx
│   ├── SkillIntelligence.jsx
│   ├── SkillGapIntelligence.jsx
│   ├── JobDiscovery.jsx
│   ├── JobMatchingView.jsx
│   ├── ApplicationTracker.jsx
│   ├── AIMockInterviewRoom.jsx
│   ├── MockInterviewRoom.jsx
│   └── InterviewResults.jsx
├── recruiter/                  # Recruiter Operations Modules (02, 06, 08, 09)
│   ├── index.js                # Re-export barrel for recruiter components
│   ├── RecruiterIQDashboard.jsx
│   ├── RecruiterDashboard.jsx
│   ├── RecruiterJobManagement.jsx
│   ├── CandidateIntelligenceProfile.jsx
│   ├── CandidateIQComparison.jsx
│   ├── CandidateComparison.jsx
│   ├── AIRecruitmentAssistantIQ.jsx
│   └── AIRecruitmentAssistant.jsx
├── common/                     # Shared Navigation, Topbar, Modals & Settings
│   ├── index.js                # Re-export barrel for common components
│   ├── Sidebar.jsx
│   ├── Topbar.jsx
│   ├── Navbar.jsx
│   ├── NotificationCenter.jsx
│   ├── SettingsPage.jsx
│   ├── SettingsModal.jsx
│   ├── ProfileMenu.jsx
│   ├── ProtectedRoute.jsx
│   └── ResponsibleAIDisclaimer.jsx
├── auth/                       # Authentication & Demo Subscriptions
│   ├── index.js                # Re-export barrel for auth components
│   ├── AuthModal.jsx
│   ├── LoginModal.jsx
│   ├── RegisterModal.jsx
│   └── PaymentDemoModal.jsx
├── demo/                       # Interactive Sandbox Demo
│   └── DemoModal.jsx
├── LandingPage.jsx             # Public SaaS Marketing Landing Page
└── COMPONENTS_MODULE_MAP.md    # Architectural Documentation & Component Matrix
```

---

## 📑 2. Detailed Component Reference Matrix

| Component | File Path | Category / Module | Where It Is Used / Shared | Responsibilities & Page Flow Integration |
| :--- | :--- | :--- | :--- | :--- |
| **LandingPage** | `components/LandingPage.jsx` | Module 01: Landing Page & Public Auth | Main `/landing` view in `App.jsx` | Public SaaS hero, feature showcase, interactive demo launcher, role switch preview, quick login/register triggers. |
| **CandidateIQDashboard** | `components/candidate/CandidateIQDashboard.jsx` | Module 01/03: Candidate Dashboard | `/dashboard` route in `App.jsx` | Candidate portal hub displaying profile strength, resume status, application metrics, quick navigation cards. |
| **CandidateIQProfile** | `components/candidate/CandidateIQProfile.jsx` | Module 03: Candidate Profile Management | `/profile` route in `App.jsx`, topbar link | 9 profile sections (Contact, Summary, Experience, Education, Projects, Certs, Socials, Skills, Preferences) with isolated CRUD modals. |
| **ResumeIntelligence** | `components/candidate/ResumeIntelligence.jsx` | Module 04: Resume Management | `/resume` route in `App.jsx` | Multi-stage resume parser simulation (5MB limit validation, upload dropzone, review screen: Accept/Edit/Reject). |
| **ResumeUploader** | `components/candidate/ResumeUploader.jsx` | Module 04: Resume Upload Helper | Sub-component inside `ResumeIntelligence.jsx` | Drag-and-drop resume upload zone with file type validation. |
| **SkillIntelligence** | `components/candidate/SkillIntelligence.jsx` | Module 05: Skill Intelligence | `/skills` route in `App.jsx` | 9 skill categories, interactive radar chart, confidence calculation, evidence tags, and skill CRUD modals. |
| **SkillGapIntelligence** | `components/candidate/SkillGapIntelligence.jsx` | Module 05: Skill Intelligence | `/skill-gaps` route in `App.jsx` | Comparative skill gap analysis against desired target roles with recommended learning paths. |
| **JobDiscovery** | `components/candidate/JobDiscovery.jsx` | Module 07: Candidate Job Discovery | `/jobs` route in `App.jsx` | Keyword search, 5 multi-field filters, sorting, job detail drawer, deterministic matching score, Apply/Save/Share actions. |
| **JobMatchingView** | `components/candidate/JobMatchingView.jsx` | Module 09: Candidate-Job Matching | Standalone/Sub-view in `App.jsx` | Breakdown of multi-dimensional matching scores (Technical, Skills, Experience, Education, Projects) with evidence callouts. |
| **ApplicationTracker** | `components/candidate/ApplicationTracker.jsx` | Module 08: Application Management | `/applications` route in `App.jsx` | Candidate application status pipeline (`Applied` -> `Under Review` -> `Shortlisted` -> `Interview` -> `Selected` / `Rejected`) & timeline tracker. |
| **AIMockInterviewRoom** | `components/candidate/AIMockInterviewRoom.jsx` | Module 10: AI Mock Interview | `/interview` route in `App.jsx` | Setup (Job, Type, Difficulty), step-by-step interview session state machine, speech voice simulation, answer recording. |
| **InterviewResults** | `components/candidate/InterviewResults.jsx` | Module 10: AI Mock Interview | `/interview-results` route in `App.jsx` | Comprehensive interview scorecard, response evaluation breakdown, confidence scores, and improvement tips. |
| **RecruiterIQDashboard** | `components/recruiter/RecruiterIQDashboard.jsx` | Module 06: Recruiter Operations | `/recruiter-dashboard` route in `App.jsx` | Recruiter operational portal showing active job requisitions, total applicants, AI matching highlights, pipeline metrics. |
| **RecruiterJobManagement** | `components/recruiter/RecruiterJobManagement.jsx` | Module 06: Recruiter Job Management | `/jobs-recruiter` route in `App.jsx` | Recruiter Job CRUD, multi-step Publish flow (`Draft` -> `Review` -> `Publish`), Close flow, status management. |
| **CandidateIntelligenceProfile** | `components/recruiter/CandidateIntelligenceProfile.jsx` | Module 08: Recruiter Applicant Review | `/candidates-recruiter` route in `App.jsx` | Recruiter review panel for applicants with status pipeline updates (`Under Review`, `Shortlisted`, `Interview`, `Selected`, `Rejected`). |
| **CandidateIQComparison** | `components/recruiter/CandidateIQComparison.jsx` | Recruiter Candidate Comparison | `/comparison` route in `App.jsx` | Side-by-side multi-candidate evaluation matrix comparing skills, experience, match scores, and interview ratings. |
| **AIRecruitmentAssistantIQ** | `components/recruiter/AIRecruitmentAssistantIQ.jsx` | Recruiter AI Assistant | `/assistant` route in `App.jsx` | Natural language AI recruitment co-pilot for candidate queries, job description generation, and candidate search. |
| **Sidebar** | `components/common/Sidebar.jsx` | Common / Shell | Global App Shell in `App.jsx` | Navigation sidebar with dynamic role switcher (Candidate, Recruiter/HR, Admin) updating active route and workspace context. |
| **Topbar** | `components/common/Topbar.jsx` | Common / Shell | Global App Header in `App.jsx` | Header bar containing active route title, search input, notification bell, workspace role pill, and user profile avatar dropdown. |
| **ProfileMenu** | `components/common/ProfileMenu.jsx` | Common / Shell | Used in `Topbar.jsx` and `LandingPage.jsx` | Dropdown menu offering Quick Profile, Account Settings, Role Switcher, and Logout functionality. |
| **SettingsModal** | `components/common/SettingsModal.jsx` | Common / Shell | Global Modal in `App.jsx` | User preferences, workspace configuration, API key setup, and account updates. |
| **NotificationCenter** | `components/common/NotificationCenter.jsx` | Common / Shell | Global Drawer in `App.jsx` | Real-time workspace notifications (Application status updates, job alerts, interview invites). |
| **SettingsPage** | `components/common/SettingsPage.jsx` | Common / Settings View | `/settings` route in `App.jsx` | Dedicated settings workspace page for profile, notifications, and integration management. |
| **ResponsibleAIDisclaimer** | `components/common/ResponsibleAIDisclaimer.jsx` | Common / AI Governance | Used in Recruiter & Interview components | Compliance disclaimer banner reinforcing AI explainability and unbiased scoring rules. |
| **LoginModal** | `components/auth/LoginModal.jsx` | Auth Module | Global Modal in `App.jsx` & `LandingPage.jsx` | Account login modal with quick demo accounts auto-fill for Candidate and Recruiter roles. |
| **RegisterModal** | `components/auth/RegisterModal.jsx` | Auth Module | Global Modal in `App.jsx` & `LandingPage.jsx` | User registration modal with candidate and HR account creation options. |
| **PaymentDemoModal** | `components/auth/PaymentDemoModal.jsx` | Auth / Demo Subscription | Global Modal in `App.jsx` & Auth flow | Interactive ₹1 HR Demo Subscription activation modal for unlocking recruiter capabilities. |
| **DemoModal** | `components/demo/DemoModal.jsx` | Demo / Sandbox | Global Sandbox Modal in `App.jsx` | Onboarding tour and feature walkthrough modal. |

---

## 🔄 3. Application Workflow & Data Integration Flow

### Candidate Page Flow
```
Landing Page / Register
       ↓
Candidate IQ Dashboard (/dashboard)
       ↓
├── Profile Management (/profile) <── Syncs with mockCandidateService
├── Resume Intelligence (/resume) ──> Extracts Skills to Skill Intelligence
├── Skill Intelligence (/skills)  ──> Provides Candidate Skills to Matching Engine
├── Job Discovery (/jobs) ──────────> Calculates matchingService score vs Candidate Profile
│       ↓ (Apply Action)
├── Application Tracker (/applications) ──> Creates Application (Status: Applied)
└── AI Mock Interview (/interview) ───────> Stores answers in mockInterviewService -> (/interview-results)
```

### Recruiter Page Flow
```
Landing Page / HR Demo Login (₹1 Activated)
       ↓
Recruiter IQ Dashboard (/recruiter-dashboard)
       ↓
├── Job Management (/jobs-recruiter) ────> Create Job -> Review -> Publish (Visible in Job Discovery)
├── Candidate Intelligence (/candidates-recruiter) ──> Review Applicants -> Update Status Pipeline
├── Candidate Comparison (/comparison) ──> Compare Applicants Side-by-Side
└── AI Recruitment Assistant (/assistant) ──> Natural Language Talent Search & Insights
```

---

## 🧪 4. Shared Services & Central Mock Data Layer

All components consume centralized mock data services to ensure zero hardcoded fake UI states and smooth future transition to Express/MongoDB backend:

- **`mockCandidateService.js`**: Central candidate profile data, skills, education, experience, resume history.
- **`mockJobService.js`**: Job postings, job creation, publish/close status, job filters.
- **`mockApplicationService.js`**: Applications connecting Candidate + Job + Recruiter, pipeline state updates.
- **`matchingService.js`**: Multi-dimensional deterministic candidate-job matching engine (Technical, Skills, Experience, Education, Projects).
- **`interviewService.js`**: Interview question bank, active session state machine, recorded responses.
- **`analyticsService.js`**: Recruiter metrics, funnel analytics, AI match highlights.
- **`auth.js`**: User authentication state, role switcher logic, local storage persistence.
