Absolutely. Since this is a **modification prompt for Antigravity**, I’d make it strict about **real MongoDB data, CRUD completeness, authorization, synchronization, and regression safety**. The key is to prevent Antigravity from simply replacing the existing constants with another frontend mock.

Here is a refined implementation-ready prompt:

````markdown
# MODULE: ADMINISTRATION — REAL DATABASE & COMPLETE CRUD IMPLEMENTATION

## ROLE

You are working on the existing CandidateIQ MERN application.

Your task is to upgrade the existing **System Administration & User Management** module from dummy/static frontend data to a **fully functional real-time database-backed admin module**.

This is a MODIFICATION task.

Do NOT redesign or rewrite unrelated modules.
Do NOT introduce mock/constant data as a replacement.
Do NOT break existing authentication, candidate, recruiter, job, application, or interview flows.

The goal is:

> Admin Dashboard → Real MongoDB Data → Real API → Real CRUD Operations → Immediate UI Synchronization

---

# 1. CURRENT MODULE

## Module

System Administration & User Management

## Existing Route

`/admin-dashboard`

## Existing Main Component

`client/src/components/admin/AdminManagement.jsx`

## Existing Storage Service

`client/src/services/storage/storageService.js`

## Existing Backend Models

```text
server/models/User.js
server/models/Job.js
server/models/Application.js
````

## Existing API

```text
GET /api/auth/me
GET /api/analytics/dashboard
```

## Existing Role

```text
admin
```

---

# 2. PRIMARY OBJECTIVE

Currently the Admin panel uses dummy/static/constant values for displaying users, statistics, jobs, applications, and other information.

Replace all admin-facing dummy/static data with **real MongoDB-backed data**.

The Admin panel must display the actual current database state.

The implementation must support:

* Real user retrieval
* Real user search
* Real role filtering
* Real role modification
* Real user activation/deactivation
* Real user creation where applicable
* Real user deletion where appropriate
* Real dashboard statistics
* Real job/requisition data
* Real application data
* Real AI provider status
* Real API error handling
* Admin authorization
* Immediate UI synchronization after mutations
* Database persistence
* Refresh persistence
* Logout/login persistence

Do NOT use hardcoded arrays such as:

```js
const users = [...]
const jobs = [...]
const applications = [...]
const stats = {...}
```

for production/admin display data.

Do NOT use fake counters such as:

```js
totalUsers: 124
totalCandidates: 80
totalRecruiters: 32
totalJobs: 25
```

All such values must come from MongoDB.

---

# 3. IMPORTANT IMPLEMENTATION RULE

Before changing code:

## AUDIT THE EXISTING APPLICATION

Inspect the existing project and understand:

### Frontend

* AdminManagement.jsx
* admin routes
* auth utilities
* API utilities
* storageService.js
* existing dashboard components
* existing user management components
* existing job management components
* existing application components
* existing notification/toast system
* existing loading/error components

### Backend

Inspect:

```text
server/models/User.js
server/models/Job.js
server/models/Application.js
```

Also inspect:

* Express app configuration
* route structure
* controllers
* middleware
* authentication middleware
* JWT/session handling
* database connection
* existing analytics implementation
* existing recruiter APIs
* existing candidate APIs

Do NOT create duplicate models or duplicate authentication systems if equivalent functionality already exists.

Reuse the existing architecture wherever possible.

---

# 4. DATABASE MUST BE THE SOURCE OF TRUTH

The admin panel must follow this architecture:

```text
MongoDB
   ↓
Mongoose Models
   ↓
Express API
   ↓
Admin Controller / Service
   ↓
Admin Routes
   ↓
Frontend API Service
   ↓
React State
   ↓
