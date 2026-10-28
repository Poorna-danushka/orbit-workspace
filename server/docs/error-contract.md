# Backend Error Contract

## Standard Error Response Format

Every error response from `/api/*` endpoints follows this structure:

```json
{
  "status": 422,
  "code": "VALIDATION_ERROR",
  "message": "Human-readable error description safe to show to users",
  "errors": [
    {
      "field": "email",
      "message": "Email is required",
      "msg": "Email is required"
    }
  ],
  "requestId": "550e8400-e29b-41d4-a716-446655440000"
}
```

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `status` | number | ✅ Yes | HTTP status code (echoed for convenience) |
| `code` | string | ✅ Yes | Machine-readable error code (see table below) |
| `message` | string | ✅ Yes | Human-readable error message (safe to display) |
| `errors` | array | ❌ No | Validation errors only (field-level details) |
| `requestId` | string | ✅ Yes | Unique request identifier for debugging |

### Error Array Format

The `errors` array appears **only for validation failures** (status 422). Each item contains:

```json
{
  "field": "username",
  "message": "Username must be 3 to 50 characters",
  "msg": "Username must be 3 to 50 characters"
}
```

**Note**: The `msg` field is **temporarily included** for backward compatibility with the current frontend. It will be removed in a future release. New frontend code should read `message` instead.

---

## Error Codes

| Code | HTTP Status | When Used | Client Action |
|------|-------------|-----------|---------------|
| **AUTH_TOKEN_MISSING** | 401 | No `accessToken` cookie present | Redirect to login |
| **AUTH_TOKEN_EXPIRED** | 401 | Access token has expired (JWT `exp` claim) | **Trigger silent refresh** → retry request |
| **AUTH_TOKEN_INVALID** | 401 | Access token is malformed, has invalid signature, or `nbf` not satisfied | Redirect to login |
| **AUTH_REFRESH_MISSING** | 401 | No `refreshToken` cookie on `/auth/refresh` | Redirect to login |
| **AUTH_REFRESH_EXPIRED** | 401 | Refresh token has expired | **Logout + redirect to login** |
| **AUTH_REFRESH_INVALID** | 401 | Refresh token is invalid, revoked, or user deleted | **Logout + redirect to login** |
| **AUTH_INVALID_CREDENTIALS** | 400 | Wrong email/password on `/auth/login` | Show inline error |
| **AUTH_USER_NOT_FOUND** | 401 | Token is valid but user no longer exists | Logout + redirect to login |
| **FORBIDDEN** | 403 | User lacks required role (e.g., admin-only endpoint) | Show "Access denied" |
| **CSRF_INVALID** | 403 | Missing or invalid `X-CSRF-Token` header | Fetch new CSRF token → retry once |
| **VALIDATION_ERROR** | 422 | Request body/params failed validation | Show field-level errors from `errors[]` |
| **BAD_REQUEST** | 400 | Malformed request (e.g., invalid JSON, wrong data type) | Show generic error |
| **INVALID_INPUT** | 400 | Invalid ID format, foreign key violation, etc. | Show error message |
| **NOT_FOUND** | 404 | Resource not found (user, project, task, etc.) | Show "Not found" |
| **CONFLICT** | 409 | Unique constraint violation (duplicate email, etc.) | Show specific conflict message |
| **GONE** | 410 | Resource permanently unavailable | Show "No longer available" |
| **UPLOAD_ERROR** | 400 | Generic file upload failure | Show error message |
| **UPLOAD_FILE_TOO_LARGE** | 400 | File exceeds 15MB limit | Show "File too large" |
| **UPLOAD_INVALID_FILE_TYPE** | 400 | File type not allowed | Show "Invalid file type" |
| **PAYLOAD_TOO_LARGE** | 413 | Request body exceeds size limit | Show "Payload too large" |
| **RATE_LIMITED** | 429 | Too many requests from this client | Show "Slow down" + retry with backoff |
| **INTERNAL_ERROR** | 500 | Unexpected server error | Show generic "Server error" |
| **BAD_GATEWAY** | 502 | Upstream service failed (e.g., Cloudinary) | Show "External service unavailable" |
| **SERVICE_UNAVAILABLE** | 503 | Database connection failed or server overloaded | Show "Service temporarily unavailable" |
| **DATABASE_ERROR** | 500 | Database operation failed (unhandled Prisma error) | Show generic "Server error" |

---

## Critical Rules for Client Implementation

### 1. Silent Refresh Trigger

**Only `AUTH_TOKEN_EXPIRED`** should trigger a silent token refresh:

```javascript
if (error.response?.status === 401 && error.response?.data?.code === 'AUTH_TOKEN_EXPIRED') {
  // Attempt refresh
}
```

Do **not** refresh on:
- `AUTH_TOKEN_MISSING` (user never logged in)
- `AUTH_TOKEN_INVALID` (token corrupted or forged)
- `AUTH_USER_NOT_FOUND` (account deleted)

### 2. Logout Trigger

Logout and redirect to login on:
- `AUTH_REFRESH_EXPIRED`
- `AUTH_REFRESH_INVALID`
- `AUTH_USER_NOT_FOUND`

### 3. CSRF Retry

Detect CSRF failures via:

```javascript
if (error.response?.status === 403 && error.response?.data?.code === 'CSRF_INVALID') {
  // Fetch new CSRF token from /api/csrf-token
  // Retry request once
}
```

