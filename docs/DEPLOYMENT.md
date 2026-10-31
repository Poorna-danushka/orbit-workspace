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

## Cross-site browser deployment checklist

When the UI and API are on different sites:

- Serve both origins over HTTPS.
- Set `COOKIE_SECURE=true` and `COOKIE_SAME_SITE=none`.
- Set `COOKIE_DOMAIN` only if a parent-domain cookie is needed across
  subdomains; leave it unset for host-only API cookies.
- Set `CORS_ORIGINS` to the exact frontend origin and `CLIENT_URL` to that same
  frontend origin.
- Set the client `NEXT_PUBLIC_SERVER_URL` to the API origin.
- Confirm preflight requests allow credentials and `X-CSRF-Token`.
- In a browser, verify login and reload, silent refresh after access expiry,
  recovery with the access cookie removed, a single login redirect after both
  auth cookies are removed, an unsafe CSRF-protected mutation, logout cookie
  clearing, and Socket.IO authentication/reconnection.

The local cross-site Playwright project uses
`http://localhost:3100` and `http://127.0.0.1:5101`. In the current Chromium
environment, the login response succeeds and includes auth `Set-Cookie`
headers, but the browser does not persist the Secure cookies over HTTP. The
local cross-site flow is therefore **UNVERIFIED**. Run the checklist against
an HTTPS staging deployment before release; do not remove `Secure` or weaken
`SameSite` to make the HTTP test pass.