Admin Dashboard
```

The frontend must NOT calculate or invent database state.

React state should represent data received from the backend.

MongoDB is the authoritative source.

---

# 5. ADMIN AUTHORIZATION

Admin APIs must be protected on the backend.

Never rely only on:

```js
if (user.role === "admin")
```

inside React.

Frontend route protection is useful for UX, but backend authorization is mandatory.

Create/reuse middleware such as:

```text
authenticate
requireAdmin
```

or the existing equivalent.

Every admin mutation endpoint must verify:

1. User is authenticated.
2. User exists.
3. User account is active where required.
4. User has:

```text
role === "admin"
```

Unauthorized users must receive appropriate HTTP status codes.

Example:

```text
401 → Not authenticated
403 → Authenticated but not authorized
404 → Resource not found
400 → Invalid request
409 → Conflict
500 → Server error
```

Do not expose sensitive admin information through unauthorized endpoints.

---

# 6. ADMIN DASHBOARD OVERVIEW

The dashboard must display real database statistics.

Required metrics:

### Users

```text
Total Users
Total Candidates
Total Recruiters
Total Admins
```

### Recruitment

```text
Total Jobs
Published Jobs
Draft Jobs
Total Applications
```

If these fields/statuses already exist in the schema, use them.

Do not invent new status values unless required by the existing architecture.

---

# 7. REAL-TIME / FRESH DATA REQUIREMENT

The admin dashboard must always display current database data.

Implement reliable synchronization.

Minimum requirement:

```text
Admin opens dashboard
        ↓
GET latest data from API
        ↓
Display current MongoDB state
```

After every mutation:

```text
Mutation API
     ↓
MongoDB update
     ↓
Successful response
     ↓
Update frontend state
     ↓
Refresh affected statistics/list
```

Do NOT depend only on browser localStorage.

If the existing project already has a data-update event system, integrate with it.

If true server push/WebSocket infrastructure already exists, reuse it.

If no WebSocket infrastructure exists, DO NOT introduce unnecessary complexity just to claim "real-time".

Use API-driven fresh synchronization and event-driven frontend refresh where appropriate.

The critical requirement is:

> The Admin panel must never display stale dummy data after a successful database mutation.

---

# 8. USER MANAGEMENT

Implement complete real database-backed user management.

The Admin user table must display users retrieved from:

```text
MongoDB User collection
```

Required fields where available:

```text
Name
Email
Role
Payment Status
Activation Status
Created At
```

Do not expose passwords or password hashes.

---

# 9. USER SEARCH

Search must query/filter real user data.

Support:

```text
Name
Email
```

Search behavior should be case-insensitive.

Prefer backend filtering for large datasets.

Example:

```text
GET /api/admin/users?search=john
```

Do not load a hardcoded list and pretend it is database search.

---

# 10. ROLE FILTER

Implement:

```text
All
Candidate
Recruiter
Admin
```

Filtering must operate on real database users.

Example:

```text
GET /api/admin/users?role=candidate
```

or equivalent existing API architecture.

---

# 11. ROLE CHANGE

Admin must be able to change a user's role.

Example:

```text
Candidate → Recruiter
Recruiter → Candidate
Candidate → Admin
Recruiter → Admin
```

Subject to the project's security rules.

Flow:

```text
Admin selects new role
        ↓
Confirmation if appropriate
        ↓
PATCH /api/admin/users/:id/role
        ↓
Backend validates role
        ↓
MongoDB updated
        ↓
Response returned
        ↓
Frontend updates user
        ↓
Dashboard statistics refreshed
```

Do not modify the role only in React state.

The MongoDB record must actually change.

---

# 12. USER ACTIVATION / DEACTIVATION

The existing:

```text
activated
```

field must be used.

Admin must be able to:

```text
Activate user
Deactivate user
```

Flow:

```text
Toggle
 ↓
Confirmation if appropriate
 ↓
API request
 ↓
MongoDB update
 ↓
Frontend refresh
```

The change must survive:

```text
Page refresh
Logout
Login
Another browser/session
```

where applicable.

Do not merely change a local boolean.

---

# 13. USER CREATION

Audit whether user creation already exists elsewhere.

If admin user creation is part of the existing intended admin workflow, implement:

```text
Create User
```

with:

```text
Name
Email
Role
Activation Status
```

Use proper backend validation.

Do NOT allow the frontend to directly write to MongoDB.

Flow:

```text
Admin Form
 ↓
POST /api/admin/users
 ↓
Validation
 ↓
Duplicate email check
 ↓
Password/auth handling according to existing auth architecture
 ↓
MongoDB
 ↓
