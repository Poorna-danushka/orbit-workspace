# Orbit

Orbit is a project-management and team collaboration application. The client is
Next.js App Router with TypeScript; the API is Express with Prisma and MongoDB.
Features include projects, Kanban tasks, notifications, administration, file
attachments, email invitations, and Socket.IO chat.

## Prerequisites

- Node.js 22 or newer and npm.
- Docker Desktop with Docker Compose for the local MongoDB replica set.
- A modern browser for development and Playwright.
- Optional for corresponding features: Google OAuth, SMTP, and Cloudinary
  credentials.

## Quick start

1. Install dependencies from the repository root:

   ```powershell
   npm install
   npm install --prefix server
   npm install --prefix client
   ```

2. Create `server/.env` from `server/.env.example` if it does not already exist.
   Set distinct, randomly generated `JWT_SECRET` and `JWT_REFRESH_SECRET`
   values. Do not overwrite an existing local environment file.

3. Start MongoDB and apply the Prisma schema using the guarded local command:

   ```powershell
   docker compose up -d mongo
   npm run db:generate --prefix server
   npm run db:push:local --prefix server
   ```

   The guard targets local MongoDB only. Do not run raw `npx prisma db push`
   against `server/.env`; it can target a configured production database.

4. Start the API and client in separate terminals:

   ```powershell
   npm run dev --prefix server
   npm run dev --prefix client
   ```

   The API defaults to `http://localhost:5000` and the client to
   `http://localhost:3000`. In development, the client uses that API URL when
   `NEXT_PUBLIC_SERVER_URL` is omitted.

5. Open `http://localhost:3000`. Configure SMTP, Cloudinary, and Google OAuth
   before exercising those integrations.

## Configuration

Environment values below reflect `server/src/config/env.js`,
`server/.env.example`, and `client/src/lib/config.ts`. Secret values belong in
local environment files or a deployment secret manager; never commit them.

### Server (`server/.env`)

| Variable                      | Required                     | Default                                         | Secret                        | Purpose                                                                |
| ----------------------------- | ---------------------------- | ----------------------------------------------- | ----------------------------- | ---------------------------------------------------------------------- |
| `DATABASE_URL`                | Yes                          | None; example uses local `orbit`                | Yes for remote DB credentials | Prisma MongoDB connection                                              |
| `JWT_SECRET`                  | Yes                          | None                                            | Yes                           | Signs access tokens                                                    |
| `JWT_REFRESH_SECRET`          | Yes                          | None                                            | Yes                           | Signs refresh tokens; must differ from the access secret in production |
| `NODE_ENV`                    | Yes                          | None; example uses `development`                | No                            | Runtime mode                                                           |
| `CORS_ORIGINS`                | Yes                          | None; example lists local client origins        | No                            | Comma-separated exact browser origins                                  |
| `CLIENT_URL`                  | Yes                          | None; example uses `http://localhost:3000`      | No                            | Frontend origin used in email and OAuth flows                          |
| `PORT`                        | No                           | `5000`                                          | No                            | API listen port                                                        |
| `ACCESS_TOKEN_TTL`            | No                           | `15m`                                           | No                            | Access JWT lifetime                                                    |
| `REFRESH_TOKEN_TTL`           | No                           | `7d`                                            | No                            | Refresh JWT and auth-cookie lifetime                                   |
| `REFRESH_REUSE_GRACE_SECONDS` | No                           | `10`                                            | No                            | Concurrent refresh-token reuse grace period                            |
| `COOKIE_SECURE`               | No                           | Derived from production mode / HTTPS client URL | No                            | Enables the cookie `Secure` attribute                                  |
| `COOKIE_SAME_SITE`            | No                           | `none` when secure, otherwise `lax`             | No                            | Cookie SameSite policy                                                 |
| `COOKIE_DOMAIN`               | No                           | Unset (host-only cookies)                       | No                            | Optional shared cookie domain                                          |
| `JWT_ISSUER`                  | No                           | Unset                                           | No                            | Optional JWT issuer claim                                              |
| `JWT_AUDIENCE`                | No                           | Unset                                           | No                            | Optional JWT audience claim                                            |
| `SMTP_HOST`                   | Production                   | Unset                                           | No                            | SMTP server                                                            |
| `SMTP_PORT`                   | No                           | `587`                                           | No                            | SMTP port                                                              |
| `SMTP_SECURE`                 | No                           | `false`                                         | No                            | Whether SMTP uses implicit TLS                                         |
| `SMTP_USER`                   | Production                   | Unset                                           | Yes                           | SMTP account                                                           |
| `SMTP_PASS`                   | Production                   | Unset                                           | Yes                           | SMTP credential                                                        |
| `MAIL_FROM`                   | No                           | `SMTP_USER`                                     | No                            | Email sender address                                                   |
| `CLOUDINARY_CLOUD_NAME`       | Production                   | Unset                                           | No                            | Cloudinary account                                                     |
| `CLOUDINARY_API_KEY`          | Production                   | Unset                                           | Yes                           | Cloudinary API key                                                     |
| `CLOUDINARY_API_SECRET`       | Production                   | Unset                                           | Yes                           | Cloudinary API secret                                                  |
| `GOOGLE_CLIENT_ID`            | Optional, all three together | Unset                                           | No                            | Google OAuth client ID                                                 |
| `GOOGLE_CLIENT_SECRET`        | Optional, all three together | Unset                                           | Yes                           | Google OAuth client secret                                             |
| `GOOGLE_CALLBACK_URL`         | Optional, all three together | Unset                                           | No                            | Must end in `/api/auth/google/callback`                                |

