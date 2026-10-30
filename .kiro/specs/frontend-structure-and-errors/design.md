# Frontend Structure and Error Handling Refactoring - Design Document

## Overview

This design document specifies a comprehensive architectural refactoring of the Next.js frontend to fix critical defects in error handling, authentication flow, API client architecture, route organization, real-time connection management, and type organization. The refactoring is executed in 10 independent phases, each producing a working, tested, and deployable commit.

**Goals:**
- Implement robust, dual-format error normalization supporting both new backend error contract and legacy responses
- Establish single-flight token refresh with intelligent decision table routing
- Centralize API calls through a service layer with no direct axios imports in app/
- Consolidate route structure into clean (public), (workspace), (admin) groups
- Provide shared socket.io connection with reference counting and automatic reconnection
- Organize types into consolidated lib/types structure
- Maintain 100% backward compatibility for URLs, storage keys, markup, and functionality

**Constraints:**
- No changes outside /client directory
- Each phase must pass: `tsc --noEmit`, `npm run lint`, `npm run build`
- Preserve all existing CSS classes, localStorage keys, and user-facing URLs
- Support both new backend error format (status, code, message, errors, requestId) and legacy formats ({ message }, { errors[{msg, path}] }, non-JSON HTML/text)

---

## System Architecture

### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Next.js App Router                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌───────────┐  ┌────────────┐  ┌──────────┐                      │
│  │ (public)  │  │ (workspace)│  │ (admin)  │                      │
│  │           │  │            │  │          │                      │
│  │ /login    │  │ /dashboard │  │ /admin/* │                      │
│  │ /register │  │ /projects  │  │          │                      │
│  │ /forgot   │  │ /tasks     │  │ AuthGuard│                      │
│  │ /reset    │  │ /teams     │  │ AdminLayout                    │
│  │           │  │            │  │          │                      │
│  │           │  │ AuthGuard  │  └──────────┘                      │
│  │           │  │ WorkspaceShell                                  │
│  └───────────┘  └────────────┘                                    │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│                      Component Layer                                │
│                                                                     │
│  ┌──────────────┐  ┌───────────────┐  ┌──────────────┐           │
│  │ ErrorState   │  │ FieldError    │  │ FormAlert    │           │
│  │ (page-level) │  │ (field-level) │  │ (form-level) │           │
│  └──────────────┘  └───────────────┘  └──────────────┘           │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│                        Service Layer                                │
│                  (lib/api/services/*.service.ts)                    │
│                                                                     │
│  AuthService  │  ProjectService  │  TaskService  │  UserService   │
│  AdminService │  NotificationService │  ChatService │  etc.       │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│                      API Client Layer                               │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │                    lib/api/client.ts                        │  │
│  │                  (Axios instance + config)                  │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                              │                                      │
│         ┌────────────────────┼────────────────────┐                │
│         │                    │                    │                │
│  ┌──────▼──────┐   ┌────────▼────────┐   ┌──────▼──────┐         │
│  │   Request   │   │    Response     │   │    CSRF     │         │
│  │ Interceptor │   │   Interceptor   │   │   Manager   │         │
│  │             │   │                 │   │             │         │
│  │ • Inject    │   │ • Normalize     │   │ • Get token │         │
│  │   Bearer    │   │   errors        │   │ • Retry on  │         │
│  │ • Inject    │   │ • Auth decision │   │   invalid   │         │
│  │   CSRF      │   │   table         │   │             │         │
│  │             │   │ • Refresh logic │   └─────────────┘         │
│  │             │   │ • Retry policy  │                           │
│  └─────────────┘   └─────────────────┘                           │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│                      Error Handling Layer                           │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │              lib/errors/normalize.ts                        │  │
│  │                                                             │  │
│  │  • Detect new format (status, code, message, errors)       │  │
│  │  • Detect legacy {message} or {errors[{msg,path}]}         │  │
│  │  • Detect non-JSON HTML/text responses                     │  │
│  │  • Convert all to internal ApiError format                 │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                              │                                      │
│         ┌────────────────────┼────────────────────┐                │
│         │                    │                    │                │
│  ┌──────▼──────┐   ┌────────▼────────┐   ┌──────▼──────┐         │
│  │   notify    │   │    messages     │   │    report   │         │
│  │  (toast)    │   │ (user-friendly) │   │  (logging)  │         │
│  └─────────────┘   └─────────────────┘   └─────────────┘         │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│                   Auth & Session Management                         │
│                                                                     │
│  ┌──────────────┐   ┌─────────────────┐   ┌──────────────┐       │
│  │ authPolicy   │   │  refresh.ts     │   │ SessionWatcher│      │
│  │ (decision    │   │ (single-flight) │   │  (provider)  │       │
│  │  table)      │   │                 │   │              │       │
│  └──────────────┘   └─────────────────┘   └──────────────┘       │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │                    auth/events.ts                            │ │
│  │         EventEmitter for session lifecycle events            │ │
│  │  • session-ended (reason: expired | invalid | logout)        │ │
│  │  • session-restored                                          │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│                    Real-time Layer                                  │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │                lib/realtime/socket.ts                        │ │
│  │                                                              │ │
│  │  • acquireSocket(): Socket (ref count++)                    │ │
│  │  • releaseSocket(): void (ref count--, disconnect if 0)     │ │
│  │  • Auto-reconnect with exponential backoff                  │ │
│  │  • Handle connect_error based on error.data.code            │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│                         Redux Store                                 │
│                                                                     │
│  store/                                                             │
│    index.ts                                                         │
│    authSlice.ts                                                     │
│    projectSlice.ts                                                  │
│    taskSlice.ts                                                     │
│    notificationSlice.ts                                             │
│    hooks.ts  (typed useAppSelector, useAppDispatch)                │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│                         Type System                                 │
│                                                                     │
│  lib/types/                                                         │
│    api.ts         (ApiError, ApiResponse, RequestConfig)           │
│    auth.ts        (User, AuthState, LoginCredentials, etc.)        │
│    error.ts       (ErrorCode, ErrorSeverity, FieldError)           │
│    projects.ts    (Project, ProjectMember, ProjectSettings)        │
│    tasks.ts       (Task, TaskStatus, TaskPriority)                 │
│    users.ts       (UserProfile, UserPreferences)                   │
│    teams.ts       (Team, TeamMember, Invitation)                   │
│    notifications.ts (Notification, NotificationType)               │
│    realtime.ts    (SocketEvent, ConnectionState)                   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Request Flow: Successful API Call

```
User Action
    │
    ▼
Component calls Service Method
    │ (e.g., ProjectService.create({ title: "New Project" }))
    ▼
Service Layer (lib/api/services/projects.service.ts)
    │ apiClient.post('/projects', data)
    ▼
Request Interceptor (lib/api/client.ts)
    │ • Inject Authorization: Bearer <token>
    │ • Inject X-CSRF-Token: <csrf>
    ▼
Backend API
    │ Process request
    ▼
Response (200-299)
    │
    ▼
Response Interceptor
    │ • No transformation needed
    ▼
Service returns data
    │
    ▼
Component updates UI
```

### Request Flow: Error with Retry

```
User Action
    │
    ▼
Component calls Service Method
    │ (e.g., TaskService.update(taskId, updates))
    ▼
Service Layer
    │ apiClient.put(`/tasks/${taskId}`, updates)
    ▼
Request Interceptor
    │ • Inject tokens
    ▼
Backend API
    │ Returns 401 AUTH_TOKEN_EXPIRED
    ▼
Response Interceptor
    │ 1. Normalize error to ApiError
    │ 2. Check authPolicy decision table
    │ 3. Decision: ATTEMPT_REFRESH
    │
    ▼
Refresh Logic (lib/auth/refresh.ts)
    │ 1. Check if refresh already in flight
    │ 2. If not, call POST /auth/refresh
    │ 3. If successful, update tokens
    │ 4. Return success signal
    │
    ▼
Response Interceptor
    │ 1. Refresh succeeded
    │ 2. Retry original request (mark _retry: true)
    │ 3. Request succeeds
    │
    ▼
Service returns data
    │
    ▼
Component updates UI (user unaware of refresh)
```

### Request Flow: Session Expiration

```
User Action
    │
    ▼
Component calls Service Method
    │
    ▼
Service Layer
    │
    ▼
Backend API
    │ Returns 401 AUTH_REFRESH_EXPIRED
    ▼
Response Interceptor
    │ 1. Normalize error to ApiError
    │ 2. Check authPolicy decision table
    │ 3. Decision: END_SESSION
    │
    ▼
Session Termination (lib/auth/session.ts)
    │ 1. clearSession() (clear localStorage, cookies)
    │ 2. Emit 'session-ended' event with reason
    │ 3. Debounce to prevent duplicate events
    │
    ▼
SessionWatcher (app provider)
    │ 1. Listen to 'session-ended' event
    │ 2. Dispatch logout() Redux action
    │ 3. Navigate to /login?reason=session_expired&next=/current-path
    │
    ▼
Login Page
    │ Show banner: "Your session has expired. Please log in again."
    │ After login, redirect to 'next' parameter if safe
```

### Request Flow: CSRF Retry

```
User Action
    │
    ▼
Component calls Service Method (mutation)
    │
    ▼
Request Interceptor
    │ • Inject X-CSRF-Token from getCsrfToken()
    ▼
Backend API
    │ Returns 403 CSRF_INVALID
    ▼
Response Interceptor
    │ 1. Normalize error
    │ 2. Detect CSRF failure (403 + CSRF_INVALID or message ~/csrf/i)
    │ 3. Call fetchFreshCsrf()
    │
    ▼
CSRF Manager (lib/api/csrf.ts)
    │ 1. GET /csrf-token
    │ 2. Store in localStorage['csrfToken']
    │ 3. Store in memory cache
    │ 4. Return fresh token
    │
    ▼
Response Interceptor
    │ 1. Retry original request with fresh CSRF (mark _csrfRetry: true)
    │ 2. If succeeds, return data
    │ 3. If fails again, reject error
    │
    ▼
Service returns data or throws error
```

---

## Glossary

- **ApiError**: Internal normalized error type with status, code, message, errors[], requestId, isAuthError, isValidationError helper flags
- **Auth Decision Table**: Logic table mapping (status, code, endpoint) → action (ATTEMPT_REFRESH, END_SESSION, REJECT_IMMEDIATELY)
- **Single-flight Refresh**: Pattern ensuring only one token refresh request executes at a time; concurrent 401s await the same promise
- **CSRF Manager**: Module handling CSRF token fetch, storage (memory + localStorage), and retry logic
- **Service Layer**: Domain-organized API wrappers (AuthService, ProjectService, etc.) providing typed interfaces to backend endpoints
- **Error Normalization**: Process of converting diverse error formats (new contract, legacy {message}, legacy {errors[]}, non-JSON) to unified ApiError structure
- **Session Events**: EventEmitter-based system for broadcasting session lifecycle changes (session-ended, session-restored)
- **Socket Reference Counting**: Pattern tracking active socket.io consumers; disconnect when count reaches zero
- **Route Groups**: Next.js App Router convention using (groupName) folders for layout organization without URL impact
- **Field Error**: Validation error with field/path information routed to specific form field UI
- **Form Alert**: Form-level error message displayed above form fields
- **ErrorState Component**: Full-page or section-level error display for load failures
- **Transient Retry**: Automatic retry of GET/HEAD requests on network/5xx errors with exponential backoff
- **Request Config Flags**: Custom axios config options: silent (suppress toast), noRetry (skip retry logic), skipAuthRefresh (never attempt refresh)

---

## Data Structures and Interfaces

### lib/types/api.ts

```typescript
/**
 * Normalized internal error structure supporting dual backend formats
 */