Created User
 ↓
Frontend refresh
```

Do not create a second authentication/password system.

Reuse the existing authentication architecture.

---

# 14. USER UPDATE

Implement appropriate update functionality.

At minimum support editable fields that are already part of the User schema and safe for admin modification.

Do NOT allow an admin UI to directly edit:

```text
passwordHash
JWT/session data
internal security tokens
```

unless the existing security architecture explicitly supports a secure password-reset operation.

---

# 15. USER DELETE

Audit the current business rules before implementing deletion.

If deletion is appropriate:

```text
DELETE /api/admin/users/:id
```

must delete the actual MongoDB user.

However, do NOT blindly hard-delete users if doing so would break:

* applications
* interviews
* resumes
* recruiter relationships
* historical records

If the system requires historical integrity, prefer a safe deactivation/soft-delete strategy consistent with the existing schema.

Do not invent destructive behavior without checking existing relationships.

---

# 16. SELF-PROTECTION

The admin must not accidentally remove system access to themselves.

At minimum evaluate:

```text
Admin deleting own account
Admin deactivating own account
Admin removing own admin role
```

Implement safe validation.

Recommended behavior:

```text
Current logged-in admin cannot deactivate themselves.
Current logged-in admin cannot remove their final admin privilege.
```

Only implement restrictions consistent with the existing application's security model.

---

# 17. REQUISITIONS / JOB AUDIT

The Admin panel must display real Job data from MongoDB.

Use:

```text
Job model
```

Required information should include, where available:

```text
Job Title
Company
Recruiter
Status
Created Date
Applications Count
```

Do not use dummy job cards.

---

# 18. APPLICATION AUDIT

The Admin panel must display real Application data.

Use:

```text
Application model
```

Show appropriate information such as:

```text
Candidate
Job
Recruiter
Application Status
Applied Date
```

Use populated references where the schema supports them.

Do not expose sensitive candidate information unnecessarily.

---

# 19. APPLICATION COUNTS

Dashboard application statistics must be calculated from MongoDB.

For example:

```text
Total Applications
Applications by status
```

Use MongoDB aggregation/count queries where appropriate.

Do not calculate totals from frontend mock arrays.

---

# 20. AI PROVIDER STATUS

The Admin panel currently displays:

```text
Gemini API Connected
Fallback Engine
```

This must reflect the actual configured AI provider state.

Audit the existing AI service.

If Gemini/API configuration exists:

```text
Check configuration
Check provider availability according to existing architecture
```

If the project uses deterministic fallback logic:

```text
Show Fallback Engine
```

Do NOT display:

```text
Gemini Connected
```

simply because a UI constant says so.

The status must represent actual application configuration/state.

Never expose the actual API key.

---

# 21. ADMIN API DESIGN

Create/reuse admin APIs according to the existing backend architecture.

Suggested structure:

```text
GET    /api/admin/dashboard
GET    /api/admin/users
GET    /api/admin/users/:id
POST   /api/admin/users
PATCH  /api/admin/users/:id
PATCH  /api/admin/users/:id/role
PATCH  /api/admin/users/:id/activation
DELETE /api/admin/users/:id

