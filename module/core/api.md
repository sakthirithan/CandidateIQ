# Core Module: API Client & REST Routing

## 1. Overview
Centralized HTTP client and Express REST routing architecture handling server communications, request authorization header injection, and global error handling.

## 2. Status
✅ IMPLEMENTED

## 3. Implementation Details
- Axios instance configured with base URL `/api`.
- Request interceptor injecting `Authorization: Bearer <token>` from localStorage session.
- Response interceptor handling status codes (401 Unauthorized, 403 Forbidden, 404 Not Found, 500 Internal Error).
- Server routes modularized in Express (`authRoutes`, `profileRoutes`, `resumeRoutes`, `jobRoutes`, `interviewRoutes`, `analyticsRoutes`).

## 4. Source Files
- [`client/src/services/api.js`](file:///d:/Mini-Project/client/src/services/api.js)
- [`server/server.js`](file:///d:/Mini-Project/server/server.js)
- [`server/routes/authRoutes.js`](file:///d:/Mini-Project/server/routes/authRoutes.js)
- [`server/routes/profileRoutes.js`](file:///d:/Mini-Project/server/routes/profileRoutes.js)
- [`server/routes/resumeRoutes.js`](file:///d:/Mini-Project/server/routes/resumeRoutes.js)
- [`server/routes/jobRoutes.js`](file:///d:/Mini-Project/server/routes/jobRoutes.js)
- [`server/routes/interviewRoutes.js`](file:///d:/Mini-Project/server/routes/interviewRoutes.js)
- [`server/routes/analyticsRoutes.js`](file:///d:/Mini-Project/server/routes/analyticsRoutes.js)
