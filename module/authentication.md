# Module: Authentication & Access Control

## 1. Overview
Manages complete production-style user authentication, registration, password verification with `bcryptjs`, JWT session persistence, role-based access control (RBAC), data ownership enforcement, and protected route navigation across Candidate, HR / Recruiter, and Admin portals.

## 2. Status
✅ FULLY IMPLEMENTED & INTEGRATED

## 3. Business Purpose
Ensures secure user sign-up, sign-in, token session storage, and dual-layer role enforcement (Candidate, Recruiter/HR, Admin), protecting private candidate profile data and recruiter job management actions at both frontend and backend boundaries.

## 4. Frontend Features
- Sign Up Modal (`RegisterModal.jsx`) supporting Candidate & HR registration with role selection.
- Login Modal (`LoginModal.jsx`) with quick 1-click demo login auto-fill and password visibility toggle.
- HR Payment Demo Modal (`PaymentDemoModal.jsx`) for recruiter account activation flow (updates `paymentStatus` to `'paid'` and `activated` to `true`).
- Protected route wrapper (`ProtectedRoute.jsx`) with automatic loading, role permission checks, and workspace redirection.
- Centralized Axios client (`api.js`) with Bearer token injection and global `401 Unauthorized` interceptor.

## 5. Backend Features
- Registration controller (`POST /api/auth/register`) with input validation, email normalization, password length enforcement, and bcrypt hashing.
- Login controller (`POST /api/auth/login`) with credential verification and JWT generation.
- Session verification (`GET /api/auth/me`) returning safe user metadata without passwords.
- Authentication middleware (`authMiddleware.js`) reading Bearer token, verifying JWT, populating `req.user`, and enforcing RBAC (`authorize('candidate')`, `authorize('hr', 'recruiter')`, `authorize('admin')`).
- Data ownership checks across profile, resume, interview, and job APIs.

## 6. Database / Schema
- Schema: `User` ([User.js](file:///d:/Mini-Project/server/models/User.js))

## 7. Schema Fields
- `_id`: ObjectId / String
- `name`: String (Required, Trimmed)
- `email`: String (Required, Unique, Lowercase, Trimmed, Validated)
- `password`: String (Required, Minimum 6 chars, Select: false)
- `role`: String (Enum: `['candidate', 'hr', 'recruiter', 'admin']`, Default: `'candidate'`)
- `paymentStatus`: String (Enum: `['pending', 'paid']`, Default: `'pending'`)
- `activated`: Boolean (Default: `true` for candidates/admins, `false` for pending HR)
- `timestamps`: `createdAt`, `updatedAt`

## 8. Role Permission Matrix
| Module / Capability | Candidate | HR / Recruiter | Admin |
| :--- | :---: | :---: | :---: |
| **Candidate Profile** | Own profile only | View permitted candidates | Full access |
| **Resume & ATS Parsing** | Own resume only | View permitted candidates | Full access |
| **Job Discovery & View** | Allowed | Allowed | Allowed |
| **Job Creation & Edit** | Forbidden (403) | Own posted jobs | Full access |
| **Applications** | Own applications | Review candidate applications | Full access |
| **Mock & Job Interviews** | Practice own interviews | Review evaluations | Full access |
| **Analytics & Intelligence** | Own profile analytics | Recruiter overview & AI assistant | Full access |
| **User & Admin Management** | Forbidden (403) | Forbidden (403) | Full access |

## 9. API Endpoints
- `POST /api/auth/register`: Register candidate or HR user.
- `POST /api/auth/login`: Authenticate and receive JWT token + safe user object.
- `GET /api/auth/me`: Restore authenticated session user.

## 10. Services & Utilities
- `api.js` ([client](file:///d:/Mini-Project/client/src/services/api.js)): Axios instance with auth interceptor.
- `auth.js` ([utils](file:///d:/Mini-Project/client/src/utils/auth.js)): Hybrid API and localStorage session store.
- `authController.js` ([server](file:///d:/Mini-Project/server/controllers/authController.js)): Register, Login, GetMe.

## 11. Components
- [`LoginModal.jsx`](file:///d:/Mini-Project/client/src/components/auth/LoginModal.jsx)
- [`RegisterModal.jsx`](file:///d:/Mini-Project/client/src/components/auth/RegisterModal.jsx)
- [`PaymentDemoModal.jsx`](file:///d:/Mini-Project/client/src/components/auth/PaymentDemoModal.jsx)
- [`ProtectedRoute.jsx`](file:///d:/Mini-Project/client/src/components/common/ProtectedRoute.jsx)

## 12. State Management & Session Flow
1. User logs in -> Server issues JWT token -> Client saves `token` and `candidateiq_current_user` in `localStorage`.
2. Axios client attaches `Authorization: Bearer <token>` to all outgoing backend requests.
3. On page refresh -> Client invokes `restoreSession()` (`GET /api/auth/me`) -> Validates token & updates current user.
4. On logout -> Tokens & stored user object cleared -> Redirected to landing page.

## 13. Security Considerations
- **No Password Exposure**: Password field has `select: false` in User model; password hashes are never returned in JSON responses.
- **Dual-Layer RBAC**: Route protection enforced on both React frontend and Express backend.
- **Role Equivalence**: Normalizes `'hr'` and `'recruiter'` roles seamlessly across frontend and backend.
- **Ownership Scoping**: Candidates cannot inspect or modify other candidates' resumes, applications, or interviews.

## 14. Environment Variables
- `JWT_SECRET`: Secret key for signing JWT tokens.
- `JWT_EXPIRES_IN`: Token validity duration (Default: `7d`).
- `MONGODB_URI`: Connection string for MongoDB Atlas user store.

## 15. Source Files
- [`client/src/utils/auth.js`](file:///d:/Mini-Project/client/src/utils/auth.js)
- [`client/src/services/api.js`](file:///d:/Mini-Project/client/src/services/api.js)
- [`client/src/components/auth/LoginModal.jsx`](file:///d:/Mini-Project/client/src/components/auth/LoginModal.jsx)
- [`client/src/components/auth/RegisterModal.jsx`](file:///d:/Mini-Project/client/src/components/auth/RegisterModal.jsx)
- [`client/src/components/auth/PaymentDemoModal.jsx`](file:///d:/Mini-Project/client/src/components/auth/PaymentDemoModal.jsx)
- [`client/src/components/common/ProtectedRoute.jsx`](file:///d:/Mini-Project/client/src/components/common/ProtectedRoute.jsx)
- [`server/models/User.js`](file:///d:/Mini-Project/server/models/User.js)
- [`server/controllers/authController.js`](file:///d:/Mini-Project/server/controllers/authController.js)
- [`server/routes/authRoutes.js`](file:///d:/Mini-Project/server/routes/authRoutes.js)
- [`server/middleware/authMiddleware.js`](file:///d:/Mini-Project/server/middleware/authMiddleware.js)