GET    /api/admin/jobs
GET    /api/admin/applications
GET    /api/admin/ai-status
```

Do not blindly create duplicate endpoints.

First inspect existing routes and reuse/refactor them when appropriate.

---

# 22. DASHBOARD API

Prefer a single dashboard endpoint for dashboard-level metrics.

Example:

```text
GET /api/admin/dashboard
```

Response concept:

```js
{
  success: true,
  data: {
    users: {
      total: 0,
      candidates: 0,
      recruiters: 0,
      admins: 0
    },
    jobs: {
      total: 0,
      published: 0,
      draft: 0
    },
    applications: {
      total: 0
    },
    aiProvider: {
      provider: "gemini",
      status: "connected"
    }
  }
}
```

Adapt this structure to the existing project rather than unnecessarily changing frontend contracts.

---

# 23. PAGINATION

Do not load thousands of users/jobs/applications into the browser unnecessarily.

Implement pagination where appropriate.

Example:

```text
?page=1&limit=20
```

Return:

```js
{
  data: [],
  pagination: {
    page,
    limit,
    total,
    totalPages
  }
}
```

Use existing pagination conventions if already available.

---

# 24. SORTING

Where useful, support sorting by:

```text
Created Date
Name
Email
Role
Status
```

Default user sorting:

```text
Newest users first
```

unless the existing design already specifies another order.

---

# 25. FRONTEND API SERVICE

Do not place raw fetch/axios calls throughout JSX.

Create/reuse an admin service such as:

```text
client/src/services/admin/adminService.js
```

Possible methods:

```js
getDashboardStats()
getUsers(params)
getUser(id)
createUser(data)
updateUser(id, data)
updateUserRole(id, role)
updateUserActivation(id, activated)
deleteUser(id)
getJobs(params)
getApplications(params)
getAIProviderStatus()
```

Use the project's existing HTTP client if one exists.

---

# 26. LOCAL STORAGE REQUIREMENT

The current application contains:

```text
storageService.js
storageUsers
storageJobs
storageApplications
```

Do NOT delete the existing storage system blindly.

First determine:

* Which modules still depend on localStorage?
* Which data has already moved to MongoDB?
* Whether storageService is currently acting as mock data or fallback state.

For the Admin panel:

> MongoDB/API data must become the primary source of truth.

Do not keep two competing sources of truth:

```text
MongoDB
+
localStorage users
```

for the same admin-managed user records.

If other existing frontend modules still require storageService, preserve their compatibility while migrating Admin data to the real API.

---

# 27. LOADING STATES

Every database operation must have a clear loading state.

Examples:

```text
Loading dashboard...
Loading users...
Updating role...
Updating activation...
Deleting user...
Loading jobs...
Loading applications...
```

Disable relevant controls while mutation is in progress.

Prevent duplicate API requests caused by repeated clicks.

---

# 28. ERROR HANDLING

Implement proper error handling.

Examples:

```text
Network failure
Unauthorized
Forbidden
User not found
Duplicate email
Invalid role
Database failure
Validation failure
AI provider unavailable
```

Show user-friendly error messages.

Do not expose stack traces or internal database errors to the UI.

---

# 29. SUCCESS FEEDBACK

After successful mutations, provide clear feedback.

Examples:

```text
User role updated successfully.
User activated successfully.
User deactivated successfully.
User created successfully.
User deleted successfully.
```

Use the existing toast/notification component if available.

Do not use browser `alert()` if the project already has a notification system.

---

# 30. CONFIRMATION DIALOGS

Destructive or high-impact actions should require confirmation where appropriate:

```text
Delete User
Deactivate User
Change Role to Admin
```

Confirmation must occur before the API mutation.

Cancel must perform no database operation.

---

# 31. EMPTY STATES

Handle empty database states gracefully.

Examples:

```text
No users found.
No jobs found.
No applications found.
No matching users found.
```

Do not crash if MongoDB returns:

```text
[]
```

---

# 32. NULL / MISSING DATA

The UI must safely handle:

```text
Missing company
Missing recruiter
Missing application status
Missing createdAt
Missing optional fields
```

Use meaningful fallback labels such as:

```text
Not available
Unknown
```

Do not render:

```text
undefined
null
[object Object]
```

---

# 33. DATABASE VALIDATION

Validate all incoming admin requests on the backend.

Examples:

### Role

Only allow:

```text
candidate
recruiter
admin
```

### User ID

Validate MongoDB ObjectId.

### Email

Validate format and uniqueness.

### Activation

Require boolean.

Never trust frontend validation alone.

---

# 34. AUDIT LOGGING

The current module lists audit history as a future extension.

Do NOT implement a large audit-log system unless it already exists.

However, structure admin mutation services so audit logging can be added later.

At minimum, make it clear which admin performed the mutation where the existing authentication context allows it.

---

# 35. REAL-TIME SYNCHRONIZATION BETWEEN ADMIN AND OTHER MODULES

Admin changes must be reflected across the application.

Examples:

```text
Admin changes Candidate → Recruiter
        ↓
Recruiter data reflects new role

Admin deactivates user
        ↓
Future authenticated access respects activation state

