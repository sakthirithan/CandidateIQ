# Core Module: Database & Persistence Layer

## 1. Overview
Database connection and storage abstraction supporting both production MongoDB persistence via Mongoose ODM and automatic in-memory / localStorage fallback when MongoDB is offline.

## 2. Status
✅ IMPLEMENTED

## 3. Implementation Details
- Mongoose connection setup in `server/config/db.js`.
- DB health status tracker (`getDBStatus()`).
- Mongoose schemas for `User`, `CandidateProfile`, `Job`, `Application`, `Interview`.
- Client reactive storage bus in `client/src/services/storage/storageService.js` using custom events (`candidateiq:data-updated`) and `storage` events across tabs.

## 4. Source Files
- [`server/config/db.js`](file:///d:/Mini-Project/server/config/db.js)
- [`server/models/User.js`](file:///d:/Mini-Project/server/models/User.js)
- [`server/models/CandidateProfile.js`](file:///d:/Mini-Project/server/models/CandidateProfile.js)
- [`server/models/Job.js`](file:///d:/Mini-Project/server/models/Job.js)
- [`server/models/Application.js`](file:///d:/Mini-Project/server/models/Application.js)
- [`server/models/Interview.js`](file:///d:/Mini-Project/server/models/Interview.js)
- [`client/src/services/storage/storageService.js`](file:///d:/Mini-Project/client/src/services/storage/storageService.js)
