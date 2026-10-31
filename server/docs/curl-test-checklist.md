# Backend Error Contract — Curl Test Checklist

Before deploying, verify the error contract with these curl commands.

## Prerequisites

```bash
export API_URL="http://localhost:5000/api"
export CSRF_TOKEN=$(curl -s "$API_URL/csrf-token" -c cookies.txt | jq -r '.csrfToken')
```

---

## 1. Wrong Password (AUTH_INVALID_CREDENTIALS)

**Request:**
```bash
curl -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"wrongpassword"}'
```

**Expected Response:**
```json
{
  "status": 400,
  "code": "AUTH_INVALID_CREDENTIALS",
  "message": "Invalid credentials",
  "requestId": "..."
}
```

---

## 2. Validation Failure (VALIDATION_ERROR)

**Request:**
```bash
curl -X POST "$API_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"username":"ab","email":"not-email","password":"short"}'
```

**Expected Response:**
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
  "requestId": "..."
}
```

---

## 3. No Cookie (AUTH_TOKEN_MISSING)

**Request:**
```bash
curl -X GET "$API_URL/user/me"
```

**Expected Response:**
```json
{
  "status": 401,
  "code": "AUTH_TOKEN_MISSING",
  "message": "No authorization token provided",
  "requestId": "..."
}
```

---

## 4. Expired Access Token (AUTH_TOKEN_EXPIRED)

**Simulating expired token:**

Create a short-lived token in a test script or temporarily modify `generateAccessToken` to use `expiresIn: '1s'`, wait 2 seconds, then:

```bash
# Login first to get cookies
curl -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}' \
  -c cookies.txt

# Wait for token to expire (if modified to 1s), then:
curl -X GET "$API_URL/user/me" -b cookies.txt
```

**Expected Response:**
```json
{
  "status": 401,
  "code": "AUTH_TOKEN_EXPIRED",
  "message": "Your session has expired. Please sign in again.",
  "requestId": "..."
}
```

**Frontend Action**: This is the **ONLY** code that should trigger silent refresh.

---

## 5. Invalid/Malformed Token (AUTH_TOKEN_INVALID)

**Request:**
```bash
curl -X GET "$API_URL/user/me" \
  -b "accessToken=invalid.jwt.token"
```

**Expected Response:**
```json
{
  "status": 401,
  "code": "AUTH_TOKEN_INVALID",
  "message": "Invalid authentication token",
  "requestId": "..."
}
```

**Frontend Action**: Redirect to login (do NOT refresh).

---

## 6. Expired/Invalid Refresh Token (AUTH_REFRESH_INVALID)

**Request:**
```bash
curl -X POST "$API_URL/auth/refresh" \
  -b "refreshToken=invalid.or.revoked.jwt"
```

**Expected Response:**
```json
{
  "status": 401,
  "code": "AUTH_REFRESH_INVALID",
  "message": "Invalid or expired refresh token",
  "requestId": "..."
}
```

**Frontend Action**: Logout + redirect to login.

---

## 7. Missing CSRF Token (CSRF_INVALID)

**Request:**
```bash
# First login to get accessToken
curl -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}' \
  -c cookies.txt

# Then try mutating without CSRF header
curl -X POST "$API_URL/projects" \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"title":"Test Project"}'
```

**Expected Response:**
```json
{
  "status": 403,
  "code": "CSRF_INVALID",
  "message": "CSRF validation failed: Invalid or missing token",
  "requestId": "..."
}
```

**Frontend Action**: Fetch new CSRF token, retry once.

**Legacy Detection** (still works):
```javascript
if (status === 403 && message.toLowerCase().includes('csrf')) {
  // retry
}
```

---

## 8. Unknown Route (NOT_FOUND)

**Request:**
```bash
curl -X GET "$API_URL/does-not-exist"
```

**Expected Response:**
```json
{
  "status": 404,
  "code": "NOT_FOUND",
  "message": "Route not found",
  "requestId": "..."
}
```

---

## 9. Malformed JSON (BAD_REQUEST)

**Request:**
```bash
curl -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{invalid json'
```

**Expected Response:**
```json
{
  "status": 400,
  "code": "BAD_REQUEST",
  "message": "Invalid JSON in request body",
  "requestId": "..."
}
```

---

## 10. Bad File Upload (UPLOAD_INVALID_FILE_TYPE)

**Request:**
```bash
# Login first
curl -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}' \
  -c cookies.txt

# Get CSRF
CSRF=$(curl -s "$API_URL/csrf-token" -b cookies.txt | jq -r '.csrfToken')

# Try uploading a .exe file (not allowed)
echo "fake exe" > test.exe
curl -X POST "$API_URL/uploads/task/60c72b2f4f1a2c001f8e4c3f" \
  -H "X-CSRF-Token: $CSRF" \
  -b cookies.txt \
  -F "file=@test.exe"
```

**Expected Response:**
```json
{
  "status": 400,
  "code": "UPLOAD_INVALID_FILE_TYPE",
  "message": "Invalid file type. Allowed: images, PDF, Word, Excel, TXT.",
  "requestId": "..."
}
```

---

## 11. Forced 500 (INTERNAL_ERROR)

**Simulate by:**
- Temporarily stopping MongoDB/database
- OR trigger a controller that throws an unhandled exception

**Expected Response:**
```json
{
  "status": 500,
  "code": "INTERNAL_ERROR",
  "message": "An unexpected error occurred",
  "requestId": "..."
}
```

**Production Behavior**:
- Generic message (no stack trace)
- Full error logged server-side with requestId

---

## 12. Admin Access Required (FORBIDDEN)

**Request:**
```bash
# Login as regular user
curl -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}' \
  -c cookies.txt

# Try accessing admin endpoint
curl -X GET "$API_URL/admin/stats" -b cookies.txt
```

**Expected Response:**
```json
{
  "status": 403,
  "code": "FORBIDDEN",
  "message": "Admin access required",
  "requestId": "..."
}
```

---

## Verification Checklist

- [ ] All responses include `status`, `code`, `message`, `requestId`
- [ ] Validation errors (422) include `errors[]` array
- [ ] Each validation error has `field`, `message`, and `msg` (temporary)
- [ ] `AUTH_TOKEN_EXPIRED` is distinct from `AUTH_TOKEN_INVALID`
- [ ] CSRF errors have code `CSRF_INVALID` AND message contains "csrf" (backward compat)
- [ ] Frontend can still parse `response.data.message` (unchanged)
- [ ] Frontend can still parse `response.data.errors[].msg` (unchanged)
- [ ] X-Request-Id header is present in all responses
- [ ] Production mode never leaks stack traces

---

## Notes

- Replace `user@example.com` / `password` with actual test credentials
- Replace `60c72b2f4f1a2c001f8e4c3f` with actual MongoDB ObjectId
- In development, CSRF cookie is `sameSite: 'lax'`; in production it's `sameSite: 'none'`
- All endpoints maintain backward compatibility with existing frontend