Admin changes job/user/application state
        ↓
Other modules fetch current database state
```

Do not solve this by manually editing unrelated frontend state.

The backend database should remain authoritative.

---

# 36. SECURITY REQUIREMENTS

Never send:

```text
password
passwordHash
JWT secret
API keys
Gemini API key
database credentials
```

to the frontend.

Admin APIs must not leak sensitive fields.

Use field selection/projection where appropriate.

---

# 37. ROUTE PROTECTION

Ensure:

```text
/admin-dashboard
```

is accessible only to authenticated administrators.

Test:

```text
Candidate → denied
Recruiter → denied
Unauthenticated → redirected/denied
Admin → allowed
```

Do not rely solely on hiding the sidebar item.

---

# 38. RESPONSIVE UI

Preserve the existing CandidateIQ visual design.

Do not redesign the entire admin dashboard.

Ensure:

```text
Desktop
Tablet
Mobile
```

remain usable.

Avoid unnecessary horizontal overflow.

---

# 39. NO DUMMY DATA

After implementation, search the Admin module for:

```text
const users =
const jobs =
const applications =
const stats =
mockUsers
mockJobs
mockApplications
dummyUsers
dummyJobs
sampleUsers
fakeUsers
```

Remove these from the actual admin data-rendering path.

Also search for:

```text
Math.random()
```

Do not use randomness for admin metrics or records.

---

# 40. CRUD ACCEPTANCE CRITERIA

## CREATE

Admin can create a valid user where supported.

```text
Create
 ↓
API
 ↓
MongoDB
 ↓
Success
 ↓
User appears in table
 ↓
Statistics update
```

## READ

Admin dashboard loads:

```text
Users
Jobs
Applications
Statistics
AI status
```

from real database/API responses.

## UPDATE

Admin can:

```text
Change role
Change activation status
Update supported user fields
```

and changes persist in MongoDB.

## DELETE

Where supported:

```text
Delete user
 ↓
MongoDB
 ↓
User disappears from list
 ↓
Statistics update
```

with relationship safety.

---

# 41. REFRESH TEST

Perform:

```text
Admin login
 ↓
Open dashboard
 ↓
Modify user
 ↓
Refresh browser
```

The modification must remain.

Repeat for:

```text
Role
Activation
Create
Delete
```

where applicable.

---

# 42. LOGOUT / LOGIN TEST

After making changes:

```text
Logout
 ↓
Login again
 ↓
Open Admin Dashboard
```

All database changes must remain.

---

# 43. MULTI-SESSION DATA TEST

If possible:

```text
Browser A → Admin Dashboard
Browser B → modify database/user
Browser A → refresh/re-fetch
```

The latest MongoDB state must appear.

If WebSocket infrastructure exists, use it.

Otherwise, ensure API refresh/fetch always retrieves current database state.

---

# 44. REGRESSION SAFETY

Do NOT intentionally modify:

```text
Candidate Dashboard
Candidate Profile
Job Discovery
Job Detail
Recruiter Dashboard
Recruiter Job Creation
Recruiter Job Publishing
AI Mock Interview
Final Interview
HR Interview
Profile Review
Authentication
```

unless a direct dependency requires a minimal compatible change.

If a shared service/model must be changed, verify all consumers after modification.

---

# 45. EXISTING SCHEMA SAFETY

Before modifying Mongoose schemas:

1. Inspect all existing consumers.
2. Preserve existing fields.
3. Preserve existing API contracts where possible.
4. Do not rename fields without migration.
5. Do not remove fields.
6. Do not break existing references.

If schema changes are necessary, explain exactly why.

---

# 46. ERROR-RESILIENT ADMIN DASHBOARD

The Admin dashboard must not become blank because one API fails.

Example:

If:

```text
Users API succeeds
Jobs API fails
```

the user table should still render.

Display an appropriate error state for the failed section.

Do not crash the entire dashboard.

---

# 47. PERFORMANCE

Avoid unnecessary API calls.

Do not:

```text
fetch users every render
fetch dashboard statistics every render
```

Use appropriate React effects and dependency arrays.

Cancel/ignore stale requests where necessary.

Avoid race conditions when rapidly changing filters/search.

---

# 48. IMPLEMENTATION ORDER

Follow this order.

## PHASE 1 — AUDIT

Inspect:

```text
User.js
Job.js
Application.js
auth middleware
analytics routes
storageService.js
AdminManagement.jsx
routing
API utilities
```

Document existing data flow.

---

## PHASE 2 — BACKEND

Implement/reuse:

```text
Admin authorization middleware
Admin dashboard API
User management API
Job audit API
Application audit API
AI provider status API
```

Connect everything to MongoDB.

---

## PHASE 3 — FRONTEND API LAYER

Create/reuse:

```text
adminService.js
```

Remove direct dummy data access from AdminManagement.

---

## PHASE 4 — ADMIN UI

Connect:

```text
Dashboard statistics
Users table
Search
Role filter
Role change
Activation toggle
Create user
Edit user
Delete/deactivate
Jobs
Applications
AI status
```

to real APIs.

---

## PHASE 5 — SYNCHRONIZATION

After every successful mutation:

```text
Database update
 ↓
