# Security — Production Readiness

Status: **PASS WITH RISK**. Source: Phase 6.5 audit (six parallel, independent
research passes over Auth/Authorization/IDOR, AI, Payments/Booking,
Database/GDPR/Storage, Validation/RateLimit/Email/Errors/Observability,
Performance/FreeFirst/Accessibility), cross-checked and partly fixed in this
same phase. See [`PHASE-6.5-PRODUCTION-READINESS-REPORT.md`](../../PHASE-6.5-PRODUCTION-READINESS-REPORT.md)
for the full findings ledger and severity classification.

## Authentication

- Password hashing: bcrypt, cost 12 (OWASP-acceptable).
- Login timing-attack protection: a dummy-hash constant-time compare runs
  even when the email doesn't exist, so response timing doesn't leak
  account existence via the login endpoint.
- Session tokens: 32-byte random, sliding renewal; `destroyAllSessions` runs
  on both password reset and account deletion.
- Cookies: `httpOnly`, `secure` in production, `sameSite: lax`, explicit
  expiry.
- CSRF: no browser-facing `app/api` routes exist at all — every mutation is
  a Next.js Server Action, which carries built-in Origin-header
  verification.
- Session fixation: `createSession` always mints a fresh token on login,
  never reuses a pre-auth token.
- **Risk (LOW):** registration leaks account existence ("Für diese
  E-Mail-Adresse existiert bereits ein Konto.") — unlike the deliberately
  generic password-reset flow. Flagged as a product decision to confirm,
  not fixed unilaterally.
- **Risk (LOW):** no rate limiting on the token-*submission* endpoints
  (`resetPassword`, `verifyEmail`) — only on request generation. Practically
  unexploitable given 256-bit tokens, but no defense-in-depth if that ever
  changes.

## Authorization & IDOR

**Clean pass across all 26 API controllers reviewed.** `AuthGuard` and
`RolesGuard` are both global (`APP_GUARD`), secure-by-default (`@Public()`
opt-out used only by the health check and the two signature-verified
Stripe webhooks), and read exclusively from a server-verified service
token — never a client-supplied header. Every ownership-sensitive lookup
across bookings, reviews, booking-payments, tutor payouts/connect, tutor
verification documents (including the raw-bytes document-streaming
endpoint), tutor offerings/availability, AI tutor sessions, and AI exercise
grading uses a combined `(id, ownerId)` filter that 404s (never 403) on
mismatch — the codebase's own documented convention, applied with near-total
consistency. Cross-role checks (STUDENT↔STUDENT, STUDENT→TUTOR-only,
TUTOR↔TUTOR, SUPPORT's bounded authority, ADMIN-only routes) all hold.

No CRITICAL or HIGH authorization/IDOR defect was found.

## Payments / Money Integrity

See [`payments.md`](./payments.md) for the full picture. Highlights fixed
in this phase:

- **Refund double-spend race** (concurrent requests could jointly
  over-refund a payment) — closed with a SERIALIZABLE transaction around
  the balance check and refund creation.
- **SUPPORT's refund limit was per-request, not cumulative** — several
  refunds each individually under the limit could jointly drain a payment.
  Now checked cumulatively per payment.

Confirmed solid: webhook signature verification (real HMAC via the Stripe
SDK, fails closed), webhook idempotency (a genuine atomic DB-constraint
insert, not check-then-act), double-booking prevention (a real Postgres
`EXCLUDE USING gist` constraint), no client-settable payment status/amount
anywhere, no client-reachable payout-creation endpoint, integer-cents money
math throughout (zero float arithmetic on money found).

**Remaining risk (CRITICAL, documented not fixed):** cancelling a paid,
confirmed booking never triggers a refund — `Booking.status` flips to
`CANCELLED`, `Payment` is untouched, and nothing else reacts. This needs a
policy decision (which cancellations qualify, full vs. prorated, timing
cutoffs) consistent with the approved Phase 6 "no hardcoded refund business
rules" principle — not something to improvise inside a quality gate.

## AI Security

See [`ai.md`](./ai.md). No secret leakage, no context leakage, no
agentic/tool-execution injection surface, fail-closed schema validation at
every layer, no fabricated success on provider failure. One prompt-
injection surface (`learningGoal` free text landing in the system prompt
outside the originally-scoped safety instructions) was hardened this phase.
One known, already-documented trade-off (a TOCTOU window on the daily AI
usage cap, allowing a burst of concurrent requests to exceed the soft quota
by a small margin) remains — the team's own prior comment already accepts
this as a soft-cap, cost-only risk, not a hard security boundary.

## File Storage

- Private storage, UUID-generated storage keys (never derived from client
  input) — no path traversal surface.
- Every byte-serving read is authorization-checked (ownership or
  `@Roles(ADMIN)`), no static file serving, no guessable-URL bypass.
- File size enforced server-side independent of any client claim.
- **Fixed this phase:** MIME type was validated against a client-claimed
  string only, with no verification the bytes actually matched. Added
  real magic-byte signature verification before storage.
- **Risk (MEDIUM, not fixed):** no `X-Content-Type-Options: nosniff` was
  set — **fixed this phase** alongside the signature check, closing the
  MIME-sniffing angle on a still-mislabeled-but-signature-matching file.
- **Risk (not fixed):** no malware/antivirus scanning of uploaded
  documents. Out of scope for this quality gate — needs a vendor/service
  decision (e.g. ClamAV, a cloud scanning API), not something to improvise.

## Input Validation

- `ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })` is
  applied globally — confirmed the actual mass-assignment defense, not
  just documented as one.
- No raw SQL string-concatenation anywhere in application code (Prisma is
  parameterized by default; the only `$queryRawUnsafe`-style hits are
  inside the compiled Prisma client runtime, not app-reachable).
- No `dangerouslySetInnerHTML` anywhere in `apps/web` — no stored-XSS sink
  for tutor bios, review text, chat messages, or AI-generated content.
- Money fields are consistently `@IsInt` cents with `@Min`/`@Max`; enums
  consistently `@IsEnum`/`@IsIn`; free-text fields consistently
  `@MaxLength`-bounded.
- **Fixed this follow-up pass:** every controller id path param that maps
  to a real database UUID (`bookingId`, `paymentId`, `tutorId`, `userId`,
  `reviewId`, `sessionId`, `documentId`, `ruleId`, `exceptionId`,
  `offeringId`, `sourceId`, `requirementId`, `moduleId`, `simulationId`)
  now goes through `@Param(name, ParseUUIDPipe)`. A malformed id is now a
  clean 400 before any database call, not a generic 500. Slug-based params
  (`course`, `lesson`, `exercise`, `level`) and the entitlements `key`
  enum param were deliberately left as plain strings — they were never
  UUIDs. Regression-tested in `bookings-authorization.e2e-spec.ts` and
  `tutors-authorization.e2e-spec.ts`.

## Rate Limiting

- **Fixed this phase:** `bookings` and `reviews` had zero throttling.
  Added per-user-keyed throttler guards matching the existing AI/Payments
  pattern.
- **Risk (HIGH, documented not fixed):** every rate limiter in this
  codebase — the web app's own limiter and both Nest `ThrottlerModule`
  registrations — is in-memory, single-process, and resets on restart.
  None of it is effective once the API runs as more than one instance.
  Per the explicit instruction for this phase ("wenn Redis/Upstash noch
  fehlt: NICHT einfach blind integrieren"), this is documented as a
  production risk, not blindly wired up without a deliberate
  infrastructure decision.

## Error Handling

- No global exception filter exists. This currently works safely by
  construction (nearly every thrown error is already a proper
  `HttpException` subclass with a clean message; Nest's default filter
  never echoes internal details for the rest), but it's implicit, not
  designed — a genuine gap if a future contributor adds a
  raw-error-throwing code path.
- The IDOR 404-not-403 convention is consistently applied and matches the
  codebase's own documented rule.

## Observability

See [`monitoring.md`](./monitoring.md).