Production requires SMTP and Cloudinary configuration. Google OAuth values are
optional, but if configured they must be supplied as a complete triplet.

### Client (`client/.env.local`)

| Variable                 | Required   | Default                                      | Secret | Purpose                                   |
| ------------------------ | ---------- | -------------------------------------------- | ------ | ----------------------------------------- |
| `NEXT_PUBLIC_SERVER_URL` | Production | Development fallback `http://localhost:5000` | No     | API origin; client appends `/api`         |
| `NEXT_DIST_DIR`          | No         | Next.js default                              | No     | Separate build directory used by e2e runs |

### Local database and test variables

| Variable             | Required                | Default                                                                     | Secret                               | Purpose                                                                              |
| -------------------- | ----------------------- | --------------------------------------------------------------------------- | ------------------------------------ | ------------------------------------------------------------------------------------ |
| `LOCAL_DATABASE_URL` | No                      | `mongodb://localhost:27017/orbit?replicaSet=rs0&directConnection=true`      | Yes only if credentials are embedded | Optional override for the guarded `db:push:local` command; remote hosts are rejected |
| `TEST_DATABASE_URL`  | For database/e2e tests  | `mongodb://127.0.0.1:27017/orbit_test?replicaSet=rs0&directConnection=true` | No for local MongoDB                 | Test-only database; must be local and end in `_test`                                 |
| `ADMIN_EMAIL`        | For `create-admin` only | Unset                                                                       | No                                   | Bootstrap administrator email                                                        |
| `ADMIN_PASSWORD`     | For `create-admin` only | Unset                                                                       | Yes                                  | Bootstrap administrator password                                                     |
| `ADMIN_USERNAME`     | No                      | `admin`                                                                     | No                                   | Bootstrap administrator display name                                                 |

Test setup does not load `server/.env` and rejects Atlas or any non-local test
database. The test database name must end in `_test`.

## Scripts and verification

| Location | Command                    | Purpose                                                                      |
| -------- | -------------------------- | ---------------------------------------------------------------------------- |
| Root     | `npm test`                 | Unit, integration, database, and e2e test suites                             |
| Root     | `npm run test:unit`        | Server and client unit tests                                                 |
| Root     | `npm run test:integration` | Server HTTP and Socket.IO integration tests                                  |
| Root     | `npm run test:database`    | Server database integration tests                                            |
| Root     | `npm run test:e2e`         | Client Playwright suite                                                      |
| Server   | `npm run verify`           | Structure check, Knip, unit and integration tests                            |
| Server   | `npm run db:generate`      | Generate Prisma client                                                       |
| Server   | `npm run db:push:local`    | Guarded local-only Prisma schema push                                        |
| Server   | `npm run create-admin`     | Create or promote a user using the admin variables above                     |
| Client   | `npm run verify`           | Typecheck, lint, structure, Knip, circular check, Jest, and production build |
| Client   | `npm run test:e2e`         | Playwright tests                                                             |