Frontend state update
 ↓
Relevant list refresh
 ↓
Relevant metric refresh
```

---

## PHASE 6 — SECURITY

Test:

```text
Admin
Candidate
Recruiter
Unauthenticated
```

against all admin APIs.

---

## PHASE 7 — TESTING

Run complete CRUD and regression tests.

---

# 49. MANDATORY TEST CHECKLIST

## Authentication

[ ] Admin can access `/admin-dashboard`.

[ ] Candidate cannot access admin dashboard.

[ ] Recruiter cannot access admin dashboard.

[ ] Unauthenticated user cannot access admin dashboard.

[ ] Backend rejects unauthorized admin API requests.

---

## Dashboard

[ ] Total users comes from MongoDB.

[ ] Candidate count comes from MongoDB.

[ ] Recruiter count comes from MongoDB.

[ ] Admin count comes from MongoDB.

[ ] Total jobs comes from MongoDB.

[ ] Total applications comes from MongoDB.

[ ] No hardcoded counters remain.

---

## Users

[ ] Users are loaded from MongoDB.

[ ] Search works.

[ ] Role filter works.

[ ] User details display correctly.

[ ] Role change works.

[ ] Activation works.

[ ] Deactivation works.

[ ] Create user works where supported.

[ ] Edit user works where supported.

[ ] Delete/deactivate works safely.

[ ] Changes persist after refresh.

[ ] Changes persist after logout/login.

---

## Jobs

[ ] Real jobs appear.

[ ] Job data comes from MongoDB.

[ ] Job status is accurate.

[ ] Recruiter information is accurate.

[ ] Application counts are accurate.

---

## Applications

[ ] Real applications appear.

[ ] Candidate information resolves correctly.

[ ] Job information resolves correctly.

[ ] Application status is accurate.

[ ] Application count is accurate.

---

## AI Provider

[ ] Provider status reflects actual configuration.

[ ] API keys are never exposed.

[ ] Fallback status is accurate.

---

## Database

[ ] MongoDB connection works.

[ ] Mongoose queries work.

[ ] CRUD mutations persist.

[ ] Invalid IDs are handled.

[ ] Invalid data is rejected.

[ ] Duplicate email is handled.

[ ] Database errors are handled gracefully.

---

## Synchronization

[ ] Dashboard refreshes after mutation.

[ ] User list refreshes after mutation.

[ ] Statistics refresh after mutation.

[ ] Current MongoDB state appears after browser refresh.

[ ] No stale dummy data remains.

---

## UI

[ ] Loading states work.

[ ] Error states work.

[ ] Empty states work.

[ ] Success notifications work.

[ ] Confirmation dialogs work.

[ ] No undefined/null rendering.

[ ] No blank dashboard after API failure.

---

## Runtime

[ ] No React errors.

[ ] No console errors.

[ ] No API 404 errors.

[ ] No API 401/403 errors for valid admin actions.

[ ] No duplicate requests.

[ ] No infinite loading.

[ ] No memory leaks.

[ ] No broken routes.

---

# 50. FINAL REGRESSION CHECK

After completing the Admin module, verify:

[ ] Login

[ ] Logout

[ ] Candidate Dashboard

[ ] Candidate Profile

[ ] Job Discovery

[ ] Job Detail

[ ] Recruiter Dashboard

[ ] Recruiter Job Creation

[ ] Recruiter Job Publishing

[ ] AI Mock Interview

[ ] Profile Review

[ ] Existing Interview routes

Do not redesign these modules.

Only confirm that Admin changes have not broken their dependencies.

---

# 51. FINAL REPORT REQUIRED

After implementation, provide a detailed implementation report.

## 1. FILES MODIFIED

List every created/modified file.

Example:

```text
server/routes/adminRoutes.js
server/controllers/adminController.js
server/middleware/adminAuth.js
client/src/services/admin/adminService.js
client/src/components/admin/AdminManagement.jsx
```

Use the actual files.

---

## 2. DATABASE CHANGES

Explain:

```text
Models changed
Fields changed
Indexes added
Queries added
Aggregations added
```

---

## 3. API ENDPOINTS

List:

```text
METHOD
ENDPOINT
PURPOSE
AUTHORIZATION
```

---

## 4. CRUD IMPLEMENTATION

Explain:

```text
Create
Read
Update
Delete
```

and how each operation reaches MongoDB.

---

## 5. ADMIN AUTHORIZATION

Explain how:

```text
Candidate
Recruiter
Admin
Unauthenticated
```

are handled.

---

## 6. DATA FLOW

Explain:

```text
MongoDB
 ↓
