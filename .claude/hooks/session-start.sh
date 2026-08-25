#!/bin/bash
# SessionStart hook for Claude Code on the web.
#
# Makes the DeutschFlow monorepo immediately ready to work with: installs
# dependencies, builds the workspace packages apps/api and apps/web import
# at runtime (@deutschflow/database, @deutschflow/types), and brings up a
# local Postgres with the schema migrated and dev content seeded — the
# same manual steps a human would otherwise run before `pnpm dev`,
# `pnpm test`, or `pnpm lint` work.
#
# Only runs in Claude Code on the web (remote) sessions — a local
# developer's machine already has their own Postgres/env setup.
set -euo pipefail

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "$CLAUDE_PROJECT_DIR"

echo "[session-start] installing dependencies..."
pnpm install

echo "[session-start] generating Prisma client..."
pnpm --filter @deutschflow/database exec prisma generate

echo "[session-start] building workspace packages consumed by apps/api and apps/web..."
pnpm --filter @deutschflow/types build
pnpm --filter @deutschflow/database build

echo "[session-start] ensuring local Postgres is running..."
if command -v pg_lsclusters >/dev/null 2>&1 && ! pg_lsclusters 2>/dev/null | grep -q "5432 online"; then
  pg_ctlcluster 16 main start
fi

echo "[session-start] waiting for Postgres to accept connections..."
for _ in $(seq 1 30); do
  if PGPASSWORD=postgres psql -h localhost -U postgres -c "select 1" >/dev/null 2>&1; then
    break
  fi
  sleep 1
done

echo "[session-start] ensuring dev database role, database, and extension..."
sudo -u postgres psql -c "ALTER USER postgres WITH PASSWORD 'postgres';" >/dev/null
DB_EXISTS=$(sudo -u postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname = 'deutschflow'")
if [ "$DB_EXISTS" != "1" ]; then
  sudo -u postgres psql -c "CREATE DATABASE deutschflow OWNER postgres;" >/dev/null
fi
sudo -u postgres psql -d deutschflow -c "CREATE EXTENSION IF NOT EXISTS btree_gist;" >/dev/null

DEV_DB_URL="postgresql://postgres:postgres@localhost:5432/deutschflow?schema=public"
DEV_SERVICE_TOKEN_SECRET="local-dev-only-smoke-test-secret-do-not-use-in-prod"

echo "[session-start] ensuring local .env files exist (gitignored, dev-only values)..."
if [ ! -f packages/database/.env ]; then
  cat > packages/database/.env <<ENV
DATABASE_URL="${DEV_DB_URL}"
DIRECT_DATABASE_URL="${DEV_DB_URL}"
ENV
fi

if [ ! -f apps/api/.env ]; then
  cat > apps/api/.env <<ENV
NODE_ENV="development"
PORT=4000
APP_URL="http://localhost:3000"
DATABASE_URL="${DEV_DB_URL}"
DIRECT_DATABASE_URL="${DEV_DB_URL}"
SERVICE_TOKEN_SECRET="${DEV_SERVICE_TOKEN_SECRET}"
AI_PROVIDER="claude"
ENV
fi

if [ ! -f apps/web/.env.local ]; then
  cat > apps/web/.env.local <<ENV
NEXT_PUBLIC_API_URL="http://localhost:4000/api/v1"
DATABASE_URL="${DEV_DB_URL}"
DIRECT_DATABASE_URL="${DEV_DB_URL}"
APP_URL="http://localhost:3000"
NEST_API_URL="http://localhost:4000/api/v1"
SERVICE_TOKEN_SECRET="${DEV_SERVICE_TOKEN_SECRET}"
ENV
fi

echo "[session-start] applying migrations..."
pnpm --filter @deutschflow/database exec prisma migrate deploy

COURSE_COUNT=$(PGPASSWORD=postgres psql -h localhost -U postgres -d deutschflow -tAc "SELECT count(*) FROM courses" 2>/dev/null | tr -d '[:space:]' || echo 0)
if [ "${COURSE_COUNT:-0}" = "0" ]; then
  echo "[session-start] seeding dev/test content (A1 course, simulations, career modules)..."
  pnpm --filter @deutschflow/database seed
else
  echo "[session-start] dev content already seeded, skipping."
fi

echo "[session-start] ready. pnpm test / pnpm lint / pnpm typecheck / pnpm dev will all work now."
