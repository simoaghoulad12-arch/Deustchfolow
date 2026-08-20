# Launch Checklist

Three severity bands, per the phase's own definition:
**CRITICAL** = no production launch until resolved. **HIGH** = should be
resolved before launch. **MEDIUM** = can be planned post-launch.

## CRITICAL — blocks launch

1. **No frontend checkout/subscription-upgrade UI exists.** The entire
   Phase 6 payments backend (checkout sessions, booking PaymentIntents,
   webhooks, refunds, payouts) is built and tested, but `apps/web` has no
   Stripe.js/Elements integration and no upgrade button anywhere —
   `settings/page.tsx` shows the current plan read-only. No user can
   currently pay for anything through the product. *(Found this phase,
   via repo scan — not previously flagged.)*
2. **Cancelling a paid booking never triggers a refund.**
   `BookingsService.cancel()` flips `Booking.status` to `CANCELLED` and
   never touches the `Payment` row; nothing else reacts. A fully-charged,
   cancelled booking silently stays charged until an admin notices. Needs
   a genuine policy decision (which cancellations qualify, full vs.
   prorated, timing cutoffs), not an improvised fix. See `payments.md`.
3. **No real transactional email provider is configured anywhere.**
   `ConsoleEmailProvider` is the only implementation; it correctly
   refuses to run in `NODE_ENV=production`, which means registration and
   password reset are non-functional in a real production deployment
   until a real provider (Postmark/SES/Resend/etc.) is chosen and wired
   up. See `environment.md`.
4. **Real Stripe test-mode verification has never been run.** No
   `STRIPE_SECRET_KEY` exists in this sandbox. The verification script
   (`payments:verify-sandbox`) is built, tested, and aborts cleanly — but
   the actual money flows have never been exercised against live Stripe
   test infrastructure. See `STRIPE_SANDBOX_RUNBOOK.md`.
5. **Real AI model-quality evaluation has never been run.** No
   `ANTHROPIC_API_KEY` exists in this sandbox. Same status as Phase 4.5 —
   see `AI_REAL_EVAL_RUNBOOK.md`.
6. **Account deletion doesn't anonymize personal data**, only cuts off
   access (soft-delete). A genuine GDPR "right to erasure" request cannot
   currently be honored beyond disabling login — email, password hash,
   and profile fields remain intact indefinitely. See `privacy.md`.
7. **Legal/tax review for live Stripe payments** — flagged as a
   prerequisite in the original Phase 6 quality-gate report and still
   outstanding; this phase only builds/verifies the technical shape.

## HIGH — should be resolved before launch

1. **Rate limiting is entirely in-memory, single-process.** Every
   throttler in this codebase (web app's own limiter, both Nest
   `ThrottlerModule` registrations) resets on restart and provides zero
   protection once the API runs as more than one instance. Needs a
   Redis/Upstash-backed store, deliberately not added in this pass
   per the "don't blindly add infrastructure" instruction.
2. **No consent architecture** (cookie banner, ToS-acceptance timestamp,
   marketing opt-in) exists anywhere. Needed before any public launch in
   a jurisdiction where it's legally required — a product/legal decision,
   not a code fix.
3. **No malware/antivirus scanning** on uploaded tutor verification
   documents beyond the magic-byte signature check added this phase.
   Needs a vendor/service decision (e.g. ClamAV, a cloud scanning API).
4. **No request/correlation ID** anywhere in the API — makes correlating
   a client-reported production incident with server logs currently
   impossible. See `monitoring.md`.
5. **No backup/PITR verified for the production database** — this repo
   states the requirement (`backups.md`) but cannot verify infrastructure
   that doesn't exist in this sandbox. Must be confirmed against whatever
   Postgres host is actually chosen for production.

## MEDIUM — can be planned post-launch

1. ~~No `ParseUUIDPipe` on id path params~~ — **fixed in this follow-up
   pass.** Every real UUID id param across all controllers now rejects a
   malformed id as a clean 400 before any database call. See
   `security.md`.
2. No global exception filter — currently safe by construction, but
   implicit rather than designed.
3. Several admin/list endpoints (payments, refunds, disputes, payouts,
   bookings, reviews, vocabulary) were capped at 200 rows this phase
   as a stopgap — real cursor-based pagination is still a future
   improvement once list sizes actually approach that ceiling.
4. Logger usage is inconsistent across modules — `ai`/`payments` have
   structured logging, most other modules have none.
5. Review authorship for a soft-deleted student still shows their old
   display name/avatar — a product decision (many platforms deliberately
   keep review attribution after account deletion), not a clear bug.
6. Registration leaks account existence via an explicit "email already
   registered" error — a product decision to confirm against the
   deliberately-generic password-reset flow's pattern.
7. Data-retention policy for AI conversation transcripts and writing
   submissions is undefined (currently indefinite retention, no cleanup
   job) — needs a product/legal decision on an actual retention period.

## What this phase explicitly did NOT do (by design)

- Did not add Redis/Upstash or any other new infrastructure dependency.
- Did not build the missing frontend checkout UI (a new feature, not a
  fix).
- Did not invent booking-cancellation refund business rules.
- Did not choose or wire up a real email provider.
- Did not fabricate AI evaluation results or Stripe sandbox test results.
- Did not weaken, skip, or delete any existing test to reach a green
  build.