export interface ApiError {
  status: number;
  code: string;
  message: string;
  errors?: FieldError[];
  requestId?: string;
  metadata?: Record<string, unknown>; // Raw response data for debugging
  
  // Helper flags
  isAuthError: boolean;
  isValidationError: boolean;
  isNetworkError: boolean;
  isServerError: boolean;
}

/**
 * Field-level validation error
 */
export interface FieldError {
  field: string;
  message: string;
  path?: string; // For nested fields (e.g., "address.city")
}

/**
 * Standard API response wrapper
 */
export interface ApiResponse<T = any> {
  data: T;
  status: number;
  message?: string;
}

/**
 * Custom axios request config extensions
 */
export interface CustomRequestConfig {
  /**
   * Suppress toast notifications for this request
   */
  silent?: boolean;
  
  /**
   * Skip automatic retry logic for network/5xx errors
   */
  noRetry?: boolean;
  
  /**
   * Never attempt token refresh for this request (e.g., login, register)
   */
  skipAuthRefresh?: boolean;
  
  /**
   * Internal flag: request is a retry attempt
   */
  _retry?: boolean;
  
  /**
   * Internal flag: CSRF token was already refreshed for this request
   */
  _csrfRetry?: boolean;
}

/**
 * Auth action decision from decision table
 */
