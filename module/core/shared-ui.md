# Core Module: Shared UI Component Library

## 1. Overview
Central UI design system components providing navigation sidebars, topbars, search palettes, notification drawers, modals, error boundaries, loading spinners, and empty states.

## 2. Status
✅ IMPLEMENTED

## 3. Implementation Details
- `Sidebar.jsx`: Dynamic navigation sidebar adjusting options according to user role (Candidate, Recruiter/HR, Admin).
- `Topbar.jsx`: Workspace header displaying active view title, command search trigger (`Cmd+K`), notification bell, profile menu, and logout.
- `GlobalSearchPalette.jsx`: Command palette searching jobs, candidate tools, and navigation views.
- `ErrorBoundary.jsx`: React error boundary catching render crashes.
- `ConfirmModal.jsx`: Generic confirmation dialog.
- `EmptyState.jsx` & `LoadingState.jsx`: Reusable feedback placeholders.

## 4. Source Files
- [`client/src/components/common/Sidebar.jsx`](file:///d:/Mini-Project/client/src/components/common/Sidebar.jsx)
- [`client/src/components/common/Topbar.jsx`](file:///d:/Mini-Project/client/src/components/common/Topbar.jsx)
- [`client/src/components/common/GlobalSearchPalette.jsx`](file:///d:/Mini-Project/client/src/components/common/GlobalSearchPalette.jsx)
- [`client/src/components/common/ErrorBoundary.jsx`](file:///d:/Mini-Project/client/src/components/common/ErrorBoundary.jsx)
- [`client/src/components/common/ConfirmModal.jsx`](file:///d:/Mini-Project/client/src/components/common/ConfirmModal.jsx)
- [`client/src/components/common/EmptyState.jsx`](file:///d:/Mini-Project/client/src/components/common/EmptyState.jsx)
- [`client/src/components/common/LoadingState.jsx`](file:///d:/Mini-Project/client/src/components/common/LoadingState.jsx)
