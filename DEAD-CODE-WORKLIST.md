# Baseline dead-code worklist

Generated on the `refactor/production-ready` branch before the frontend cleanup.
The entries below are Knip's baseline findings; route/controller exports and shared types
need reachability review before deletion. Madge found no circular dependencies.

## Frontend: unused files

- `src/components/auth/AuthBrandPanel.tsx`
- `src/components/common/AvatarStack.tsx`
- `src/components/common/EmptyState.tsx`
- `src/components/common/StatusBadge.tsx`
- `src/components/ui/FieldError.tsx`
- `src/components/ui/FormAlert.tsx`
- `src/components/ui/StatCard.tsx`
- `src/lib/api/authPolicy.ts`
- `src/lib/api/client.ts`
- `src/lib/api/csrf.ts`
- `src/lib/api/index.ts`
- `src/lib/api/interceptors/request.ts`
- `src/lib/api/interceptors/response.ts`
- `src/lib/api/refresh.ts`
- `src/lib/api/services/admin.service.ts`
- `src/lib/api/services/auth.service.ts`
- `src/lib/api/services/index.ts`
- `src/lib/api/services/user.service.ts`
- `src/lib/auth/events.ts`
- `src/lib/auth/navigation.ts`
- `src/lib/auth/session.ts`
- `src/lib/config/env.ts`
- `src/lib/constants/routes.ts`
- `src/lib/realtime/socket.ts`
- `src/lib/utils/avatar.ts`
- `src/lib/utils/cookies.ts`
- `src/types/index.ts`
- `src/types/project.ts`
- `src/types/task.ts`
- `src/types/user.ts`

## Frontend: unused exports and types

- `src/components/kanban/KanbanColumn.tsx`: `COLUMN_COLORS`, `COLUMN_HEADER_COLORS`
- `src/lib/api/admin.ts`: `getAdminUsers`, `deleteAdminUser`, `changeAdminRole`,
  `getAdminProjects`, `deleteAdminProject`, `getAdminProfile`, `updateAdminProfile`,
  `changeAdminPassword`, `uploadAdminAvatar`
- `src/lib/api/auth.ts`: `login`, `register`, `refresh`, `logout`
- `src/lib/api/user.ts`: `getNotifications`, `getProfile`, `searchGlobal`
- `src/lib/errors/normalize.ts`: `toApiError`
- `src/lib/errors/notify.ts`: `notifyError`, `notifySuccess`
- `src/lib/errors/report.ts`: `reportError`
- `src/lib/tokenStorage.ts`: `setCookie`, `removeCookie`, `isAdminSession`
- `src/components/kanban/TaskCard.tsx`: `Attachment`
- `src/lib/api/admin.ts`: `AdminRecentUser`
- `src/lib/api/auth.ts`: `LoginPayload`, `RegisterPayload`
- `src/lib/errors/codes.ts`: `ErrorCodeValue`
- `src/lib/errors/types.ts`: `ApiErrorCode`
- `src/store/index.ts`: `AppDispatch`
- `src/store/slices/authSlice.ts`: `AuthState`

## Backend: unused exports

Knip reports these controller exports as unused in its static analysis; Express route
registration is their runtime consumer, so verify route references rather than deleting them.

- `src/controllers/admin.controller.js`: `getStats`, `getAllUsers`, `deleteUser`,
  `updateUserRole`, `getAllProjects`, `deleteProject`, `getActivity`, `broadcastNotification`
- `src/controllers/auth.controller.js`: `register`, `login`, `startGoogleOAuth`,
  `googleCallback`, `refresh`, `logout`, `resetPassword`
- `src/controllers/dashboard.controller.js`: `getDashboardStats`
- `src/controllers/notification.controller.js`: `getNotifications`, `markAsRead`, `markAllRead`
- `src/controllers/project.controller.js`: `createProject`, `getProjects`, `getProjectById`,
  `updateProject`, `deleteProject`, `addMember`, `inviteMember`, `listInvitations`,
  `getInvitation`, `acceptInvitation`, `rejectInvitation`, `listMembers`, `removeMember`
- `src/controllers/search.controller.js`: `globalSearch`
- `src/controllers/task.controller.js`: `createTask`, `getTasksByProject`, `getMyTasks`,
  `getAllUserTasks`, `updateTask`, `updateTaskStatus`, `deleteTask`
- `src/controllers/upload.controller.js`: `uploadFile`, `getAttachments`, `deleteAttachment`
- `src/controllers/user.controller.js`: `getMe`, `updateProfile`, `changePassword`,
  `searchUsers`, `uploadAvatar`
- `src/services/google-oauth.service.js`: `createGoogleOAuthClient`
- `src/utils/error-codes.js`: exported error constants are consumed by backend code.

## Dependency cycles

- Frontend: Madge processed 110 files; no circular dependencies (31 resolution warnings).
- Backend: Madge processed 45 files; no circular dependencies.

## Baseline gates

- `npm --prefix client run typecheck`: passed.
- `npm --prefix client run lint`: passed with 3 warnings (an unused generic, relative
  `window.location.assign`, and an unused local in error normalization).
- `npm --prefix client run build`: passed; 25 routes generated.