export type AuthAction = 
  | 'ATTEMPT_REFRESH'    // Try refresh, then retry request
  | 'END_SESSION'        // Clear session, emit event, redirect to login
  | 'REJECT_IMMEDIATELY' // Return error to caller without refresh
  | 'REJECT_SILENTLY';   // Reject without logging/notifications

/**
 * Auth decision table entry
 */
export interface AuthDecision {
  action: AuthAction;
  reason: string;
}
```

### lib/types/error.ts

```typescript
/**
 * Backend error codes from error contract
 */
export enum ErrorCode {
  // Auth errors
  AUTH_TOKEN_MISSING = 'AUTH_TOKEN_MISSING',
  AUTH_TOKEN_EXPIRED = 'AUTH_TOKEN_EXPIRED',
  AUTH_TOKEN_INVALID = 'AUTH_TOKEN_INVALID',
  AUTH_REFRESH_MISSING = 'AUTH_REFRESH_MISSING',
  AUTH_REFRESH_EXPIRED = 'AUTH_REFRESH_EXPIRED',
  AUTH_REFRESH_INVALID = 'AUTH_REFRESH_INVALID',
  AUTH_INVALID_CREDENTIALS = 'AUTH_INVALID_CREDENTIALS',
  AUTH_USER_NOT_FOUND = 'AUTH_USER_NOT_FOUND',
  
