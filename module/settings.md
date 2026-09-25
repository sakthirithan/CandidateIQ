# Module: Settings & Notification Center

## 1. Overview
User settings configuration page and global notification center drawer. Provides profile preferences, account details update, security settings, notification preference toggles, and real-time in-app notification center.

## 2. Status
✅ IMPLEMENTED

## 3. Business Purpose
Allows candidates, recruiters, and admins to manage profile details, dark mode preferences, and notification channels, while delivering real-time notification drawer updates.

## 4. Frontend Features
- Global Settings Modal (`SettingsModal.jsx`) and dedicated Settings Page (`SettingsPage.jsx`).
- Profile Settings tab (Name, Email, Phone, Headline, Location).
- Account & Security Settings tab (Password update, Session management).
- Notification Settings tab (Email notifications, In-app alerts, Interview reminders).
- Preferences tab (Dark mode toggle, Compact view, Language).
- Notification Center drawer (`NotificationCenter.jsx`) with role-filtered notifications, mark-all-as-read, clear, and unread badge badge count.

## 5. Backend Features
- User profile update via profile endpoints.

## 6. Database / Schema
- Schema: `User` ([User.js](file:///d:/Mini-Project/server/models/User.js))

## 7. Schema Fields
- `User`: `{ name, email, phone, location, headline }`

## 8. API Endpoints
- `PUT /api/candidates/profile`

## 9. Services
- `notificationService.js` ([mockApi](file:///d:/Mini-Project/client/src/services/mockApi/notificationService.js))

## 10. Components
- [`SettingsModal.jsx`](file:///d:/Mini-Project/client/src/components/common/SettingsModal.jsx)
- [`SettingsPage.jsx`](file:///d:/Mini-Project/client/src/components/common/SettingsPage.jsx)
- [`NotificationCenter.jsx`](file:///d:/Mini-Project/client/src/components/common/NotificationCenter.jsx)

## 11. Routes / Pages
- `/settings`

## 12. State Management
- `mockNotificationService` event subscription pattern.

## 13. Dependencies
- Auth Utils (`getCurrentUser()`, `updateUser()`)
- [`notificationService.js`](file:///d:/Mini-Project/client/src/services/mockApi/notificationService.js)

## 14. Consumers
- All authenticated users across the application.

## 15. Data Flow
```text
User Actions -> Notification Triggered -> Notification Service Dispatches Event -> Unread Count Updated -> Notification Drawer Displays Item
```

## 16. External Dependencies
- Lucide React icons.

## 17. Environment Variables
None required.

## 18. Current Limitations
None.

## 19. Known Issues
None.

## 20. Future Extensions
- Web Push Notifications integration.

## 21. Source Files
- [`client/src/components/common/SettingsModal.jsx`](file:///d:/Mini-Project/client/src/components/common/SettingsModal.jsx)
- [`client/src/components/common/SettingsPage.jsx`](file:///d:/Mini-Project/client/src/components/common/SettingsPage.jsx)
- [`client/src/components/common/NotificationCenter.jsx`](file:///d:/Mini-Project/client/src/components/common/NotificationCenter.jsx)
- [`client/src/services/mockApi/notificationService.js`](file:///d:/Mini-Project/client/src/services/mockApi/notificationService.js)