Or legacy detection (for backward compatibility):

```javascript
if (error.response?.status === 403 && error.response?.data?.message?.toLowerCase().includes('csrf')) {
  // Same retry logic
}
```

### 4. Validation Errors

Display field-level errors from `errors[]`:

```javascript
if (error.response?.data?.errors) {
  error.response.data.errors.forEach(err => {
    showFieldError(err.field, err.message); // or err.msg (temporary)
  });
}
```

---

## Examples

### Example 1: Expired Access Token

**Request:**
```http
GET /api/user/me
Cookie: accessToken=expired_jwt_here
```

**Response:**
```json
{
  "status": 401,
  "code": "AUTH_TOKEN_EXPIRED",
  "message": "Your session has expired. Please sign in again.",
  "requestId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
}
```

**Client Action**: Call `/api/auth/refresh`, then retry `/api/user/me`.

---

### Example 2: Validation Error

**Request:**
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "ab",
  "email": "not-an-email",
  "password": "short"
}
```

**Response:**
```json
{
  "status": 422,
  "code": "VALIDATION_ERROR",
  "message": "Validation failed",
  "errors": [
    {
      "field": "username",
      "message": "Username must be 3 to 50 characters",
      "msg": "Username must be 3 to 50 characters"
    },
    {
      "field": "email",
      "message": "Valid email is required",
      "msg": "Valid email is required"
    },
    {
      "field": "password",
      "message": "Password must be 8 to 72 bytes",
      "msg": "Password must be 8 to 72 bytes"
    }
  ],
  "requestId": "b2c3d4e5-f6g7-8901-bcde-f12345678901"
}
```

**Client Action**: Display field errors inline in the form.

---

### Example 3: Not Found

**Request:**
```http
GET /api/projects/60c72b2f4f1a2c001f8e4c3f
Cookie: accessToken=valid_jwt
```

**Response:**
```json
{
  "status": 404,
  "code": "NOT_FOUND",
  "message": "Project not found",
  "requestId": "c3d4e5f6-g7h8-9012-cdef-123456789012"
}
```

**Client Action**: Show "Project not found" message.

---

### Example 4: CSRF Validation Failed

**Request:**
```http
POST /api/projects
Content-Type: application/json
Cookie: csrfToken=abc123

{
  "title": "New Project"
}
```

*Missing `X-CSRF-Token` header*

**Response:**
```json
{
  "status": 403,
  "code": "CSRF_INVALID",
  "message": "CSRF validation failed: Invalid or missing token",
  "requestId": "d4e5f6g7-h8i9-0123-defg-234567890123"
}
```

**Client Action**: Fetch CSRF token from `/api/csrf-token`, retry request with `X-CSRF-Token` header.

---

### Example 5: Invalid Refresh Token

**Request:**
```http
POST /api/auth/refresh
Cookie: refreshToken=revoked_or_invalid_jwt
```

**Response:**
```json
{
  "status": 401,
  "code": "AUTH_REFRESH_INVALID",
  "message": "Invalid or expired refresh token",
  "requestId": "e5f6g7h8-i9j0-1234-efgh-345678901234"
}
```

**Client Action**: Clear local auth state, redirect to `/login`.

---

### Example 6: Admin Access Required

**Request:**
```http
GET /api/admin/stats
Cookie: accessToken=valid_user_jwt
```

*User role is "user", not "admin"*

**Response:**
```json
{
  "status": 403,
  "code": "FORBIDDEN",
  "message": "Admin access required",
  "requestId": "f6g7h8i9-j0k1-2345-fghi-456789012345"
}
```

**Client Action**: Show "Access denied" message or redirect to user dashboard.

---

## Migration Notes

### For Frontend Developers

1. **Immediate (backward compatible)**:
   - Start reading `response.data.code` to distinguish error types
   - Keep reading `response.data.message` (already works)
   - Keep reading `response.data.errors[].msg` (still present)

2. **Next Phase** (after backend migration complete):
   - Switch from `errors[].msg` to `errors[].message`
   - Use `code` for all error routing (refresh vs logout vs display)
   - Read `requestId` for error reporting

3. **Testing**:
   - All existing frontend error parsers (`apiError.ts`, `authError.ts`) still work
   - CSRF detection via `message.includes('csrf')` still works
   - 401 auto-refresh still works (now more precise with `AUTH_TOKEN_EXPIRED`)

### For Backend Developers

1. **Controller Migration** (mechanical):
   - Replace `res.status(XXX).json({ message: '...' })` 
   - With `next(AppError.xxx(code, message))`

2. **Validation Migration**:
   - Import `{ validate }` from `utils/validation.util.js`
   - Replace inline `validationResult` checks

3. **Try-Catch Pattern**:
   - Keep existing try-catch blocks
   - Replace inline error responses with `next(AppError.xxx(...))`
   - Let global handler normalize Prisma/JWT errors

---

## Request ID Usage

Include `requestId` in error reports or support tickets:

```
User reported: "Cannot upload file"
Request ID: f6g7h8i9-j0k1-2345-fghi-456789012345
```

Server logs will contain the same `requestId` for correlation.

---

## Production Safety

In production (`NODE_ENV=production`):
- Stack traces are **never** sent to clients
- Internal error messages are sanitized to generic messages
- Full error details are logged server-side with `requestId`
