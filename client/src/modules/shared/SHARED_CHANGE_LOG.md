# CandidateIQ — Shared Module Change Log

All modifications to files in `shared/` / `common/` must be logged here to preserve cross-module compatibility.

---

## Change Log Entries

### Date: 2026-10-07
- **Agent/Developer**: Antigravity Assistant
- **Shared Element**: `Sidebar.jsx` (`client/src/components/common/Sidebar.jsx`)
- **File**: `client/src/components/common/Sidebar.jsx`
- **Change Description**: Removed legacy standalone `Profile Review` tab item from candidate navigation section.
- **Reason**: Integrated Profile Review functionality directly into `AI Mock Interview` (`AIMockInterviewRoom.jsx`) as an ATS-style Mock Interview Performance Review & Actionable Solution Workspace.
- **Consumers**: Candidate Navigation Sidebar.
- **Existing Behavior**: Sidebar rendered standalone "Profile Review" item.
- **New Behavior**: Sidebar renders clear "AI Mock Interview" item, which now hosts both assessment creation, room execution, ATS performance review, and actionable solutions.
- **Validation**: Verified build (`npm run build`) passed with zero errors. All sidebar buttons navigate to valid modules.

### Date: 2026-10-07
- **Agent/Developer**: Antigravity AI Engineering
- **Shared Element**: All Shared UI, Layout, Navigation, and Auth components (`client/src/components/common/*`, `client/src/components/auth/*`, `client/src/components/LandingPage.jsx`)
- **File**: Moved to `client/src/modules/shared/ui/components/`, `client/src/modules/shared/layout/components/`, `client/src/modules/shared/navigation/components/`, `client/src/modules/shared/auth/components/`, `client/src/modules/shared/landing/components/`
- **Change Description**: Executed physical relocation of shared UI primitives, layout headers/sidebars, search palettes, and auth modals into modular shared domain folders with a central barrel (`client/src/modules/shared/index.js`) and backward-compatible re-exports in `client/src/components/common/index.js`.
- **Reason**: Full compliance withCandidateIQ Architecture Governance (Rule #2, #3, #4).
- **Consumers**: Candidate, HR, Admin, and Guest routes across the application.
- **Existing Behavior**: Components sat in legacy flat folders.
- **New Behavior**: Components physically reside in `client/src/modules/shared/` with clean barrel exports.
- **Validation**: Verified with `npm run build` in `client/` (0 errors, 2641 modules compiled).