  // Authorization errors
  FORBIDDEN = 'FORBIDDEN',
  CSRF_INVALID = 'CSRF_INVALID',
  
  // Validation errors
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  BAD_REQUEST = 'BAD_REQUEST',
  INVALID_INPUT = 'INVALID_INPUT',
  
  // Resource errors
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  GONE = 'GONE',
  
  // Upload errors
  UPLOAD_ERROR = 'UPLOAD_ERROR',
  UPLOAD_FILE_TOO_LARGE = 'UPLOAD_FILE_TOO_LARGE',
  UPLOAD_INVALID_FILE_TYPE = 'UPLOAD_INVALID_FILE_TYPE',
  PAYLOAD_TOO_LARGE = 'PAYLOAD_TOO_LARGE',
  
  // Rate limiting
  RATE_LIMITED = 'RATE_LIMITED',
  
  // Server errors
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  BAD_GATEWAY = 'BAD_GATEWAY',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  DATABASE_ERROR = 'DATABASE_ERROR',
  
  // Client-side errors
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

/**
 * Error severity for UI presentation
 */
export enum ErrorSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical',
}

/**
 * Error display context
 */
export type ErrorDisplayContext = 
  | 'toast'        // Show as toast notification
  | 'inline'       // Show inline in component
  | 'field'        // Show next to form field
  | 'form-alert'   // Show as form-level alert
  | 'page'         // Show as full-page error
  | 'silent';      // Log only, no UI
