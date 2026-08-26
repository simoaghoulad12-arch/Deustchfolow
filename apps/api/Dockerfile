# syntax=docker/dockerfile:1

# apps/api — staging/production image (Railway or Render).
#
# Build context MUST be the repository root, not apps/api, because this
# is a pnpm workspace: the image needs packages/database and
# packages/types alongside apps/api. On Railway, set the service's Root
# Directory to the repo root and point `dockerfilePath` at
# `apps/api/Dockerfile` (see /railway.json at the repo root). On Render,
# set the Dockerfile path to `apps/api/Dockerfile` with the build
# context at the repo root. Both are spelled out in DEPLOYMENT_STAGING.md.
#
# Multi-stage: one stage installs + builds the whole workspace, the
# runtime stage only adds the OS packages Prisma's query engine needs.
# `prisma generate` is NOT run on the host and copied in — it happens
# inside the `build` stage via packages/database's own `postinstall`
# hook during `pnpm install`, so the generated query engine binary
# always matches this image's own OS/architecture.

FROM node:20-bookworm-slim AS base
RUN corepack enable && corepack prepare pnpm@10.33.0 --activate
WORKDIR /repo

FROM base AS build
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @deutschflow/types build \
 && pnpm --filter @deutschflow/database build \
 && pnpm --filter @deutschflow/api build

FROM base AS runtime
ENV NODE_ENV=production

# Prisma's query engine needs libssl at runtime on Debian slim images.
RUN apt-get update \
 && apt-get install -y --no-install-recommends openssl \
 && rm -rf /var/lib/apt/lists/*

COPY --from=build /repo/package.json /repo/pnpm-workspace.yaml ./
COPY --from=build /repo/node_modules ./node_modules
COPY --from=build /repo/packages ./packages
COPY --from=build /repo/apps/api ./apps/api

EXPOSE 4000

# Plain-Docker fallback health check — hosts with their own health-check
# config (Railway's healthcheckPath in railway.json, Render's
# healthCheckPath) use the real HTTP endpoint directly; see
# apps/api/src/health/health.controller.ts (GET /api/v1/health, public).
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "require('http').get('http://127.0.0.1:'+(process.env.PORT||4000)+'/api/v1/health',r=>process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1))"

# `prisma migrate deploy` is idempotent — already-applied migrations are
# skipped, so running it on every container start is the standard,
# safe Prisma-on-Railway/Render pattern. It reuses the existing
# packages/database `migrate:deploy` script untouched. This deliberately
# NEVER runs `prisma db seed` — seeding stays a manual, local-machine
# step (see DEPLOYMENT_STAGING.md); the seed script also independently
# refuses to run under NODE_ENV=production on its own
# (packages/database/prisma/seed.ts).
CMD ["sh", "-c", "pnpm --filter @deutschflow/database run migrate:deploy && pnpm --filter @deutschflow/api run start:prod"]
