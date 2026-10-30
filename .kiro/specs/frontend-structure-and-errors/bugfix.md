# Bugfix Requirements Document

## Introduction

This document specifies requirements for fixing critical architectural defects in the Next.js frontend (/client directory) of a full-stack project management application. The system currently suffers from scattered error handling, improper authentication retry logic, unorganized folder structure, and multiple real-time connection management issues that compromise reliability, maintainability, and user experience.

The refactoring addresses production-readiness concerns while maintaining complete backward compatibility with existing URLs, storage keys, visual design, and user workflows. The fixes enable proper error recovery, single-flight token refresh, centralized error normalization supporting dual backend error contracts, and improved code organization following Next.js App Router best practices.

## Bug Analysis

### Current Behavior (Defect)

#### 1. Authentication & Token Refresh Issues

1.1 WHEN any endpoint returns 401 status THEN the system attempts token refresh regardless of whether the endpoint is an authentication route (login, logout, register, refresh) or the specific error code indicates non-refreshable failure

1.2 WHEN token refresh is triggered multiple times simultaneously (e.g., multiple parallel API calls receive 401) THEN the system initiates multiple concurrent refresh requests instead of a single-flight promise

1.3 WHEN token refresh fails due to network errors (5xx, timeout, connection failure) THEN the system immediately logs the user out and destroys the session instead of preserving the session state and showing a connectivity error

1.4 WHEN a 401 response contains error codes AUTH_TOKEN_INVALID, AUTH_USER_NOT_FOUND, or AUTH_REFRESH_* THEN the system attempts to refresh the token instead of immediately ending the session

1.5 WHEN CSRF validation fails (403 + CSRF_INVALID or message matching /csrf/i) THEN the system does not attempt to fetch a fresh CSRF token and retry the request

1.6 WHEN reading CSRF token during refresh operations THEN the system only reads from document.cookie instead of checking both cookie storage and the csrfToken localStorage key

#### 2. Session Management & Route Protection Issues

1.7 WHEN /user/me endpoint fails with any error in (user)/layout.tsx THEN the system logs the user out without distinguishing between transient network errors and actual authentication failures

1.8 WHEN a user is redirected to login due to authentication failure THEN the system does not preserve the original destination URL in a "next" parameter for post-login redirect

1.9 WHEN route protection logic needs to verify user authentication THEN the logic is scattered across individual page components instead of centralized route guards

#### 3. Error Handling & Normalization Issues

1.10 WHEN backend returns errors in legacy format ({ message } or { errors: [{ msg, path }] } or non-JSON HTML/text) THEN the system does not normalize these to a consistent internal format

1.11 WHEN backend returns errors in new format ({ status, code, message, errors, requestId }) THEN the system does not extract and utilize the error code for intelligent error handling decisions

1.12 WHEN error responses are received from API calls THEN 18 instances use console.error to swallow failures silently without user notification or proper logging

1.13 WHEN exceptions occur in async operations (task updates, task creation, task deletion, user search) THEN multiple empty catch blocks suppress errors completely

1.14 WHEN form validation errors are received THEN field-level errors (with field/path information) are not distinguished from form-level errors and are not properly routed to field-specific UI components

1.15 WHEN 5xx server errors occur THEN raw technical error messages are displayed to users instead of user-friendly messages with request IDs for support reference

#### 4. API Client Architecture Issues

1.16 WHEN components or pages need to make API calls THEN 17 files import axios directly and make raw api.* calls (~50 instances) outside the lib/ directory, bypassing centralized configuration

1.17 WHEN lib/axios.ts initializes THEN it imports the Redux store directly, creating tight coupling between the API client and state management

1.18 WHEN API interceptors need to handle responses THEN request/response interceptors are incomplete and do not implement centralized error normalization or retry policies

#### 5. Route Structure & Organization Issues

1.19 WHEN admin routes import their layout THEN six admin wrapper layouts reference (admin)/layout which may be missing, causing layout resolution failures

1.20 WHEN user routes are organized THEN seven alias route folders (dashboard, projects, tasks, teams, team-invitation, workspace, notifications) duplicate content from (user)/user-* pages, creating maintenance burden and inconsistent behavior

1.21 WHEN routes are grouped THEN inconsistent grouping patterns (some routes in groups, others not) make the structure difficult to understand and maintain

#### 6. Real-time Connection Management Issues

1.22 WHEN components need socket.io connections THEN four separate files ((user)/layout, user-projects/page, user-projects/[id]/page, components/chat/ProjectChat) each create independent socket connections instead of sharing a single managed instance

1.23 WHEN socket connections encounter errors or need reconnection THEN each component handles it independently without centralized connection state management

#### 7. Type & Code Organization Issues

1.24 WHEN type definitions are needed THEN 16 inline interface/type declarations exist in page files with duplicates (Project, ProjectMember, User types declared multiple times)

