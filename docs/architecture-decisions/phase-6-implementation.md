# Phase 6 Implementation — Design Decisions

This is the running implementation log for Phase 6, referencing the approved decisions
from `phase-6-payment-architecture-quality-gate.md`. Each subphase gets a short design
note here *before* the corresponding code, per the "kurz dokumentieren, dann
implementieren" instruction — this file grows as subphases land, it is not written once.

## Approved business decisions (verbatim from approval)

1. **Merchant of record**: DeutschFlow, as destination charges (Connect). Legal/tax
   structure still needs professional review before live operation — this phase only
   builds the technical shape.
2. **Commission**: 20% default, **configurable**, never hardcoded.
3. **Cancellation/refund**: no hardcoded business rules — a policy system, not fixed
   numbers in code.
4. **SUPPORT refund authority**: within a configurable limit; above it, ADMIN required.
5. **Subscription grace period**: configurable, default 7 days, then server-side pause
   of PREMIUM/PRO entitlements back to FREE.
6. **Stripe Tax**: architecture prepared, not necessarily enabled at launch.
7. **Abandoned booking TTL**: configurable, default 15 minutes.

Consequence for schema design: items 2, 4, 5, 7 are genuinely configurable values, not
constants. A single-row `PaymentPolicy` table (admin-editable) is the mechanism — every
consumer reads this row, nothing is a `const COMMISSION_RATE = 0.20` in code.

## Phase 6.1 — Payment Database Foundation: design

**New enums** (Stripe-aligned naming where a Stripe concept exists, SCREAMING_SNAKE_CASE
matching every existing enum in the schema):

- `SubscriptionStatus` — **replaced**, not extended. The existing 3-value enum
  (`ACTIVE`/`CANCELLED`/`EXPIRED`) cannot represent Stripe's real lifecycle (no
  `PAST_DUE`, no `TRIALING`, no `INCOMPLETE`). Confirmed via grep that `CANCELLED` and
  `EXPIRED` are referenced nowhere in actual application code (only in the type
  definition file itself) — safe to replace outright rather than carry two competing
  vocabularies. New set: `INCOMPLETE, INCOMPLETE_EXPIRED, TRIALING, ACTIVE, PAST_DUE,
  CANCELED, UNPAID` (Stripe's own subscription statuses, single-L `CANCELED` matching
  Stripe's spelling exactly so there is only ever one way to write it in this codebase).
  `ACTIVE` is unchanged, so `register.ts`'s `SubscriptionPlan.FREE` +
  `SubscriptionStatus.ACTIVE` signup default requires no change.
- `PaymentStatus` — mirrors the Payment state machine from the quality-gate report §3.1.
- `RefundStatus`, `RefundInitiatorRole` — the latter is deliberately its own enum, not a
  reuse of `Role`, because "who/what initiated this refund" includes `SYSTEM`
  (automated abandoned-booking release is not a refund-of-a-payment case, but a future
  automated refund path might exist) alongside the three human roles that can actually
  initiate one today (`STUDENT` self-service cancellation, `SUPPORT`, `ADMIN`).
- `TutorConnectAccountStatus`, `TutorPayoutStatus` — mirror §3.3's payout state machine.
- `WebhookProcessingStatus` — `PENDING → PROCESSED | FAILED | IGNORED` (`IGNORED` is for
  event types we deliberately don't handle — still recorded, never silently dropped).

**New models**: `StripeCustomer` (1:1 User), `TutorConnectedAccount` (1:1 TutorProfile),
`Payment` (1:1 Booking), `Refund` (N:1 Payment), `TutorPayout` (N:1
TutorConnectedAccount, optional N:1 Payment), `StripeWebhookEvent` (the idempotency
ledger — `stripeEventId` unique is the load-bearing constraint), `PaymentPolicy`
(singleton row, `id = "default"`, holds the four configurable values above).

**Deliberately not modeled**: no `Invoice` table (Stripe Billing hosts these — see
quality-gate §22), no per-line-item tax breakdown (Stripe Tax, if enabled, is queried
live or its webhook payload's tax fields are read, not reconstructed locally).

**Money**: every amount is `Int` (integer cents), never `Decimal`/`Float`, matching
`Offering.priceCents`'s existing convention exactly.

**Ownership of writes**: nothing outside the webhook handler (Phase 6.5) is ever allowed
to set `Subscription.status`, `Payment.status`, `Refund.status`, or
`TutorConnectedAccount.chargesEnabled/payoutsEnabled` — every write path for these
fields funnels through webhook-driven service methods, never a directly-exposed PATCH
endpoint accepting these fields from a client body. This is the concrete mechanism for
"Geldstatus darf niemals ausschließlich aus Client-Daten kommen."

## Phase 6.6 — Tutor Connect: design

`ConnectAccountService` mirrors `StripeCustomerService`'s lazy get-or-create
shape (1:1 `TutorProfile` <-> Stripe Connect Express account, created on
first onboarding action, never at profile creation) plus a pure
`deriveConnectStatus(chargesEnabled, payoutsEnabled, detailsSubmitted)`
function for the capability-flags-to-status mapping — unit-tested standalone.

**Where the "offerings must not be bookable" gate actually lives.** The
quality-gate report (§3.3) said a tutor's offerings shouldn't be bookable
before Connect is `ENABLED`. Two places could enforce that: `Booking`
creation (Phase 5, already shipped and tested) or booking-payment checkout
(Phase 6.7, not yet built). Chosen: **checkout**, not booking creation. A
`Booking` row is still just a request in this model — nothing about
requesting a session actually requires Stripe to be able to pay the tutor;
only the *payment* does. Gating at checkout means Phase 5's `BookingsService`
and its existing test suite need zero changes for this subphase, and the
real constraint (Stripe's own destination-charge API would reject an
`application_fee_amount` transfer to a non-`charges_enabled` account anyway)
is enforced exactly where the money question first arises. `isBookable()`
is exported now so Phase 6.7's checkout endpoint can call it directly.

**Country fixed to `DE`.** Stripe Express account creation requires a
country at creation time. DeutschFlow's current scope is German-language
tutoring; multi-country tutor payouts are a real future expansion, not
built speculatively now — every tutor gets a German Express account
regardless of where they actually live, which is a known, accepted
limitation for this phase, not an oversight.
