# Module: Landing Page

## 1. Overview
The Public Landing Page serves as the primary marketing, product presentation, and entry portal for CandidateIQ. It highlights AI candidate profiling, ATS resume intelligence, automated mock interviews, and recruiter talent analytics.

## 2. Status
✅ IMPLEMENTED

## 3. Business Purpose
Demonstrates platform capability, engages prospective candidate/recruiter users, provides interactive product demos, and drives registration and login workflows.

## 4. Frontend Features
- Dynamic hero banner with AI Requisition preview.
- Interactive candidate and recruiter sandbox demo triggers.
- Live feature highlights (ATS Intelligence, AI Mock Interview, Evidence Analytics).
- Navigation header with direct role routing (Candidate, Recruiter, Admin).
- Footer with product links and responsible AI disclaimer.

## 5. Backend Features
N/A (Public static and client-rendered marketing interface).

## 6. Database / Schema
N/A

## 7. Schema Fields
N/A

## 8. API Endpoints
N/A

## 9. Services
- `mockNotificationService`: Used for unread count badge display.

## 10. Components
- [`LandingPage.jsx`](file:///d:/Mini-Project/client/src/components/LandingPage.jsx)
- [`Navbar.jsx`](file:///d:/Mini-Project/client/src/components/common/Navbar.jsx)

## 11. Routes / Pages
- `/` (Root route)

## 12. State Management
- Local React state (`isLoginModalOpen`, `isRegisterModalOpen`, `isDemoModalOpen`).

## 13. Dependencies
- Auth Modals ([`LoginModal.jsx`](file:///d:/Mini-Project/client/src/components/auth/LoginModal.jsx), [`RegisterModal.jsx`](file:///d:/Mini-Project/client/src/components/auth/RegisterModal.jsx))
- Sandbox Demo Modal ([`DemoModal.jsx`](file:///d:/Mini-Project/client/src/components/demo/DemoModal.jsx))

## 14. Consumers
- Guest Users, Unauthenticated Visitors.

## 15. Data Flow
```text
Guest Landing Page -> Open Login / Register / Demo Modal -> Auth Callback -> Navigate Dashboard
```

## 16. External Dependencies
- Lucide React icons.

## 17. Environment Variables
None required for public view.

## 18. Current Limitations
None.

## 19. Known Issues
None.

## 20. Future Extensions
- Dynamic customer testimonial carousel.

## 21. Source Files
- [`client/src/components/LandingPage.jsx`](file:///d:/Mini-Project/client/src/components/LandingPage.jsx)