```

### lib/types/auth.ts

```typescript
export interface User {
  id: string;
  username: string;
  email: string;
  role: 'user' | 'admin';
  profilePicture?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

export interface TokenPayload {
  userId: string;
  role: string;
  exp: number;
  iat: number;
}

/**
 * Session termination reasons
 */
export type SessionEndReason =
  | 'expired'       // Refresh token expired
  | 'invalid'       // Token invalid or user not found
  | 'logout'        // User initiated logout
  | 'revoked';      // Token revoked by server
```

### lib/types/realtime.ts

```typescript
import { Socket } from 'socket.io-client';

/**
 * Socket connection state
 */
export enum ConnectionState {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  RECONNECTING = 'reconnecting',
  ERROR = 'error',
}

/**
 * Socket event types
 */
export interface SocketEvents {
  // Connection events
  'connection-state': ConnectionState;
  
  // Project events
  'project:updated': { projectId: string; data: any };
  'project:member-added': { projectId: string; member: any };
  'project:member-removed': { projectId: string; userId: string };
  
  // Task events
  'task:created': { projectId: string; task: any };
  'task:updated': { projectId: string; taskId: string; data: any };
  'task:deleted': { projectId: string; taskId: string };
  
  // Notification events
  'notification:new': { notification: any };
  
  // Chat events
  'message:new': { projectId: string; message: any };
}

/**
 * Socket manager interface
 */
export interface SocketManager {
  acquireSocket(): Socket;
  releaseSocket(): void;
  getConnectionState(): ConnectionState;
  isConnected(): boolean;
}
```

### lib/auth/events.ts

```typescript
import { EventEmitter } from 'events';
import { SessionEndReason } from '@/lib/types/auth';

/**
 * Session lifecycle events
 */
export interface SessionEvents {
  'session-ended': (data: { reason: SessionEndReason; timestamp: number }) => void;
  'session-restored': () => void;
  'token-refreshed': () => void;
}

/**
 * Typed event emitter for session events
 */
class SessionEventEmitter extends EventEmitter {
  on<K extends keyof SessionEvents>(
    event: K,
    listener: SessionEvents[K]
  ): this {
    return super.on(event, listener);
  }

  emit<K extends keyof SessionEvents>(
    event: K,
    ...args: Parameters<SessionEvents[K]>
  ): boolean {
    return super.emit(event, ...args);
  }

