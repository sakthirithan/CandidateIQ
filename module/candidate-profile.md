# Module: Candidate Profile

## 1. Overview
Central intelligence hub for candidates to view and manage personal information, professional headline, skills matrix, work experience timeline, education history, projects, certifications, achievements, languages, uploaded resume versions, and profile completeness score.

## 2. Status
✅ IMPLEMENTED

## 3. Business Purpose
Provides a single source of truth for candidate qualifications, feeding data directly into Job Matching, ATS Resume Analysis, and AI Mock Interview question generation.

## 4. Frontend Features
- Dynamic profile completeness score gauge (0-100%).
- Resume Parser IQ trigger button for instant resume extraction.
- Multiple uploaded resumes list with "Set as Primary" toggle and version tags.
- Modals for adding/editing skills, experience, education, projects, certifications, languages, and achievements.
- Resume Source Indicator banner showing latest snapshot sync details.

## 5. Backend Features
- Candidate profile fetch endpoint (`GET /api/candidates/profile`).
- Candidate profile update endpoint (`PUT /api/candidates/profile`).
- Profile creation on initial registration.

## 6. Database / Schema
- Schema: `CandidateProfile` ([CandidateProfile.js](file:///d:/Mini-Project/server/models/CandidateProfile.js))

## 7. Schema Fields
- `_id`: ObjectId
- `user`: ObjectId (Ref: `User`, Required)
- `personalInfo`: `{ name, email, phone, location, headline, profilePhoto }`
- `education`: `[{ degree, institution, graduationYear, cgpa }]`
- `experience`: `[{ company, position, duration, responsibilities }]`
- `skills`: `{ technical: [String], soft: [String], frameworks: [String], databases: [String], tools: [String] }`
- `projects`: `[{ name, description, technologies: [String], role, url }]`
- `certifications`: `[{ name, issuer, date }]`
- `skillAnalysis`: `{ totalSkills, confidenceScore, topSkills, inferredLevels }`

## 8. API Endpoints
- `GET /api/candidates/profile`
- `PUT /api/candidates/profile`

## 9. Services
- `candidateService.js` ([mockApi](file:///d:/Mini-Project/client/src/services/mockApi/candidateService.js))
- `profileController.js` ([server](file:///d:/Mini-Project/server/controllers/profileController.js))

## 10. Components
- [`CandidateIQProfile.jsx`](file:///d:/Mini-Project/client/src/components/candidate/CandidateIQProfile.jsx)
- [`ResumeParserIQModal.jsx`](file:///d:/Mini-Project/client/src/components/candidate/ResumeParserIQModal.jsx)

## 11. Routes / Pages
- `/profile`

## 12. State Management
- Local React state synchronized with `mockCandidateService` and `storageService.js`.

## 13. Dependencies
- Resume Parser IQ Service (`resumeParserService.js`)
- Evidence Intelligence Service (`evidenceIntelligenceService.js`)

## 14. Consumers
- Job Matching Engine (`matchingService.js`)
- AI Question Generator (`interviewService.js`)
- Candidate Pool View (`RecruiterCandidateManagement.jsx`)

## 15. Data Flow
```text
User Edits Profile / Uploads Resume -> Resume Parser IQ -> Extract Structured Data -> CandidateProfile Storage -> Update Job Match Scores & Interview Questions
```

## 16. External Dependencies
- Lucide React icons.

## 17. Environment Variables
None required for standard profile rendering.

## 18. Current Limitations
None.

## 19. Known Issues
None.

## 20. Future Extensions
- LinkedIn profile URL auto-import.

## 21. Source Files
- [`client/src/components/candidate/CandidateIQProfile.jsx`](file:///d:/Mini-Project/client/src/components/candidate/CandidateIQProfile.jsx)
- [`server/controllers/profileController.js`](file:///d:/Mini-Project/server/controllers/profileController.js)
- [`server/models/CandidateProfile.js`](file:///d:/Mini-Project/server/models/CandidateProfile.js)
