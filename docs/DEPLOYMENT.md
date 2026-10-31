# Deployment and database operations

## MongoDB Atlas release procedure

Use this sequence for a production rollout. Never run schema changes against an
Atlas URI without confirming the target project and database.

1. **Take a restorable snapshot.** Create an Atlas snapshot or an equivalent
   verified backup. Record the snapshot identifier and confirm the restore
   procedure before proceeding.
2. **Inspect the `User` indexes.** In Atlas Data Explorer or `mongosh`, inspect
   `db.User.getIndexes()`. Confirm the unique `User_googleId_key` index is
   partial and only indexes non-empty `googleId` values:

   ```javascript
   db.User.getIndexes().filter((index) => index.name === 'User_googleId_key');
   ```

   Expected index properties:

   ```javascript
   {
     key: { googleId: 1 },
     unique: true,
     partialFilterExpression: { googleId: { $gt: '' } }
   }
   ```

   Check for duplicate non-empty Google IDs before creating or replacing this
   index. If duplicates exist, resolve them through the account migration
   process; do not make the index non-unique to bypass the conflict.

3. **Deploy the server release.** The server startup index check creates or
   repairs the partial index. If duplicate-key creation fails, it logs the
   failure without logging credentials or user tokens and continues serving.
   Startup treats an already-correct index as a no-op. MongoDB serializes the
   concurrent index creation attempt; simultaneous instances accept the
   existing-index result.
4. **Verify after deployment.** Inspect the `User` indexes again and confirm
   the `User_googleId_key` name, unique constraint, and partial filter. Check
   server health and authentication for password and Google users. Confirm
   that users without Google IDs remain valid.
5. **Rollback if needed.** Roll back the server image/release to the previous
   version and verify health. Keep the compatible partial index in place unless
   a database owner has confirmed that the prior release cannot operate with
   it. Restore the snapshot only for data corruption or a failed migration;
   restoration replaces post-snapshot writes and must be approved and planned.
   Do not drop the index as an automatic rollback step.

Do not use `npx prisma db push` against `server/.env`. For local development,
use `npm run db:push:local --prefix server`; that script supplies its own
local database URL and rejects non-local targets.

## Authentication token lifetime settings

These server variables are validated by `server/src/config/env.js`:

| Variable                      | Default | Operational effect                                            |
| ----------------------------- | ------- | ------------------------------------------------------------- |
| `ACCESS_TOKEN_TTL`            | `15m`   | Access JWT lifetime                                           |
| `REFRESH_TOKEN_TTL`           | `7d`    | Refresh JWT, refresh cookie, and access-cookie maximum age    |
| `REFRESH_REUSE_GRACE_SECONDS` | `10`    | Permitted concurrent reuse window for a rotated refresh token |

Use the same production values across all server instances. A short access TTL
in a staging environment is useful for verification; it is not recommended as
a substitute for exercising real expiration and refresh behavior.

Refresh tokens rotate on refresh. Reuse within the grace window supports
concurrent requests; reuse outside the window revokes all refresh tokens for
that user. The browser client shares refresh work across tabs where supported
and broadcasts session-end events.

## Recommended production topology: same-site subdomains

Use custom frontend and API domains under the same registrable domain:
`app.yourdomain.com` on Vercel and `api.yourdomain.com` on Render.

Configure the server on Render:

```dotenv
COOKIE_SECURE=true
COOKIE_SAME_SITE=lax
COOKIE_DOMAIN=.yourdomain.com
CORS_ORIGINS=https://app.yourdomain.com
CLIENT_URL=https://app.yourdomain.com
```

Configure the client on Vercel:

```dotenv
NEXT_PUBLIC_SERVER_URL=https://api.yourdomain.com
```

1. Add `app.yourdomain.com` under the Vercel project's Domains; configure its
   requested DNS record and wait for TLS provisioning.
2. Add `api.yourdomain.com` under the Render web service's Custom Domains;
   configure its requested DNS record and wait for TLS provisioning.