Mongoose
 ↓
Express API
 ↓
Admin Service
 ↓
React
 ↓
Admin Dashboard
```

---

## 7. LOCAL STORAGE

Clearly explain:

* Which Admin data no longer uses localStorage.
* Which existing localStorage functionality remains for compatibility.
* Which source is authoritative.

---

## 8. REAL-TIME / SYNCHRONIZATION

Explain exactly how fresh database state reaches the Admin UI.

Do not claim WebSocket real-time functionality unless it is actually implemented.

---

## 9. SECURITY

Explain:

* Authentication
* Admin authorization
* Sensitive field protection
* Role validation
* Self-protection
* API validation

---

## 10. TEST RESULTS

Report:

```text
Passed
Failed
Skipped
```

for the mandatory test checklist.

If any test fails, do NOT claim the module is complete.

---

## 11. KNOWN LIMITATIONS

Clearly identify remaining limitations.

Do not write:

```text
None
```

unless the implementation has actually been verified.

---

# 52. FINAL ACCEPTANCE CRITERIA

The Admin module is considered COMPLETE only when this flow works:

```text
Admin Login
      ↓
Admin Authorization
      ↓
/admin-dashboard
      ↓
Fetch Real MongoDB Data
      ↓
Dashboard Statistics
      ↓
Real User List
      ↓
Search / Filter
      ↓
Create / Edit / Role Change / Activate / Deactivate
      ↓
MongoDB Mutation
      ↓
Successful API Response
      ↓
Frontend Synchronization
      ↓
Updated User List
      ↓
Updated Statistics
      ↓
Real Jobs
      ↓
Real Applications
      ↓
Real AI Provider Status
      ↓
Browser Refresh
      ↓
Same Updated Database State
```

The following must NEVER happen:

```text
❌ Hardcoded users
❌ Hardcoded statistics
❌ Hardcoded jobs
❌ Hardcoded applications
❌ Frontend-only CRUD
❌ localStorage-only admin mutations
❌ Fake AI provider status
❌ Unauthorized admin API access
❌ Password/hash exposure
❌ Broken existing modules
❌ Blank dashboard after API failure
❌ Successful UI update without database persistence
```

## FINAL RULE

This is an existing production-style CandidateIQ MERN project.

**Modify the current implementation; do not rebuild the application.**

Preserve existing architecture and UI wherever possible.

Use MongoDB as the source of truth.

Every admin CRUD operation must have a complete:

```text
UI
→ API
→ Validation
→ Authorization
→ MongoDB
→ Response
→ React State Update
→ Persistence
```

flow.

Do not mark the task complete until the complete Admin module has been tested end-to-end.

```
```
