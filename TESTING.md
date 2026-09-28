# Testing Orbit

This document is written for an undergraduate software engineering student.
It explains what testing is, why Orbit has it, how each level works, and how to
run every test suite. It also includes the "What / Why / How / Protection"
breakdown that makes it easy to explain testing decisions in an internship
interview.

---

## Table of contents

1. [What is testing?](#1-what-is-testing)
2. [Why Orbit needs testing](#2-why-orbit-needs-testing)
3. [The testing pyramid](#3-the-testing-pyramid)
4. [What is a unit test?](#4-what-is-a-unit-test)
5. [What is an integration test?](#5-what-is-an-integration-test)
6. [What is a database integration test?](#6-what-is-a-database-integration-test)
7. [What is end-to-end testing?](#7-what-is-end-to-end-testing)
8. [What is mocking?](#8-what-is-mocking)
9. [How to run tests](#9-how-to-run-tests)
10. [How to run database tests](#10-how-to-run-database-tests)
11. [How to run Playwright](#11-how-to-run-playwright)
12. [How CI works](#12-how-ci-works)
13. [Test safety](#13-test-safety)
14. [Known limitations](#14-known-limitations)

---

## 1. What is testing?

A **test** is a piece of code that calls another piece of code and checks that
the result matches what was expected.

Simple example:

```js
// This is the function we want to test
function add(a, b) {
  return a + b;
}

// This is the test
test('adds two numbers correctly', () => {
  expect(add(2, 3)).toBe(5);
});
```

If someone later changes `add` and accidentally breaks it, the test fails
immediately. That is the entire point: tests catch mistakes before users do.

In a real application like Orbit, tests check things like:

- Does the login route reject invalid email addresses?
- Does the CSRF middleware block forged requests?
- Does a Redux action correctly update the authentication state?
- Does a non-member get a 403 when they try to access another user's project?

---

## 2. Why Orbit needs testing

Orbit is a multi-user application that handles:

- **Authentication** — a bug here could let someone log in as another user
- **Authorisation** — a bug here could let a user read or delete someone else's project
- **File uploads** — a bug here could expose private files to unauthorised users
- **CSRF protection** — without this, a malicious website could make requests on behalf of a logged-in user
- **Google OAuth** — a bug in the state/nonce check could allow an attacker to hijack an OAuth flow
- **Real-time chat** — a bug in the Socket.IO room guard could leak messages to the wrong users

Each of these areas has a real security or data-integrity consequence if it
breaks. Tests give early warning when a code change introduces a regression.

They also serve a second purpose in a student project: they demonstrate to
anyone reading the repository that you understand *why* the code works the
way it does — not just that it happened to work during manual testing.

---

## 3. The testing pyramid

The testing pyramid describes how to balance the three main types of tests:

```
        /\
       /  \   E2E tests
      /    \  (few — slow, browser-level)
     /------\
    /        \  Integration tests
   /          \  (moderate — real HTTP, real Express)
  /------------\
 /              \  Unit tests
/                \  (many — fast, isolated, no external services)
```

**More unit tests, fewer E2E tests.** Unit tests are fast and cheap; E2E tests
are slow and need a running browser and often a database. You write lots of
small unit tests and a small number of important E2E tests.

Orbit follows this pyramid:

| Level | Count | Speed |
|---|---|---|
| Unit (backend + frontend) | 45 tests | < 5 seconds |
| HTTP + Socket.IO integration | 6 tests | < 2 seconds |
| Database integration | 1 workflow | ~10 seconds (needs MongoDB) |
| E2E browser | 2 tests | ~10 seconds (one needs MongoDB) |

---

## 4. What is a unit test?

A unit test tests **one isolated piece of logic** without starting a server,
connecting to a database, or opening a browser.

The key word is *isolated*. The test controls everything: the inputs, any
dependencies, and the expected output. Nothing outside the test can interfere.

### Orbit example — file upload security

**What?**
Orbit lets users attach files to tasks. Before saving a file to Cloudinary, the
server checks that the file content actually matches the declared MIME type.
This prevents someone from uploading a malicious HTML file disguised as a PNG.

**Why?**
Without this check, an attacker could upload `malware.html` with
`Content-Type: image/png` and the server would store it without complaint.
Downstream systems that trust the MIME type could then serve it to other users.

**How?**
The unit test calls `isAllowedFileContent` directly with controlled buffers and
verifies the return value. No HTTP request, no database, no file system.

```js
// server/tests/unit/file-validation.test.js

test('rejects spoofed, binary-as-text, and empty file content', () => {
  // HTML disguised as a PNG — should be rejected
  expect(isAllowedFileContent('image/png', Buffer.from('<script>alert(1)</script>'))).toBe(false);
  // Binary bytes in a text file — should be rejected
  expect(isAllowedFileContent('text/plain', Buffer.from([0x00, 0xff]))).toBe(false);
  // Empty buffer — should always be rejected
  expect(isAllowedFileContent('application/pdf', Buffer.alloc(0))).toBe(false);
});
```

**What does it protect against?**
A future code change that accidentally loosens the MIME-type check, or a new
file type added to the allowlist without a corresponding content check.

---

### Orbit example — Redux authentication state

**What?**
Orbit's frontend stores whether the user is logged in using a Redux slice.
The `logout` action should clear the user object and set `isAuthenticated` to
false.

**Why?**
If `logout` accidentally left `isAuthenticated: true`, the frontend would
continue treating the user as logged in even after they signed out. They would
see their private workspace even though the session cookies are gone.

**How?**
The unit test calls the Redux reducer directly with the `logout` action and
checks the resulting state object. No React components, no API calls, no
browser.

```ts
// client/tests/store/auth-slice.test.ts

test('logout clears the user session', () => {
  // Start from an authenticated state
  const authenticated = reducer(initialState, setCredentials({ user }));

  // Dispatch logout and check the result
  expect(reducer(authenticated, logout())).toEqual({
    user: null,
    isAuthenticated: false,
    loading: false,
  });
});
```

**What does it protect against?**
A refactor of the auth slice that accidentally leaves stale user data after
logout, which would be a session management bug.

---

### All Orbit unit tests

**Backend** (`server/tests/unit/`):

| File | What it proves |
|---|---|
| `env.test.js` | Env validation rejects insecure / wrong-database config |
| `error-middleware.test.js` | CORS origin errors map to 403, not 500 |
| `file-validation.test.js` | MIME-type spoofing is detected and rejected |
| `fixed-window-limiter.test.js` | Rate-limit windows reset correctly per-key |
| `google-oauth-security.test.js` | Open-redirect and short-state attacks are blocked |
| `google-oauth.test.js` | PKCE + nonce + state are included in the Google auth URL |
| `google-account.test.js` | Existing accounts are linked; conflicts are rejected |
| `google-auth-controller.test.js` | HttpOnly PKCE cookies are set on OAuth initiation |
| `google-auth-success.test.js` | Verified OIDC token creates an Orbit session |
| `admin-middleware.test.js` | Invalid token → 401; database failure → 503 |
| `upload-controller.test.js` | Non-members are blocked before Cloudinary is contacted |
| `cloudinary-util.test.js` | Upload / download / delete use correct SDK parameters |
| `chat-controller.test.js` | Legacy Cloudinary URLs in messages are rewritten safely |
| `socket-origin.test.js` | Unapproved browser origins are rejected at the socket layer |

**Frontend** (`client/tests/`):

| File | What it proves |
|---|---|
| `components/login-page.test.tsx` | Login form renders; credentials submitted; errors displayed |
| `store/auth-slice.test.ts` | All Redux auth state transitions are correct |
| `lib/auth-error.test.ts` | Error messages are extracted correctly from Axios responses |
| `lib/auth-navigation.test.ts` | Post-login paths block open-redirect attacks |

---

## 5. What is an integration test?

An integration test checks that **multiple parts of the system work correctly
together**. In Orbit's backend, this means sending a real HTTP request to the
real Express application and checking the real HTTP response.

```
Test sends HTTP request (via Supertest)
              ↓
         Express router
              ↓
     CORS / CSRF middleware
              ↓
    express-validator (input validation)
              ↓
     Authentication middleware
              ↓
         Controller
              ↓
    HTTP response checked by test
```

This is different from a unit test because the test does not call the
controller directly. It goes through the entire middleware chain, exactly as a
real client would.

### Orbit example — login validation

**What?**
The login route must reject requests with an invalid email format or an empty
password before they ever reach the authentication logic.

**Why?**
Validation is a security and correctness boundary. If validation is bypassed,
invalid data reaches the password-checking code, which can cause unexpected
behaviour or expose error messages that reveal internal details.

**How?**
Supertest creates an in-process HTTP client and sends a POST to the real Express
app. No server needs to be started on a port. The test inspects the real response.

```js
// server/tests/integration/http-api.test.js

test('login validates credentials through the real Express route', async () => {
  const response = await request(app)
    .post('/api/auth/login')
    .send({ email: 'not-an-email', password: '' });

  expect(response.status).toBe(400);
  expect(response.body.errors).toEqual(expect.arrayContaining([
    expect.objectContaining({ path: 'email' }),
    expect.objectContaining({ path: 'password' }),
  ]));
});
```

**What does it protect against?**
A regression where a validator is accidentally removed or misconfigured, causing
invalid requests to reach the authentication logic.

---

### Orbit example — CSRF protection

**What?**
State-mutating requests (POST, PUT, DELETE) must include a valid CSRF token.
Without this check, a malicious third-party website could make forged requests
on behalf of a logged-in user.

**Why?**
CSRF (Cross-Site Request Forgery) is a real attack class. If the middleware is
accidentally removed or misconfigured, forged requests would succeed.

**How?**
The test sends a POST to `/api/projects` without a CSRF token and verifies that
the middleware rejects it before it reaches the controller.

```js
test('mutating project requests reject missing CSRF tokens', async () => {
  const response = await request(app)
    .post('/api/projects')
    .send({ title: 'A test project' });

  expect(response.status).toBe(403);
  expect(response.body.message).toMatch(/CSRF validation failed/);
});
```

**What does it protect against?**
A future refactor that accidentally reorders or removes the CSRF middleware.

---

### Orbit example — Socket.IO authorisation

**What?**
Socket.IO connections require a valid JWT in the cookie. Users should only be
able to join the project rooms they have access to.

**Why?**
If the Socket.IO authentication guard failed, any client could connect and
receive real-time messages from any project room.

**How?**
The test starts a real HTTP server with the Socket.IO instance attached, connects
a real Socket.IO client, and verifies that unauthenticated connections are
rejected and that authenticated users cannot join rooms they are not members of.

```js
// server/tests/integration/socket.test.js

test('rejects a connection without an authenticated session cookie', async () => {
  const client = connectClient(); // no token
  const [error] = await once(client, 'connect_error');
  expect(error.message).toBe('Authentication required');
});
```

**What does it protect against?**
A regression in the Socket.IO authentication middleware or project-room
access-control logic that would leak real-time data across project boundaries.

---

## 6. What is a database integration test?

A database integration test runs the full stack — HTTP request through Express,
through Prisma, to a real MongoDB database, and back — to prove that all those
layers work correctly together.

```
Test sends HTTP request
          ↓
     Express route
          ↓
    Controller / service
          ↓
       Prisma ORM
          ↓
       MongoDB
          ↓
    Response checked
```

### Why a separate test database?

Tests create, modify, and delete real records. If a test ran against your
development database it could delete data you care about. If it ran against
a production database it could corrupt real users' data.

Orbit solves this with two layers of protection:

1. **`TEST_DATABASE_URL` must be set explicitly** — tests never fall back to
   the development `.env` database.
2. **The database name must be exactly `orbit_test`** — the environment
   validator and the test itself both check this. Any other name causes an
   immediate error, not a silent failure.

### Orbit's database workflow

**What?**
A single end-to-end workflow that exercises the full data path: create users,
create a project, create a task, update it, verify authorisation, and clean up.

**Why?**
Unit tests and HTTP integration tests can pass even if Prisma is misconfigured
or the database schema is out of date. Only a test that actually connects to
MongoDB can prove the ORM layer works correctly in practice.

**How?**
The test uses `request.agent(app)` — which preserves cookies between requests —
to simulate two real authenticated users interacting with the application.

```js
// server/tests/integration/database-workflow.test.js

// Skipped automatically if TEST_DATABASE_URL is not set
const databaseTest = testDatabaseUrl ? test : test.skip;

databaseTest('registers and authenticates users, creates and updates a project
task, and enforces project access', async () => {
  // Register and log in two real users
  const owner = await createAuthenticatedUser('Orbit DB Owner', ownerEmail);
  const otherUser = await createAuthenticatedUser('Orbit DB Other', otherEmail);

  // Owner creates a project and task
  const project = await owner.agent.post('/api/projects').set(...).send(...);
  const task = await owner.agent.post('/api/tasks').set(...).send(...);

  // Other user is denied access
  const forbidden = await otherUser.agent.get(`/api/tasks/project/${projectId}`);
  expect(forbidden.status).toBe(403);
});
```

**What does it protect against?**
- A Prisma schema change that breaks an existing query
- A controller that returns 200 but does not actually write to the database
- An authorisation check that is present in the HTTP middleware but absent in
  the service layer

---

## 7. What is end-to-end testing?

An end-to-end (E2E) test controls a real web browser and interacts with the
application the same way a real user would — clicking buttons, filling forms,
and reading what appears on screen.

```
Playwright controls Chromium
          ↓
  Next.js frontend (port 3100)
          ↓
  Axios HTTP requests
          ↓
  Express backend (port 5100)
          ↓
  Prisma → MongoDB
```

### Orbit's E2E tests

**What?**
Two tests in `client/e2e/auth/public-login.spec.ts`:

1. **Public page test** (always runs): Verify the login page renders correctly
   in a real browser — the heading, email field, password field, and Google
   button are visible.

2. **Authenticated workflow** (skipped without MongoDB): Register → login →
   navigate to Projects → create a project → open it → create a task → click
   "Start Task" → verify the task moves to the "In Progress" Kanban column →
   clean up all test data.

**Why?**
Unit tests and integration tests can pass even if a React component is broken or
if the frontend and backend misunderstand each other's data format. Only an E2E
test running in a real browser can prove the complete user experience works.

**How?**
Playwright starts both servers automatically, then uses `page.goto`, `page.fill`,
`page.click`, and `expect` to drive and verify the browser. If a step fails,
Playwright saves a trace that can be replayed to see exactly what went wrong.

**What does it protect against?**
- A frontend change that breaks the login form
- A mismatch between what the API returns and what the UI expects
- A Kanban state-change that works in unit tests but breaks in the real browser

---

## 8. What is mocking?

**Mocking** means replacing a real dependency with a controlled substitute during
a test. The substitute returns predictable values so the test only checks the
code under test, not the external service.

### Why Orbit mocks certain things

**Google OAuth:**
Google's OAuth service is an external system. Calling it from a test would
require real Google credentials, depend on network availability, and potentially
create real OAuth sessions. Instead, Orbit's unit tests stub the
`OAuth2Client.prototype.getToken` and `verifyIdToken` methods to return
controlled fake tokens. This proves that Orbit's own code handles the OIDC
response correctly without ever contacting Google.

**Cloudinary:**
Uploading a file to Cloudinary from a test would be slow, cost money, and leave
test files in a real CDN. Instead, the upload controller tests stub
`cloudinary.uploader.upload_stream` to verify that the correct SDK parameters
are passed, and stub `cloudinary.utils.private_download_url` to verify that
download URLs use authenticated delivery.

**Email (nodemailer):**
Sending a real email from a test would require SMTP credentials and could
accidentally deliver emails to real addresses. Email delivery is not exercised
by any automated test. This is a documented known limitation (see
[section 14](#14-known-limitations)).

**Prisma in socket tests:**
The Socket.IO integration test mocks `prisma.user.findUnique` and
`prisma.project.findFirst` because it needs to test the socket event logic
without connecting to a real database. This makes the test fast and runnable
in any environment. The separate database workflow test uses real Prisma
against a real database for the use cases that require it.

### The rule of thumb

> Mock external services (Google, Cloudinary, SMTP) and infrastructure
> you do not own. Use real dependencies (Express, Prisma, MongoDB) when you
> need to prove the integration actually works.

---

## 9. How to run tests

Install both packages first — required for a fresh checkout:

```sh
npm ci --prefix server
npm ci --prefix client
```

### Run everything (from the repository root)

```sh
npm test
```

Runs in order: backend unit → HTTP + Socket.IO integration → database workflow
→ Playwright E2E.

### Run only unit tests (fast, no database or browser required)

```sh
# Both backend and frontend
npm run test:unit

# Backend only
cd server
npm run test:unit

# Frontend only
cd client
npm run test:unit
```

Expected output:

```
Test Suites: 14 passed, 14 total   (backend)
Tests:       28 passed, 28 total

Test Suites: 4 passed, 4 total     (frontend)
Tests:       17 passed, 17 total
```

### Run HTTP + Socket.IO integration tests

```sh
npm run test:integration
# or
cd server
npm run test:integration
```

Expected output:

```
Test Suites: 2 passed, 2 total
Tests:       6 passed, 6 total
```

### Run coverage reports

```sh
cd server && npm run test:coverage
cd client && npm run test:coverage
```

> **Important:** Coverage is reported only for the files listed in each
> `jest.config.js`. It does not represent the entire application. High coverage
> on these security-critical files is meaningful; claiming a percentage for the
> whole codebase without measuring it would be misleading.

### Frontend type checking and linting

```sh
cd client
npm run typecheck   # TypeScript — must produce no errors
npm run lint        # ESLint — must produce no warnings
```

---

## 10. How to run database tests

The database workflow test requires a running MongoDB instance and an explicit
environment variable. It will not run otherwise.

### Step 1 — start MongoDB

**Using Docker (recommended for a clean, isolated database):**

```sh
docker run -d -p 27017:27017 --name orbit-test-mongo mongo:7.0
```

**Or use an existing local MongoDB installation.**

### Step 2 — set `TEST_DATABASE_URL` and run

```powershell
# PowerShell (Windows)
$env:TEST_DATABASE_URL = 'mongodb://127.0.0.1:27017/orbit_test'
npm run test:database --prefix server
```

```bash
# Bash (macOS / Linux)
TEST_DATABASE_URL='mongodb://127.0.0.1:27017/orbit_test' \
  npm run test:database --prefix server
```

### What to expect

**If MongoDB is running and `TEST_DATABASE_URL` is set:**

```
Tests:  1 passed, 1 total
```

**If `TEST_DATABASE_URL` is not set:**

```
Tests:  1 skipped, 1 total
```

The test is **skipped** — not faked as a pass. The output clearly says `skipped`.

### Why the database name matters

The setup file and the test itself both check that `TEST_DATABASE_URL` targets a
database named `orbit_test`. If you accidentally point the variable at your
development database (e.g., `orbit`), the test fails with a clear error message
before connecting. This is intentional.

---

## 11. How to run Playwright

### Step 1 — install Chromium (once)

```sh
cd client
npx playwright install chromium
```

### Step 2 — run the tests

```sh
cd client
npm run test:e2e
```

The public login page test always runs. The authenticated workflow is
automatically skipped when `TEST_DATABASE_URL` is not set.

### Run the full authenticated E2E workflow

Start MongoDB first, then:

```powershell
# PowerShell (Windows)
$env:TEST_DATABASE_URL = 'mongodb://127.0.0.1:27017/orbit_test'
cd client
npm run test:e2e
```

Playwright will automatically:
1. Start the Next.js dev server on port 3100
2. Start the Express backend on port 5100 with test environment variables
3. Run the full browser workflow
4. Delete all test data after the test finishes

### View a trace on failure

```sh
npx playwright show-trace test-results/<test-name>/trace.zip
```

This opens a step-by-step replay of the browser interaction, showing exactly
where the test failed and what the page looked like.

---

## 12. How CI works

Orbit uses GitHub Actions (`.github/workflows/ci.yml`). The pipeline runs
automatically on every push to `main` and every pull request.

```
1.  Checkout the code
            ↓
2.  Set up Node.js 22
            ↓
3.  Install backend dependencies  (npm ci in server/)
    postinstall runs: npx prisma generate
            ↓
4.  Verify Prisma schema is valid
            ↓
5.  Run all backend tests
    ├── 14 unit test files (28 tests)
    ├── HTTP + Socket.IO integration (6 tests)
    └── Database workflow (1 test, against the CI MongoDB service below)
            ↓
6.  Install frontend dependencies  (npm ci in client/)
            ↓
7.  Frontend lint (ESLint)
            ↓
8.  Frontend type check (TypeScript)
            ↓
9.  Frontend unit and component tests (17 tests)
            ↓
10. Build Next.js for production
            ↓
11. Install Playwright Chromium
            ↓
12. Run Playwright E2E tests
            ↓
13. Build the Docker image for the backend
    └── On push to main: push to GitHub Container Registry
```

### The CI MongoDB service

The CI workflow declares a `services.mongodb` container that starts a real
MongoDB 7 instance on port 27017 before the tests run:

```yaml
services:
  mongodb:
    image: mongo:7.0
    ports:
      - 27017:27017
```

`TEST_DATABASE_URL` is set to `mongodb://127.0.0.1:27017/orbit_test` in the
CI environment. This means the database workflow and E2E authenticated tests
both run in CI, not just locally.

No production credentials are used. The MongoDB container is ephemeral — it
exists only for the duration of the CI job.

---

## 13. Test safety

This is one of the most important engineering decisions in Orbit's testing setup.

### The risk

Any test that writes to a database can delete real data if it runs against the
wrong database. This has happened in real teams where a developer ran tests
against a staging or production database by accident.

### How Orbit prevents this

**Layer 1 — environment variable guard:**

The test setup file (`server/tests/setup/test-env.js`) sets `NODE_ENV=test` and
sets `DATABASE_URL` to `TEST_DATABASE_URL`. This happens before any application
code loads.

**Layer 2 — environment validator:**

`server/src/config/env.js` runs at application startup. In `test` mode it
parses `DATABASE_URL` and checks that the database name is exactly `orbit_test`.
Any other name throws an error immediately:

```js
if (testDatabaseName !== 'orbit_test') {
  throw new Error('NODE_ENV=test requires DATABASE_URL to target the orbit_test database');
}
```

**Layer 3 — test-level guard:**

The database workflow test checks `TEST_DATABASE_URL` a second time before
connecting to Prisma. If it is not set, the test is marked as skipped — not
silently passed.

**Layer 4 — unique test data:**

Every database test creates records with unique IDs derived from timestamps and
random strings, for example:

```
orbit-db-owner-1720000000-abc123@example.test
```

Two concurrent test runs cannot collide.

**Layer 5 — cleanup in `finally`:**

Cleanup runs in a `finally` block, so even if an assertion fails mid-test, the
test records are deleted before the test suite exits.

### Summary

| Scenario | What happens |
|---|---|
| `TEST_DATABASE_URL` not set | Database test is skipped with a clear message |
| `TEST_DATABASE_URL` targets wrong DB name | Immediate error, test does not run |
| `TEST_DATABASE_URL` targets `orbit_test` | Test runs and cleans up after itself |
| Development `.env` database | Never used — setup overrides it before any code loads |

---

## 14. Known limitations

This is an honest account of what is not tested.

**Email delivery (nodemailer)**
Email sending is not tested in any automated test. Testing it properly would
require either a real SMTP service (which costs money and has external
dependencies) or a mail-catching server like Mailhog. For a student project
this is an acceptable gap; the priority was testing authentication and
authorisation, which are security-critical.

**Admin routes — full HTTP coverage**
The admin middleware is unit-tested (token validation, database failure
handling), but the full admin route suite (user management, project moderation)
is not covered by HTTP integration tests. The database workflow covers
authorisation at the task/project level but does not exercise admin-only
endpoints.

**Kanban drag-and-drop**
The drag-and-drop reordering of Kanban cards (powered by `@dnd-kit`) is not
unit or component tested. It is exercised by the E2E test (task state change
through button click), but the drag interaction itself is not automated.

**Coverage scope**
Coverage is measured only for the files listed in `jest.config.js` — the
security-critical middleware and authentication utilities. No
whole-application coverage percentage is claimed, because measuring it would
include files with zero test coverage and produce a misleading number.

**Google OAuth in a real browser**
The E2E test uses local email/password registration instead of clicking
"Continue with Google". Testing the real Google OAuth flow from Playwright
would require a real Google account, which cannot be safely automated or stored
in CI. The OAuth logic is instead covered by the unit tests that stub the
Google SDK.

---

## Appendix — Interview explanation

Here is a short explanation you can give in an internship interview when asked
"how does testing work in your project?":

> Orbit has four levels of testing.
>
> At the unit level, I test individual pieces of logic in isolation — things
> like file-type validation, rate limiting, Redux state transitions, and
> security utilities like the Google OAuth state check. These tests run in
> milliseconds and don't need a database or a browser.
>
> At the integration level, I use Supertest to send real HTTP requests to the
> actual Express application. This proves that the middleware chain works —
> things like CSRF protection rejecting a forged request, or the login validator
> returning the correct error fields. I also have Socket.IO integration tests
> that prove unauthenticated connections are rejected and that project-room
> access is enforced.
>
> For database integration, I have one end-to-end workflow that registers two
> real users through the API, creates a project and task, verifies that one
> user cannot access the other's data, and cleans up after itself. This only
> runs against a database called `orbit_test` — it refuses to connect to the
> development database by design.
>
> And at the E2E level, I use Playwright to control a real Chromium browser.
> The test registers a user, logs in through the UI, creates a project and task,
> clicks to advance the task status, and verifies it appears in the correct
> Kanban column.
>
> For external services like Google OAuth, Cloudinary, and email, I stub the
> SDK methods in tests so we never contact real external systems. The CI
> pipeline runs all of this automatically on every pull request using GitHub
> Actions, with an ephemeral MongoDB container for the database tests.
