# =============================================================================
# Stage 1 — deps
#
# Install ALL dependencies (including devDependencies such as the prisma CLI)
# so that "postinstall" can run `prisma generate` and produce the Prisma Client
# binary for the target platform (linux/alpine, NOT Windows).
#
# We use node:22-alpine because:
#   - The strictest engine constraint in package-lock.json is "18 || 20 || >=22"
#   - Node 22 is the current LTS as of 2024-2025
#   - Alpine keeps the image small (~5 MB base vs ~900 MB full Debian)
#   - The host machine runs Node v24 locally, but Node 22 LTS is the correct
#     stable choice for a production Docker image
# =============================================================================
FROM node:22-alpine AS deps

WORKDIR /app

# Copy only the files needed to install dependencies.
# Copying package-lock.json ensures a fully reproducible install (npm ci).
COPY package.json package-lock.json ./

# Copy the Prisma schema so that `postinstall` (prisma generate) can run.
# Without the schema, prisma generate fails.
COPY prisma/schema.prisma ./prisma/schema.prisma

# Install all dependencies including devDependencies.
# `npm ci` uses package-lock.json exactly — no version drift.
# postinstall automatically runs `npx prisma generate`.
RUN npm ci


# =============================================================================
# Stage 2 — production image
#
# Copy only what is needed to run the server at runtime:
#   - node_modules (with generated Prisma Client from Stage 1)
# - prisma/ (MongoDB schema — Prisma Client uses this at runtime)
#   - src/       (application source)
#   - package.json (required by Node for the "main" field and module resolution)
#
# devDependencies (nodemon, prisma CLI) are NOT copied — they were only needed
# during the build stage to generate the Prisma Client.
# =============================================================================
FROM node:22-alpine AS runner

WORKDIR /app

# Set production environment.
# NODE_ENV=production tells Express to use production-optimised settings
# and disables development-only behaviours (e.g. detailed error stacks).
ENV NODE_ENV=production
ENV PORT=5000

# Install OpenSSL 3.x so the Prisma query engine binary can load libssl.so.3.
# The linux-musl-openssl-3.0.x binaryTarget (set in schema.prisma) requires
# OpenSSL 3.x to be present at runtime. Alpine ships with it, but we install
# it explicitly to make the dependency intentional and reproducible.
RUN apk add --no-cache openssl

# Copy dependencies (with Prisma Client generated for linux/alpine).
COPY --from=deps /app/node_modules ./node_modules

# Copy application source.
COPY src ./src

# Copy the schema only. The SQL migration in the repository is a legacy
# PostgreSQL artifact and is not part of the MongoDB runtime image.
COPY prisma/schema.prisma ./prisma/schema.prisma

# Copy package.json (Node module resolution uses the "main" field).
COPY package.json ./

# Expose the port Express listens on.
# This is documentation — the actual binding is controlled by -p at runtime.
EXPOSE 5000

# Pre-create the uploads directory and transfer ownership of the entire /app
# tree to the "node" user BEFORE switching to that user.
#
# Why this is necessary:
#   server/src/routes/user.routes.js calls fs.mkdirSync('/app/uploads') at
#   module-load time (before Express even starts). When the container runs as
#   the non-root "node" user, it cannot create directories inside /app because
#   /app is owned by root (created by WORKDIR). Pre-creating the directory here
#   — while still running as root — and then chown-ing the whole /app tree to
#   "node" gives the process the write access it needs without running as root.
#
# Note: uploads/ is only used by the local avatar multer fallback path.
# All actual file storage goes to Cloudinary via memory buffers, so no
# persistent volume is required. This directory just needs to be creatable.
RUN mkdir -p /app/uploads && chown -R node:node /app

# Switch to the non-root "node" user for the actual process.
USER node

# Start the application using the existing start script.
# Uses the JSON array (exec) form so signals (SIGTERM/SIGINT) are forwarded
# directly to the Node process and the server shuts down gracefully.
CMD ["node", "src/index.js"]