1.25 WHEN User type is referenced THEN it is declared twice in different locations (authSlice and types/user), potentially causing type inconsistencies

1.26 WHEN shared types are needed across features THEN types are scattered across files instead of organized in a centralized lib/types structure

### Expected Behavior (Correct)

#### 2. Authentication & Token Refresh Corrections

2.1 WHEN any endpoint returns 401 status THEN the system SHALL consult an authentication decision table to determine if refresh should be attempted based on: (a) the specific error code if present (AUTH_TOKEN_EXPIRED, AUTH_TOKEN_MISSING allow refresh; AUTH_TOKEN_INVALID, AUTH_USER_NOT_FOUND, AUTH_REFRESH_* deny refresh), (b) the route path (authentication routes /auth/*, /csrf-token never refresh), and (c) absence of error code defaults to attempting refresh

2.2 WHEN token refresh is triggered multiple times simultaneously THEN the system SHALL use a single-flight promise pattern to ensure only one refresh request is in progress, with all concurrent callers awaiting the same promise

2.3 WHEN token refresh fails due to network errors (5xx, timeout, connection failure) THEN the system SHALL preserve the stored session state, show a user-friendly connectivity error message, and allow the user to retry without destroying their session

2.4 WHEN a 401 response contains error codes AUTH_TOKEN_INVALID, AUTH_USER_NOT_FOUND, or any AUTH_REFRESH_* code THEN the system SHALL immediately end the session without attempting token refresh

2.5 WHEN CSRF validation fails (403 status with CSRF_INVALID code or message matching /csrf/i) THEN the system SHALL fetch a fresh CSRF token from the /csrf-token endpoint and retry the original request once

2.6 WHEN reading CSRF token during any operation THEN the system SHALL check both document.cookie and localStorage['csrfToken'] to ensure token availability across different storage mechanisms

#### 3. Session Management & Route Protection Corrections

2.7 WHEN /user/me endpoint fails in route guards or layouts THEN the system SHALL distinguish between (a) 401/403 authentication failures requiring logout, (b) network errors (5xx, timeout) requiring retry with session preservation, and (c) other errors that may be transient

2.8 WHEN a user is redirected to login due to authentication failure THEN the system SHALL preserve the original destination URL as a "next" query parameter and redirect to that URL after successful login

2.9 WHEN route protection is needed THEN the system SHALL use centralized authentication guard logic in route layouts that can be consistently applied across (workspace), (admin), and protected (public) routes

#### 4. Error Handling & Normalization Corrections

2.10 WHEN backend returns errors in legacy format THEN the system SHALL normalize them to the internal AppError format: extracting message from { message }, converting { errors: [{ msg, path }] } to field errors, and wrapping non-JSON responses as INTERNAL_ERROR with raw content in metadata

2.11 WHEN backend returns errors in new format THEN the system SHALL extract status, code, message, field-level errors array, and requestId into the internal AppError format for consistent handling

2.12 WHEN error responses are received from API calls THEN the system SHALL replace all console.error calls with proper error handling that (a) normalizes the error, (b) routes it to appropriate UI (toast/field/page), (c) logs structured error data for debugging, and (d) never silently swallows errors

2.13 WHEN exceptions occur in async operations THEN the system SHALL replace all empty catch blocks with proper error handling that notifies users, logs errors appropriately, and maintains application state integrity

2.14 WHEN form validation errors are received THEN the system SHALL route field-level errors (containing field/path) to FieldError components with ARIA attributes and form-level errors to FormAlert components

2.15 WHEN 5xx server errors occur THEN the system SHALL display user-friendly generic messages ("Something went wrong. Please try again.") and include the requestId when available for user support reference

#### 5. API Client Architecture Corrections

2.16 WHEN components or pages need to make API calls THEN the system SHALL route all API calls through a service layer (lib/services/*) with no direct axios imports outside lib/api, lib/auth, and lib/realtime

2.17 WHEN lib/axios.ts initializes THEN it SHALL NOT import the Redux store directly; instead it SHALL accept token/CSRF accessors as configuration to decouple API client from state management

2.18 WHEN API responses are intercepted THEN request/response interceptors SHALL implement: (a) automatic CSRF token injection, (b) automatic bearer token injection, (c) centralized error normalization, (d) authentication decision table for 401/403, (e) transient retry policy for GET/HEAD requests with network/5xx errors (max 2 retries with exponential backoff)

#### 6. Route Structure & Organization Corrections

2.19 WHEN admin routes are accessed THEN the system SHALL ensure (admin)/layout.tsx exists and properly wraps all admin routes with consistent layout, authentication checks, and role verification

2.20 WHEN user routes are organized THEN the system SHALL consolidate all seven alias folders (dashboard, projects, tasks, teams, team-invitation, workspace, notifications) into the (workspace) group, with lightweight redirects from legacy /user-* paths to new paths if needed to maintain URL backward compatibility

2.21 WHEN routes are grouped THEN the system SHALL use consistent Next.js App Router conventions: (public) for unauthenticated routes, (workspace) for authenticated user workspace, (admin) for admin panel, with all route groups having appropriate layouts

#### 7. Real-time Connection Management Corrections

2.22 WHEN socket.io connections are needed THEN the system SHALL provide a single shared socket instance through lib/realtime/socket.ts with centralized connection management, automatic reconnection, and connection state tracking

2.23 WHEN socket connections encounter errors or disconnections THEN the system SHALL handle reconnection centrally with exponential backoff, emit connection state events that components can subscribe to, and automatically re-establish subscriptions after reconnection

#### 8. Type & Code Organization Corrections

2.24 WHEN type definitions are needed THEN the system SHALL consolidate all 16 inline type declarations into organized lib/types/* modules grouped by domain (projects, tasks, users, teams, etc.)

2.25 WHEN User type is referenced THEN the system SHALL maintain a single canonical User type definition in lib/types/user.ts that is imported consistently across authSlice and all other modules

2.26 WHEN shared types are needed THEN the system SHALL organize types in lib/types with clear domain separation (api.ts for API contracts, error.ts for error types, auth.ts for authentication types, etc.)

### Unchanged Behavior (Regression Prevention)

#### 3. URL & Routing Preservation

3.1 WHEN users access existing URLs THEN the system SHALL CONTINUE TO resolve those URLs to the same pages and functionality without breaking links or bookmarks

3.2 WHEN route paths are reorganized internally THEN the system SHALL CONTINUE TO maintain all existing user-facing routes (/login, /dashboard, /projects, /tasks, /teams, /workspace, /admin/*, etc.) through redirects if necessary

#### 4. Storage & State Preservation

3.3 WHEN the application reads authentication state THEN the system SHALL CONTINUE TO use the same localStorage keys: userInfo, adminInfo, csrfToken (no key name changes)

3.4 WHEN the application reads theme preferences THEN the system SHALL CONTINUE TO use the orbit-theme localStorage key

3.5 WHEN existing user sessions are active THEN the system SHALL CONTINUE TO recognize and maintain those sessions after the refactoring is deployed

#### 5. Visual Design & Markup Preservation

3.6 WHEN pages and components are refactored THEN the system SHALL CONTINUE TO use all existing CSS class names without changes

3.7 WHEN HTML markup is reorganized for error handling THEN the system SHALL CONTINUE TO maintain existing DOM structure for non-error states to ensure CSS and JavaScript compatibility

3.8 WHEN visual components are rendered THEN the system SHALL CONTINUE TO produce identical visual appearance (no design changes)

#### 6. Backend Integration Preservation

3.9 WHEN API requests are made THEN the system SHALL CONTINUE TO send requests to the same backend endpoints with identical request formats

3.10 WHEN form submissions occur THEN the system SHALL CONTINUE TO submit the same field names and data structures expected by the backend

3.11 WHEN file uploads are performed THEN the system SHALL CONTINUE TO use the same multipart/form-data structure and field names

#### 7. Feature Functionality Preservation

3.12 WHEN users perform task management operations (create, update, delete, filter, search) THEN the system SHALL CONTINUE TO provide identical functionality

3.13 WHEN users manage projects (create, update, members, settings) THEN the system SHALL CONTINUE TO provide identical functionality

3.14 WHEN users interact with team features (invitations, members, roles) THEN the system SHALL CONTINUE TO provide identical functionality

3.15 WHEN users access real-time features (chat, notifications, live updates) THEN the system SHALL CONTINUE TO provide identical functionality

3.16 WHEN admin users access admin panel features THEN the system SHALL CONTINUE TO provide identical functionality

#### 8. Build & Development Process Preservation

3.17 WHEN TypeScript compilation is run THEN the system SHALL CONTINUE TO compile without errors after each phase

3.18 WHEN linting is run THEN the system SHALL CONTINUE TO pass all lint checks after each phase (new ESLint rules may be added)

3.19 WHEN production builds are created THEN the system SHALL CONTINUE TO build successfully with Next.js build command

3.20 WHEN the development server runs THEN the system SHALL CONTINUE TO start without errors and enable hot reloading

#### 9. Successful Operations Preservation

3.21 WHEN API requests succeed (2xx responses) THEN the system SHALL CONTINUE TO process successful responses identically

3.22 WHEN authentication succeeds THEN the system SHALL CONTINUE TO store tokens and user information identically

3.23 WHEN users navigate between pages THEN the system SHALL CONTINUE TO maintain navigation state and history correctly

3.24 WHEN forms are submitted successfully THEN the system SHALL CONTINUE TO show success feedback and update UI state identically