For authenticated browser tests, start Docker MongoDB and set
`TEST_DATABASE_URL` to the local `orbit_test` database before running
`npm test`. Playwright starts its own API and frontend processes. For the
cross-site project, run from `client` with
`$env:PLAYWRIGHT_CROSS_SITE='true'` and `TEST_DATABASE_URL` set, then run
`npx playwright test --project=cross-site`. See [Cross-site verification](#cross-site-verification)
below for the local HTTPS setup.

## Project structure

```text
client/
  e2e/                 Playwright browser tests
  scripts/             Frontend structure checks
  src/
    app/               URL routes and layouts
    components/        Shared UI and providers
    features/          Auth, projects, tasks, admin, shell, and other features
    lib/               API, auth, config, realtime, errors, utilities
    store/             Redux store and slices
    styles/            Global styles
    types/             Shared TypeScript types
server/
  prisma/              Prisma schema
  scripts/             Admin and safe database utilities
  src/
    config/            Environment and Prisma configuration
    controllers/        HTTP request and response handlers
    middlewares/        Auth, security, and request middleware
    routes/             Express route definitions
    services/           Domain services
    sockets/            Socket.IO lifecycle
    utils/              Shared server utilities
    validators/         Request validation rules
  tests/                Unit and integration tests
docs/
  DEPLOYMENT.md         MongoDB Atlas and release procedures
```

## Frontend URLs

| Route                                                                                                          | Access                  |
| -------------------------------------------------------------------------------------------------------------- | ----------------------- |
| `/`                                                                                                            | Public landing page     |
| `/login`, `/register`, `/forgot-password`, `/reset-password`                                                   | Authentication          |
| `/project-invitations/:token`                                                                                  | Invitation entry        |
| `/dashboard`, `/projects`, `/projects/:id`, `/tasks`, `/analytics`, `/notifications`, `/profile`               | Authenticated workspace |
| `/admin-dashboard`, `/admin-users`, `/admin-projects`, `/admin-activity`, `/admin-analytics`, `/admin-profile` | Administrator           |

## Authentication and browser security

- Access and refresh tokens are stored in `HttpOnly` cookies. The access
  cookie is retained for the refresh-token lifetime so expired access tokens
  are distinguishable from missing tokens. Both cookies are cleared using the
  same path, domain, Secure, and SameSite attributes used when setting them.
- Unsafe browser requests send `X-CSRF-Token`. The client fetches the token
  once and keeps it in memory; this supports cross-origin APIs where browser
  JavaScript cannot read the API host's CSRF cookie.
- Refresh rotates tokens. Reuse of a recently rotated token within
  `REFRESH_REUSE_GRACE_SECONDS` is tolerated for concurrent requests; reuse
  outside the grace window revokes the user's refresh sessions.
- The client coordinates same-origin tabs with `BroadcastChannel` and uses
  `navigator.locks` where supported to avoid simultaneous refresh requests.
  Session end is centralized: it clears local UI state and storage, broadcasts
  the event, and redirects once to `/login?next=...`.
- Socket.IO authenticates using the access cookie and checks the request
  origin against the configured allowlist.

## Cross-site verification

The dedicated `cross-site` Playwright project verifies Secure cookies using
local HTTPS proxies. From the repository root, generate a self-signed
certificate with `localhost` and `127.0.0.1` Subject Alternative Names:

```powershell
New-Item -ItemType Directory -Force -Path .\client\.certs | Out-Null
$certDir = (Resolve-Path .\client\.certs).Path
docker run --rm -v "${certDir}:/certs" alpine/openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout /certs/localhost-key.pem -out /certs/localhost-cert.pem -subj "/CN=localhost" -addext "subjectAltName=DNS:localhost,IP:127.0.0.1"
docker run --rm -v "${certDir}:/certs" alpine/openssl x509 -in /certs/localhost-cert.pem -noout -subject -ext subjectAltName
```

The `.certs/` directory is ignored and the private key must not be committed.
Start Docker MongoDB, then run the test from `client` in PowerShell:

```powershell
docker compose up -d mongo
$env:TEST_DATABASE_URL = 'mongodb://127.0.0.1:27017/orbit_test?replicaSet=rs0&directConnection=true'
$env:PLAYWRIGHT_CROSS_SITE = 'true'
npx playwright test --project=cross-site
```

Playwright starts Next.js on HTTP `127.0.0.1:3000` and the API on HTTP
`127.0.0.1:5100`. `local-ssl-proxy` forwards `https://localhost:3100` to the
client and `https://127.0.0.1:5101` to the API. The server process receives
`COOKIE_SECURE=true`, `COOKIE_SAME_SITE=none`, `CORS_ORIGINS=https://localhost:3100`,
`CLIENT_URL=https://localhost:3100`, and `ACCESS_TOKEN_TTL=10s`; the client is
built with `NEXT_PUBLIC_SERVER_URL=https://127.0.0.1:5101`. Playwright ignores
the local self-signed certificate only in this test configuration.

The suite reports separate results for login/reload, silent refresh after the
10-second access-token TTL, access-cookie deletion, both-cookie deletion and
single redirect, CSRF mutation while the API cookie is unreadable, logout
cookie clearing, and socket connection. CI does not run this project: it does
not set `PLAYWRIGHT_CROSS_SITE=true`, so the default Playwright project
explicitly excludes `cross-site.spec.ts`.

## Cross-site deployment checklist

For a frontend and API on different sites, serve both over HTTPS and configure:

1. `COOKIE_SECURE=true` and `COOKIE_SAME_SITE=none`.
2. `COOKIE_DOMAIN` only when the cookie must be shared across subdomains of the
   same parent domain. Keep it unset for a host-only API cookie otherwise.
3. `CORS_ORIGINS` as a comma-separated exact list containing the frontend
   origin; do not use `*`.
4. `CLIENT_URL` to the frontend origin, and `NEXT_PUBLIC_SERVER_URL` to the
   API origin.
5. Verify login, reload, silent refresh, CSRF mutation without JavaScript
   access to the API cookie, logout, and Socket.IO connection/reconnection in
   a real HTTPS browser environment.

The local HTTPS project uses a self-signed development certificate and is not
a substitute for production HTTPS staging verification.

## API compatibility notes

Existing API routes and response shapes remain unchanged. The following
documented endpoints are intentionally retained even though no current client
caller was found: `GET /api/tasks/my`, `GET /api/projects/:id/members`,
`GET /api/projects/:id/invitations`, `GET /api/uploads/project/:projectId`,
and `DELETE /api/uploads/:id`.

Attachment content routes are also retained. Server responses and chat history
can contain `/api/uploads/:id/content` URLs; the client converts those URLs to
the configured API origin and renders them as chat links or task attachment
links.

See [deployment procedures](./docs/DEPLOYMENT.md) before connecting to Atlas.
