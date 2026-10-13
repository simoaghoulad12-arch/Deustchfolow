#!/bin/sh
# Applies pending Prisma migrations during the Vercel build of the API.
# Hosted Postgres integrations expose the unpooled URL under different
# names, so DIRECT_DATABASE_URL falls back to them.
set -e
export DIRECT_DATABASE_URL="${DIRECT_DATABASE_URL:-${DATABASE_URL_UNPOOLED:-$DATABASE_URL}}"
if [ -z "$DATABASE_URL" ]; then
  echo "DATABASE_URL is not set; skipping migrations." >&2
  exit 0
fi
pnpm --filter @deutschflow/database migrate:deploy
pnpm --filter @deutschflow/database seed:content
