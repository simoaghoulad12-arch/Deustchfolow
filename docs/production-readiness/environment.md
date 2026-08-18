# Environment Matrix

No secret values are documented here — only variable names, purpose, and
which environments need them. Real values live only in each environment's
own secret store, never in this repository (`.env.example` files ship
with empty placeholders, matching the existing `ANTHROPIC_API_KEY=""`
convention).

## LOCAL (developer machine)

| Variable | Required | Notes |
|---|---|---|
| `DATABASE_URL`, `DIRECT_DATABASE_URL` | Yes | Local Postgres. |
| `SERVICE_TOKEN_SECRET` | Yes | Shared HS256 secret between `apps/web` and `apps/api` for the internal service-token handshake. Any local dev value works; never share across environments. |
| `NODE_ENV` | Yes | `development`. |
| `PORT` | No | API port, defaults to 4000. |
| `APP_URL` | Yes | Used for Stripe Checkout success/cancel redirect URLs. |
| `ANTHROPIC_API_KEY` | Optional | Absent = AI features fail closed with a clean error, never a fabricated response (see `ai.md`). |
| `ANTHROPIC_MODEL`, `ANTHROPIC_TIMEOUT_MS`, `ANTHROPIC_MAX_RETRIES` | No | Override defaults; safe fallback on invalid/absent value. |
| `STRIPE_SECRET_KEY` | Optional | Absent = payment endpoints fail closed (see `payments.md`); if present, MUST be `sk_test_...` — `StripeService` explicitly refuses `sk_live_...` outright. |
| `STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_CONNECT_WEBHOOK_SECRET`, `STRIPE_PRICE_ID_PREMIUM`, `STRIPE_PRICE_ID_PRO` | Optional (with `STRIPE_SECRET_KEY`) | Test-mode only. |
| `NEXT_PUBLIC_API_URL`, `NEST_API_URL` | Yes (web) | Where `apps/web` reaches `apps/api`. |

## TEST (CI)

**Deliberately has none of the above except what's needed to boot the
app.** This codebase's e2e test suite is built around a documented
no-live-database, no-real-external-credentials strategy — every
`*-authorization.e2e-spec.ts` file sets its own dummy
`SERVICE_TOKEN_SECRET`/Stripe placeholder values in-process specifically
so signature/token verification can reach its rejection branch without a
real secret. CI should **not** be given real `ANTHROPIC_API_KEY` or
`STRIPE_SECRET_KEY` values — the whole test suite is designed to stay
green without them, and giving CI real credentials would be a scope
change to how this project verifies itself, not a requirement.

## STAGING

Same variable set as LOCAL, with:

- `NODE_ENV=production` (this flips `apps/web`'s email provider factory to
  fail closed instead of silently allowing the dev console provider — see
  the finding below).
- A dedicated Postgres instance, not shared with production.
- Stripe **test-mode** keys — staging should never touch live Stripe.
- A real `ANTHROPIC_API_KEY` if AI quality verification is being run here
  (see `AI_REAL_EVAL_RUNBOOK.md`).

## PRODUCTION

Same as STAGING, plus:

- Stripe **live-mode** keys — only after the explicit legal/tax review
  the original Phase 6 quality-gate report flagged as a prerequisite for
  live payments, and only after real Stripe test-mode verification has
  actually been run (`STRIPE_SANDBOX_RUNBOOK.md`).
- **A real transactional email provider is required and currently
  missing.** `apps/web/lib/email/email-service.ts`'s `resolveProvider()`
  only ever returns `ConsoleEmailProvider` (dev-mode, logs to console, no
  real delivery) — and explicitly **throws** if `NODE_ENV === 'production'`
  rather than silently running the dev provider in prod. This is a
  correct fail-closed design, but it means **registration and password
  reset are non-functional in any real production deployment today** — no
  Postmark/SES/Resend/etc. provider is wired up anywhere in this
  codebase. This is a launch blocker, not something to fix inside this
  quality gate (needs a vendor decision + real credentials).
- A durable, cross-instance rate limiter (Redis/Upstash) if the API ever
  runs as more than one instance — see `security.md`. Not installed in
  this pass, per the explicit "don't blindly add infrastructure that
  doesn't exist" instruction.
- Whatever replaces `LocalDocumentStorageProvider` (filesystem-based,
  dev-only) for tutor verification document storage — a real
  object-storage provider (S3, GCS, etc.), not decided in this codebase.

## Secrets hygiene

- No `.env` file with a real value has ever been committed — verified via
  `.gitignore` coverage and by inspecting `.env.example` files, which
  ship only empty-string placeholders.
- `SERVICE_TOKEN_SECRET` must differ between every environment and must
  never be logged (confirmed: no log statement in either app touches it).