3. Add the environment values above to the respective Vercel and Render
   environments and redeploy both services.
4. Confirm the browser receives cookies with Domain `.yourdomain.com`,
   `Secure`, `HttpOnly`, and SameSite `Lax`. Test login/reload, refresh,
   cookie recovery, CSRF mutation, logout clearing on both subdomains, and
   Socket.IO authentication.

The hosting providers' default `*.vercel.app` and `*.onrender.com` domains are
public-suffix domains. A cookie cannot be shared across them; default hosted
URLs therefore always form a cross-site frontend/API deployment.

## Cross-site fallback and browser limitations

When custom same-site domains are unavailable, cross-site cookies require
HTTPS with `COOKIE_SECURE=true`, `COOKIE_SAME_SITE=none`, an exact
`CORS_ORIGINS` allowlist, and `CLIENT_URL` set to the frontend origin. Set
client `NEXT_PUBLIC_SERVER_URL` to the API origin. Leave `COOKIE_DOMAIN`
unset unless both origins share a registrable parent domain.

Third-party-cookie restrictions mean cross-site authentication is not
guaranteed in Safari/iOS, Firefox Enhanced Tracking Protection, or Chrome
Incognito. The server emits a startup warning when configured with
`COOKIE_SAME_SITE=none`; use same-site custom subdomains in production.

| Mode                               | Environment values                                                                                                            | Chromium                                    | Safari         | Firefox        | Incognito      |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- | -------------- | -------------- | -------------- |
| Same-site subdomains (recommended) | Secure=true, SameSite=lax, Domain=.yourdomain.com; CORS_ORIGINS and CLIENT_URL use app origin; client API URL uses API origin | Works                                       | Works          | Works          | Works          |
| Cross-site fallback                | Secure=true, SameSite=none; exact CORS_ORIGINS and CLIENT_URL; client API URL uses API origin                                 | Works where third-party cookies are allowed | NOT guaranteed | NOT guaranteed | NOT guaranteed |

## Local HTTPS cookie verification

Generate a self-signed certificate from the repository root. The generated
certificate has SAN entries for `localhost`, `127.0.0.1`, `app.localtest.me`,
and `api.localtest.me`, and remains under the ignored `client/.certs/` path:

```powershell
New-Item -ItemType Directory -Force -Path .\client\.certs | Out-Null
$certDir = (Resolve-Path .\client\.certs).Path
docker run --rm -v "${certDir}:/certs" alpine/openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout /certs/localhost-key.pem -out /certs/localhost-cert.pem -subj "/CN=localhost" -addext "subjectAltName=DNS:localhost,IP:127.0.0.1,DNS:app.localtest.me,DNS:api.localtest.me"
docker run --rm -v "${certDir}:/certs" alpine/openssl x509 -in /certs/localhost-cert.pem -noout -subject -ext subjectAltName
```

Ensure `app.localtest.me` and `api.localtest.me` resolve to loopback. If they do
not, add `127.0.0.1 app.localtest.me api.localtest.me` to the system hosts
file (Windows: `C:\Windows\System32\drivers\etc\hosts`, edited as
Administrator; macOS/Linux: `/etc/hosts`, edited with administrator
privileges). Do not overwrite existing lines. No hosts-file change is needed
when public DNS already resolves them to loopback.

From `client`, start the local MongoDB test database and run:

```powershell
docker compose up -d mongo
$env:TEST_DATABASE_URL = 'mongodb://127.0.0.1:27017/orbit_test?replicaSet=rs0&directConnection=true'
$env:PLAYWRIGHT_SAME_SITE = 'true'
npx playwright test --project=same-site
```

The `same-site` project serves the client at `https://app.localtest.me:3100`
and API at `https://api.localtest.me:5101`, with `COOKIE_DOMAIN=.localtest.me`,
Secure cookies, and SameSite=Lax. It verifies all seven cookie/auth/socket
scenarios and checks that logout clears both auth cookies for both hosts.
Playwright ignores the self-signed certificate only in this local test mode.