  off<K extends keyof SessionEvents>(
    event: K,
    listener: SessionEvents[K]
  ): this {
    return super.off(event, listener);
  }
}

export const sessionEvents = new SessionEventEmitter();

// Debounce session-ended events to prevent duplicates
let lastSessionEndTime = 0;
const SESSION_END_DEBOUNCE_MS = 2000;

export function emitSessionEnded(reason: SessionEndReason): void {
  const now = Date.now();
  if (now - lastSessionEndTime < SESSION_END_DEBOUNCE_MS) {
    return; // Skip duplicate
  }
  lastSessionEndTime = now;
  sessionEvents.emit('session-ended', { reason, timestamp: now });
}
```

### lib/constants/routes.ts

```typescript
/**
 * Centralized route constants for type-safe navigation
 * Prevents route literal strings scattered across codebase
 */
export const ROUTES = {
  // Public routes
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  
  // Workspace routes
  DASHBOARD: '/dashboard',
  PROJECTS: '/projects',
  PROJECT_DETAIL: (id: string) => `/projects/${id}`,
  TASKS: '/tasks',
  TEAMS: '/teams',
  TEAM_INVITATION: '/team-invitation',
  WORKSPACE: '/workspace',
  NOTIFICATIONS: '/notifications',
  PROFILE: '/profile',
  SETTINGS: '/settings',
  
  // Admin routes
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_USERS: '/admin/users',
  ADMIN_PROJECTS: '/admin/projects',
  ADMIN_ANALYTICS: '/admin/analytics',
  ADMIN_SETTINGS: '/admin/settings',
} as const;

/**
 * Legacy route redirects for backward compatibility
 */
export const LEGACY_REDIRECTS: Record<string, string> = {
  '/user-dashboard': ROUTES.DASHBOARD,
  '/user-projects': ROUTES.PROJECTS,
  '/user-tasks': ROUTES.TASKS,
  '/user-teams': ROUTES.TEAMS,
  '/user-notifications': ROUTES.NOTIFICATIONS,
  '/user-workspace': ROUTES.WORKSPACE,
  '/user-profile': ROUTES.PROFILE,
};
```

---

## Authentication Decision Table

### lib/auth/authPolicy.ts

The decision table determines how to handle authentication errors:

```typescript
/**
 * Decide authentication action based on response status, error code, and endpoint
 */
export function decideAuthAction(
  status: number,
  code: string | undefined,
  endpoint: string
): AuthDecision {
  // Rule 1: Never refresh auth endpoints themselves
  if (isAuthEndpoint(endpoint)) {
    return {
      action: 'REJECT_IMMEDIATELY',
      reason: 'Auth endpoints do not trigger refresh',
    };
  }

  // Rule 2: Handle 401 responses
  if (status === 401) {
    // No error code provided - attempt refresh (legacy backend compatibility)
    if (!code) {
      return {
        action: 'ATTEMPT_REFRESH',
        reason: 'No error code; attempting refresh for backward compatibility',
      };
    }

    // Token expired or missing - attempt refresh
    if (code === ErrorCode.AUTH_TOKEN_EXPIRED || code === ErrorCode.AUTH_TOKEN_MISSING) {
      return {
        action: 'ATTEMPT_REFRESH',
        reason: `Token ${code === ErrorCode.AUTH_TOKEN_EXPIRED ? 'expired' : 'missing'}`,
      };
    }

    // Token invalid or user not found - end session immediately
    if (
      code === ErrorCode.AUTH_TOKEN_INVALID ||
      code === ErrorCode.AUTH_USER_NOT_FOUND ||
      code.startsWith('AUTH_REFRESH_')
    ) {
      return {
        action: 'END_SESSION',
        reason: `Non-refreshable auth error: ${code}`,
      };
    }

    // Other 401 codes - attempt refresh
    return {
      action: 'ATTEMPT_REFRESH',
      reason: 'Unknown 401 error code; attempting refresh',
    };
  }

  // Rule 3: Handle 403 CSRF errors
  if (status === 403) {
    if (code === ErrorCode.CSRF_INVALID || isCsrfError(endpoint, code)) {
      // CSRF errors are handled by separate CSRF retry logic
      return {
        action: 'REJECT_IMMEDIATELY',
        reason: 'CSRF error handled by CSRF retry logic',
      };
    }

    // Other 403 (e.g., FORBIDDEN role check)
    return {
      action: 'REJECT_IMMEDIATELY',
      reason: 'Non-auth 403 error',
    };
  }

  // Rule 4: All other errors
  return {
    action: 'REJECT_IMMEDIATELY',
    reason: 'Non-auth error',
  };
}

/**
 * Check if endpoint is an authentication endpoint that should never trigger refresh
 */
function isAuthEndpoint(endpoint: string): boolean {
  const authPaths = [
    '/auth/login',
    '/auth/register',
    '/auth/logout',
    '/auth/refresh',
    '/csrf-token',
  ];
  return authPaths.some((path) => endpoint.includes(path));
}

/**
 * Detect CSRF errors from message (legacy backend compatibility)
 */
function isCsrfError(message: string | undefined, code: string | undefined): boolean {
  if (!message) return false;
  return /csrf/i.test(message);
}
```

### Decision Table Summary

| Status | Code | Endpoint | Action | Reason |
|--------|------|----------|--------|--------|
| 401 | `AUTH_TOKEN_EXPIRED` | Any non-auth | `ATTEMPT_REFRESH` | Token expired, try refresh |
| 401 | `AUTH_TOKEN_MISSING` | Any non-auth | `ATTEMPT_REFRESH` | Token missing, try refresh |
| 401 | `AUTH_TOKEN_INVALID` | Any non-auth | `END_SESSION` | Invalid token, cannot refresh |
| 401 | `AUTH_USER_NOT_FOUND` | Any non-auth | `END_SESSION` | User deleted, cannot continue |
| 401 | `AUTH_REFRESH_*` | Any non-auth | `END_SESSION` | Refresh failed, session over |
| 401 | (no code) | Any non-auth | `ATTEMPT_REFRESH` | Legacy format, attempt refresh |
| 401 | Any | `/auth/*`, `/csrf-token` | `REJECT_IMMEDIATELY` | Never refresh auth endpoints |
| 403 | `CSRF_INVALID` | Any | `REJECT_IMMEDIATELY` | Handled by CSRF retry |
| 403 | message ~/csrf/i | Any | `REJECT_IMMEDIATELY` | Legacy CSRF detection |
| 403 | `FORBIDDEN` | Any | `REJECT_IMMEDIATELY` | Role check failed |
| Other | Any | Any | `REJECT_IMMEDIATELY` | Not an auth error |

---

## Authentication & Session Management Implementation

### lib/auth/refresh.ts

Single-flight token refresh implementation:

```typescript
import apiClient from '@/lib/api/client';
import { getCsrfToken, fetchFreshCsrf } from '@/lib/api/csrf';
import { ErrorCode } from '@/lib/types/error';
import { emitSessionEnded } from './events';

let refreshPromise: Promise<boolean> | null = null;

/**
 * Attempt to refresh the access token using the refresh token
 * Implements single-flight pattern to prevent concurrent refresh requests
 * 
 * @returns Promise<boolean> - true if refresh succeeded, false otherwise
 */
export async function refreshSession(): Promise<boolean> {
  // If refresh already in progress, await the same promise
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      // Get CSRF token (check memory cache → localStorage → fetch)
      let csrfToken = getCsrfToken();
      
      const response = await apiClient.post(
        '/auth/refresh',
        {},
        {
          headers: {
            'X-CSRF-Token': csrfToken,
          },
          skipAuthRefresh: true, // Prevent infinite loop
        }
      );

      // Refresh successful
      // New access token is automatically set by backend via cookie
      return true;
    } catch (error: any) {
      const status = error.response?.status;
      const code = error.response?.data?.code;

      // If CSRF failed on refresh, try fetching fresh CSRF and retry once
      if (status === 403 && code === ErrorCode.CSRF_INVALID) {
        try {
          const freshCsrf = await fetchFreshCsrf();
          const retryResponse = await apiClient.post(
            '/auth/refresh',
            {},
            {
              headers: {
                'X-CSRF-Token': freshCsrf,
              },
              skipAuthRefresh: true,
            }
          );
          return true;
        } catch (retryError: any) {
          // CSRF retry failed, proceed to error handling
          const retryStatus = retryError.response?.status;
          const retryCode = retryError.response?.data?.code;
          
          if (retryStatus === 401 && retryCode?.startsWith('AUTH_REFRESH_')) {
            emitSessionEnded('expired');
          }
          return false;
        }
      }

      // Network error (5xx, timeout, connection failure) - preserve session
      if (!error.response || status >= 500) {
        // Session state remains intact; user can retry
        return false;
      }

      // 401 with AUTH_REFRESH_* codes - end session
      if (status === 401 && code?.startsWith('AUTH_REFRESH_')) {
        emitSessionEnded(code === ErrorCode.AUTH_REFRESH_EXPIRED ? 'expired' : 'invalid');
        return false;
      }

      // Other errors - don't end session, just fail refresh
      return false;
    } finally {
      // Clear promise after completion (success or failure)
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

/**
 * Clear local session data
 */
export function clearSession(): void {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem('userInfo');
  localStorage.removeItem('adminInfo');
  localStorage.removeItem('csrfToken');
  // Cookies are httpOnly and cleared by server on logout
}

/**
 * Get post-authentication redirect path
 * Validates 'next' parameter to prevent open redirect
 */
export function getPostAuthPath(nextParam: string | null): string {
  if (!nextParam) return '/dashboard';
  
  // Only allow relative paths (prevent open redirect)
  if (!nextParam.startsWith('/')) return '/dashboard';
  
  // Exclude auth pages from redirect
  const excludedPaths = ['/login', '/register', '/forgot-password', '/reset-password'];
  if (excludedPaths.some(path => nextParam.startsWith(path))) {
    return '/dashboard';
  }
  
  return nextParam;
}
```

### lib/api/csrf.ts

CSRF token management:

```typescript
import apiClient from './client';

// In-memory cache for CSRF token
let csrfTokenCache: string | null = null;

/**
 * Get CSRF token from cache, localStorage, or cookie
 */
export function getCsrfToken(): string {
  // Check memory cache first
  if (csrfTokenCache) {
    return csrfTokenCache;
  }

  // Check localStorage
  if (typeof window !== 'undefined') {
    const storedToken = localStorage.getItem('csrfToken');
    if (storedToken) {
      csrfTokenCache = storedToken;
      return storedToken;
    }

    // Check cookie (document.cookie)
    const match = document.cookie.match(/csrfToken=([^;]+)/);
    if (match) {
      const token = match[1];
      csrfTokenCache = token;
      // Store in localStorage for future use
      localStorage.setItem('csrfToken', token);
      return token;
    }
  }

  return '';
}

/**
 * Fetch fresh CSRF token from server
 */
export async function fetchFreshCsrf(): Promise<string> {
  const response = await apiClient.get('/csrf-token', {
    skipAuthRefresh: true, // Never refresh on CSRF endpoint
    noRetry: true,
  });

  const token = response.data.csrfToken;
  csrfTokenCache = token;

  if (typeof window !== 'undefined') {
    localStorage.setItem('csrfToken', token);
  }

  return token;
}

/**
 * Clear CSRF token (e.g., on logout)
 */
export function clearCsrfToken(): void {
  csrfTokenCache = null;
  if (typeof window !== 'undefined') {
    localStorage.removeItem('csrfToken');
  }
}
```

### SessionWatcher Provider

```typescript
// app/providers/SessionWatcher.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch } from '@/store/hooks';
import { logout } from '@/store/authSlice';
import { sessionEvents } from '@/lib/auth/events';
import { getPostAuthPath } from '@/lib/auth/refresh';
import { SessionEndReason } from '@/lib/types/auth';

export function SessionWatcher({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const dispatch = useAppDispatch();

  useEffect(() => {
    const handleSessionEnded = ({ reason }: { reason: SessionEndReason; timestamp: number }) => {
      // Dispatch logout action to clear Redux state
      dispatch(logout());

      // Build redirect URL with reason and current path
      const currentPath = window.location.pathname;
      const nextPath = currentPath !== '/login' ? currentPath : '';
      const reasonParam = reason === 'expired' ? 'session_expired' : 'session_invalid';
      
      const redirectUrl = `/login?reason=${reasonParam}${nextPath ? `&next=${encodeURIComponent(nextPath)}` : ''}`;
      
      router.push(redirectUrl);
    };

    sessionEvents.on('session-ended', handleSessionEnded);

    return () => {
      sessionEvents.off('session-ended', handleSessionEnded);
    };
  }, [dispatch, router]);

  return <>{children}</>;
}
```

---

