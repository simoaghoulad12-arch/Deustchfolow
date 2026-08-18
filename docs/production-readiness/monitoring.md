# Observability — Production Readiness

Status: **PASS WITH RISK**.

## Fixed this phase

**Health check never verified database reachability, despite claiming it
would.** `HealthService` was a pure liveness stub with a stale comment
("DB check lands once the database module is wired in a later phase") —
`PrismaModule` had in fact already been wired into the app for many
phases; the check itself just never got built. Fixed: `GET /health` now
runs a real `SELECT 1` and reports it via a new `database: 'ok' | 'error'`
field. Deliberately does **not** change the top-level `status`/HTTP code
based on database reachability — `status` stays a pure liveness signal
("the process is alive, don't kill it"), which is the correct behavior
for a liveness probe (a transient DB blip shouldn't cause a needless
process restart) and also preserves this codebase's existing no-database-
in-CI e2e testing strategy without weakening it: the health endpoint now
*honestly* reports `database: 'error'` when there's no DB (verified
empirically against this actual sandbox, which has no live Postgres),
rather than silently not checking at all.

## Current state

- **Structured logging exists but is inconsistent.** Nest's `Logger` is
  used in the `ai` (5 files) and `payments` (8 files) modules only —
  `auth`, `bookings`, `career`, `entitlements`, `germany`, `learning`,
  `progress`, `reviews`, `simulations`, `tutors`, and `users` have zero
  `Logger` usage. This isn't "console.log soup" (no raw `console.*` calls
  found in `apps/api/src`) — it's simply silence: a failure in booking,
  review, tutor, or learning flows leaves no operational trail beyond
  Nest's own default request logging.
- **No request/correlation ID anywhere.** Confirmed by a repo-wide grep
  for `correlationId`/`x-request-id`/`requestId` — zero matches. There is
  currently no way to correlate a client-reported error with the
  corresponding server-side log lines across a request's lifecycle.
- **No error-tracking integration** (Sentry or equivalent) — confirmed
  absent, as expected at this stage.
- **`ai-observability.logger.ts`** is a good, isolated exception: a
  dedicated structured logger specifically for AI cost/usage observability
  (provider, model, latency, token counts — never prompt/response
  content).

## Recommended before real production launch (not built this phase —
genuine new infrastructure, out of scope for a fix-only quality gate)

1. **Request ID middleware.** A small addition (generate a UUID per
   request, attach as `X-Request-Id` on the response, thread it through
   `Logger` calls) — low effort, high value for support/debugging.
2. **Extend `Logger` usage to the currently-silent modules**, or decide
   deliberately that request-level Nest logging is sufficient for some of
   them.
3. **An error-tracking service** once there's real user traffic to
   monitor — not needed for this phase's scope, but worth planning before
   a real launch.
4. **Separate readiness vs. liveness health endpoints**, if this ever
   gets deployed behind an orchestrator (Kubernetes, ECS) that
   distinguishes the two — today's single `/health` with the `database`
   field is a reasonable middle ground for a simpler deployment target,
   but a K8s-style split is a legitimate future enhancement if the
   deployment target changes.
