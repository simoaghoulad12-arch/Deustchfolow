# Payments — Production Readiness

Status: **PASS WITH RISK** (technical architecture) / **BLOCKED** (real
Stripe test-mode verification — see [`environment.md`](./environment.md)).

## What's verified

- **Webhook security:** signature verification uses the real Stripe SDK
  `constructEvent` (HMAC-SHA256 over raw request bytes, via `rawBody: true`
  wired correctly in `main.ts`), fails closed on any missing/forged
  signature, no detail leak on failure.
- **Webhook idempotency:** a genuine atomic DB `INSERT` racing a
  `@unique` constraint on `stripe_event_id` — not a check-then-act read
  followed by a write. Confirmed by direct code read, not just documented
  intent.
- **Duplicate payment/payout prevention:** real DB unique constraints
  confirmed directly in `schema.prisma` — `payments.bookingId`,
  `payments.stripe_payment_intent_id`, `tutor_payouts.stripe_transfer_id`
  / `stripe_payout_id`, `stripe_webhook_events.stripe_event_id`. Stripe
  idempotency keys sent on every outbound write are derived from stable
  internal ids, never client-suppliable or omittable.
- **No client-settable payment status/amount/plan:** every DTO in
  `payments/`/`bookings/` was checked; `forbidNonWhitelisted` rejects any
  extra field outright. `Payment.status` and `Subscription.status` are
  only ever written from webhook-driven code paths (grepped every writer).
- **No client-callable payout endpoint:** `TutorPayoutService` has exactly
  two public write methods, both only reachable from the signature-verified
  webhook dispatcher.
- **Connect account security:** account rows are keyed by the
  Stripe-assigned `stripeAccountId`; no cross-tutor hijack path exists.
- **Money math:** integer cents/basis-points throughout; the entire
  `payments/` tree was grepped for `parseFloat`/`Number()`/float
  arithmetic on money fields — none found outside test fixtures.
- **Double-booking prevention:** a real Postgres `EXCLUDE USING gist`
  constraint (`btree_gist`), not just an application-level check — the
  race case is caught and mapped to a 409.

## Fixed this phase

- **Refund double-spend race (HIGH).** `RefundService.initiateRefund`
  computed "remaining refundable balance" from only `SUCCEEDED` refunds,
  excluding a concurrently in-flight `PENDING` one — two simultaneous
  refund requests could each pass the balance check and jointly
  over-refund a payment. Fixed by running the balance check, the
  cumulative-SUPPORT-limit check, and the local `Refund` row creation
  inside one `SERIALIZABLE` transaction; a genuine Postgres serialization
  conflict (Prisma error `P2034`) now maps to a clean `409 Conflict`
  instead of allowing both requests through.
- **SUPPORT's refund authority was per-request, not cumulative (MEDIUM).**
  A SUPPORT user could issue N refunds, each individually under
  `PaymentPolicy.supportRefundLimitCents`, that together exceeded it —
  fully draining a payment SUPPORT was never meant to have unilateral
  authority over. Fixed: the cumulative total of SUPPORT-initiated
  committed refunds for a payment is now checked against the limit, not
  just the current request.
- **Missing index on `payments.stripe_charge_id` (MEDIUM)** — queried on
  every `transfer.created` webhook (payout reconciliation), previously a
  full table scan at scale. Added via migration
  `20260818110000_payment_stripe_charge_id_index`.
- **Offerings could be priced at 0 cents (MEDIUM)** — Stripe's documented
  EUR minimum charge is 50 cents; a lower value now fails at offering
  creation instead of confusingly at checkout time.

## Known, documented limitation — not fixed this phase

**CRITICAL: cancelling a paid, confirmed booking never triggers a
refund.** `BookingsService.cancel()` only checks `ACTIVE_STATUSES` and
flips `Booking.status` to `CANCELLED` — it never reads or touches the
associated `Payment` row, and nothing else in the codebase reacts to a
booking transitioning to `CANCELLED` by initiating a refund. A student or
tutor can cancel a confirmed, fully-paid booking at any time (including
seconds before the session) and the payment stays fully charged with no
automatic reversal — an admin/support agent has to notice and manually
call the refund endpoint.

This is deliberately **not** improvised inside this quality gate: fixing
it correctly requires a genuine product/policy decision (which
cancellation reasons qualify for a refund, full vs. prorated, time-before-
session cutoffs) — exactly the kind of "no hardcoded cancellation/refund
business rules, a policy system instead" principle the Phase 6 approval
already established for `PaymentPolicy`. Building a plausible-looking rule
here without that decision would be exactly the kind of unauthorized
architecture change this phase was told not to make. **This is the single
highest-priority launch blocker in this report** (see
[`launch-checklist.md`](./launch-checklist.md)).

## Sandbox / real Stripe verification status

Unchanged from the Phase 6 completion report: this sandbox has no
`STRIPE_SECRET_KEY` anywhere. `payments:verify-sandbox`
(`apps/api/scripts/verify-stripe-sandbox.ts`) aborts cleanly with no
fabricated result. See [`STRIPE_SANDBOX_RUNBOOK.md`](../../STRIPE_SANDBOX_RUNBOOK.md)
for how to run it once a real `sk_test_...` key is available.

**Also still missing (confirmed by repo scan, not previously flagged):**
`apps/web` has no checkout/subscription-upgrade UI at all —
`settings/page.tsx` displays the current plan read-only, with no
Stripe.js/Elements integration and no "Upgrade" button anywhere. The
entire Phase 6 payments backend is built and tested, but no user can
currently initiate a real payment through the product. This is a second
CRITICAL launch blocker, out of scope to build inside this quality gate
(a genuine new frontend feature, not a fix).
