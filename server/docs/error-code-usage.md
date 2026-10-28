# Error Code Usage Table

| Code | HTTP | Emit Sites |
|------|------|------------|
| AUTH_TOKEN_MISSING | 401 | admin.middleware.js:12, auth.middleware.js:13, socket-auth.middleware.js:14 |
| AUTH_TOKEN_EXPIRED | 401 | error.middleware.js:81 (JWT handler), socket-auth.middleware.js:22 |
| AUTH_TOKEN_INVALID | 401 | admin.middleware.js:28, error.middleware.js:86/91 (JWT handler), socket-auth.middleware.js:24/34 |
| AUTH_REFRESH_MISSING | 401 | auth.controller.js:281 |
| AUTH_REFRESH_EXPIRED | 401 | auth.controller.js:290 |
| AUTH_REFRESH_INVALID | 401 | auth.controller.js:292/299 |
| AUTH_INVALID_CREDENTIALS | 400 | auth.controller.js:145/150 |
| AUTH_USER_NOT_FOUND | 401 | auth.controller.js:305, auth.middleware.js:35, socket-auth.middleware.js:41 |
| AUTH_RESET_TOKEN_INVALID | 401 | auth.controller.js:399 |
| FORBIDDEN | 403 | admin.middleware.js:40, error.middleware.js:115 (CORS handler) |
| CSRF_INVALID | 403 | security.middleware.js:82 |
| VALIDATION_ERROR | 422 | validation.util.js:28, admin.routes.js:21/39, auth.controller.js:392 |
| BAD_REQUEST | 400 | error.middleware.js:134 (JSON parse) |
| INVALID_INPUT | 400 | mongo-id.middleware.js:6, error.middleware.js:39/46/123 (Prisma handlers) |
| NOT_FOUND | 404 | app.js catch-all route |
| CONFLICT | 409 | auth.controller.js:90, error.middleware.js:27 (Prisma unique constraint) |
| GONE | 410 | UNUSED |
| UPLOAD_ERROR | 400 | error.middleware.js:104 (multer handler) |
| UPLOAD_FILE_TOO_LARGE | 400 | error.middleware.js:100 (multer handler) |
| UPLOAD_INVALID_FILE_TYPE | 400 | error.middleware.js:110 (multer handler) |
| PAYLOAD_TOO_LARGE | 413 | error.middleware.js:139 (body-parser handler) |
| RATE_LIMITED | 429 | rate-limit.util.js:24 |
| INTERNAL_ERROR | 500 | error.middleware.js:153/170 (fallback handler) |
| BAD_GATEWAY | 502 | UNUSED (AppError factory defined, no call sites) |
| SERVICE_UNAVAILABLE | 503 | auth.controller.js:173, admin.middleware.js:52, auth.middleware.js:47, socket-auth.middleware.js:51, error.middleware.js:128 (Prisma connection) |
| DATABASE_ERROR | 500 | error.middleware.js:50 (unhandled Prisma errors) |

## Codes Defined But Never Emitted

- **GONE** (410): Defined in error-codes.js and AppError factory, but no call sites
- **BAD_GATEWAY** (502): Defined in AppError factory, but no call sites

