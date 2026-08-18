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

## Phase 6.8 — Refunds: design

**No "pending admin approval" workflow.** The approval said "Support darf
Refunds innerhalb definierter Grenzen anstoßen. Größere ... Refunds
benötigen ADMIN-Freigabe." Two ways to build that: (a) SUPPORT submits a
request that sits in a queue until an ADMIN approves it, or (b) SUPPORT
simply cannot successfully call the endpoint above the limit — only ADMIN
can. Chosen: **(b)**. It satisfies the requirement exactly (support has
bounded standing authority, larger refunds require an admin to act) without
inventing a new approval-queue entity/workflow this phase never asked for.
`Refund.requiredAdminApproval` still records, for every refund regardless of
who initiated it, whether the amount exceeded SUPPORT's standing limit — an
audit fact ("this needed admin-level authority"), not a workflow gate.

**Booking.status only moves on a FULL refund.** A partial refund never
touches `Booking.status` — the session still happened, a partial credit
doesn't change that. `REFUND_PENDING`/`REFUNDED` (the existing Phase 5
enum values) are only set when a refund request covers the entire
remaining refundable balance of the payment, checked at initiation time
(`amountCents === remaining`), and confirmed once Stripe reports the
refund `SUCCEEDED`.

**No automatic reversal on a FAILED refund.** If a refund attempt fails
after `Booking.status` was optimistically set to `REFUND_PENDING`, this
phase does not automatically revert it — the failure is recorded
(`Refund.status = FAILED`) and becomes visible to admin/support (Phase
6.10) for manual follow-up. Building automatic state reversion would need
tracking "what was the state before this refund attempt," which adds real
complexity for a genuinely rare edge case (refund attempts on an
already-successfully-charged payment method fail infrequently); documented
here as a known, bounded limitation rather than solved speculatively.

**Disputes are grouped into RefundService**, not a separate module —
`recordDispute()` mirrors the `pastDueSince` pattern (set once, on first
sight, never reset by later updates for the timestamp; the status string
itself always reflects Stripe's latest). Matches the quality-gate report's
own grouping (§30 discusses disputes under refunds/chargebacks) and avoids
a fourth near-empty module for a handful of fields on the existing
`Payment` row.

## Phase 6.9 — Tutor Payouts: design

**A reconciliation ledger, not an orchestration engine** (quality-gate
report's own framing, §7). DeutschFlow never triggers a tutor payout — a
destination charge's `transfer_data.destination` already moves the tutor's
share into their connected account's Stripe balance atomically at charge
time, and Stripe's own (Express/Standard account) payout schedule sweeps
that balance to the tutor's bank on its own cadence. This phase only
*records what Stripe reports happened*, via two independent Stripe object
types, each becoming its own `TutorPayout` row rather than one merged
"payout" concept:

- **`transfer.created`** (platform-account event) — money for one specific
  booking payment landed in the tutor's Connect balance. Correlated back to
  the originating `Payment` via `Payment.stripeChargeId` (populated in this
  subphase — see `PaymentIntentEventData.chargeId` /
  `Payment.stripeChargeId`, sourced from the PaymentIntent's
  `latest_charge`, itself matched against the Transfer's
  `source_transaction`). Recorded with `status: PENDING` and
  `stripeTransferId` set (unique, so redelivery is a no-op upsert).
- **`payout.paid` / `payout.failed`** (Connect-account-scoped events,
  `event.account` = the connected account id) — Stripe actually moved a
  balance amount to the tutor's external bank account. Recorded with
  `status: PAID`/`FAILED` and `stripePayoutId` set (also unique).

**Deliberately not correlated 1:1.** Stripe's automatic payout schedule
sweeps the *entire* available balance at payout time, which can bundle
many transfers (across many bookings, sometimes many days) into one
Payout — there is no Stripe-provided mapping from a Payout back to the
exact set of Transfers it swept. Asserting a precise link here would mean
either querying Stripe's balance-transaction history at payout time (real
scope this phase does not need) or guessing (which the "never present fake
payments as successful" instruction forbids by extension — a fabricated
correlation is just as dishonest as a fabricated payment). Instead: each
Stripe object type gets its own row, both queryable per tutor, and an
admin/support reader can reconcile by amount and time window. This
limitation is recorded here explicitly, not silently.

**No payout amount is ever taken from the client.** Both event handlers
are 100% webhook-driven (signature-verified, idempotent via the existing
`stripeTransferId`/`stripePayoutId` unique constraints) — there is no
client-callable "create payout" endpoint anywhere, consistent with "Keine
Tutor-Auszahlung darf clientseitig ausgelöst werden."

**`GET /tutors/me/payouts`** — `@Roles(TUTOR)`, `@CurrentUser()`-scoped
only (same IDOR convention as `ConnectController`: a tutor only ever reads
their own payout ledger, never a client-supplied tutorId).

## Phase 6.10 — Admin/Support Payment Operations: design

**Closes the quality-gate report's own §11 API-boundary gaps.** Three
things the report specified but earlier subphases deliberately deferred
(each with a "see Phase 6.10" pointer already left in the code):

- `PaymentPolicyService.update()` (built in 6.1, never wired to a route) —
  now exposed as `GET/PATCH /payments/policy`. **`GET` is `@Roles(ADMIN,
  SUPPORT)`** (SUPPORT needs to see its own standing refund-authority
  limit to know when a request is out of scope); **`PATCH` is
  `@Roles(ADMIN)` only** — matches the approval's "innerhalb einer
  konfigurierbaren Grenze; darüber ADMIN erforderlich" framing: SUPPORT
  operates within the policy, only ADMIN edits it.
- `SubscriptionService.requestCancelAtPeriodEnd()` (built in 6.3, never
  wired to a route) — now exposed as `POST /payments/subscriptions/cancel`,
  `@CurrentUser()`-scoped, any authenticated role. Self-service, not an
  admin/support action, but it is the same "finish what an earlier
  subphase intentionally left stubbed" work as the policy routes above, so
  it lands in the same pass rather than staying orphaned indefinitely.
- The report's §11 line `GET /payments/admin/... — Admin dashboards: all
  payments, disputes, refund queue` — now three concrete read endpoints,
  all `@Roles(ADMIN, SUPPORT)`:
  - `GET /payments/admin/payments` — every `Payment` row, newest first.
  - `GET /payments/admin/payments/:paymentId` — one payment plus its
    `Refund[]` (the existing Prisma relation), 404 (never 403) if the id
    doesn't exist — same convention as every ownership-checked lookup
    elsewhere, even though there is no "ownership" here in the IDOR sense;
    a not-found id should not distinguish "wrong id" from "no
    permission" for a support agent's tooling any more than for a
    student's.
  - `GET /payments/admin/refunds` — every `Refund` row, newest first (the
    report's own "queue" wording is reused as the route name only; there
    is no separate pending-approval queue — see the 6.8 design note for
    why that was rejected as its own workflow entity).
  - `GET /payments/admin/disputes` — every `Payment` row with
    `disputedAt` set, ordered by `disputedAt` descending.

**No pagination.** Every other admin-role list endpoint in this codebase
(`tutors/admin/verification/queue` from Phase 5.6, for one) returns an
unpaginated list — matching that precedent instead of introducing a
pagination convention nothing else here uses yet, for what is, at this
phase's expected data volume, a small admin tool surface.

## Phase 6.11 — Entitlements Integration: design

**The shape was already decided in 6.1.** `ENTITLED_SUBSCRIPTION_STATUSES
= ['ACTIVE', 'TRIALING']` and `Subscription.pastDueSince` /
`PaymentPolicy.pastDueGracePeriodDays` were built with doc comments
pointing at "Phase 6.11" specifically — this subphase is that comment's
payoff, not a new design.

**`EntitlementsService.getActivePlan()` changes from a single query to a
two-step, still-read-only lookup:**

1. Most recent `Subscription` with `status IN (ACTIVE, TRIALING)` → if
   found, that plan is active. (Covers the ordinary case, including a
   still-honored subscription mid-cancellation via `cancelAtPeriodEnd` —
   Stripe keeps `status: active` until the period actually ends, so no
   separate check is needed for that.)
2. Otherwise, most recent `Subscription` with `status: PAST_DUE` → if its
   `pastDueSince` is within `PaymentPolicy.pastDueGracePeriodDays` of now,
   the plan is **still** active (the approval's "configurable grace
   period, default 7 days" — a lapsed card doesn't cut a student off
   mid-grace-period). Once the grace period elapses, this branch stops
   matching and step 3 applies.
3. Otherwise (no ACTIVE/TRIALING row, and no PAST_DUE row still in grace)
   → `SubscriptionPlan.FREE`.

**The "pause to FREE" is computed at read time, not written anywhere.**
`SubscriptionService`'s own class doc comment (6.3) is explicit:
"Owns every write to `Subscription.status`... only ever called from the
webhook handler" — the concrete mechanism behind "Entitlements dürfen
nicht aus Client-Plan kommen." Adding a second writer (e.g., a scheduled
job that flips `status` once grace expires) would violate that invariant
for no benefit: `getActivePlan()` already re-evaluates the grace window on
every call, so "pause" simply means the next `canAccess()` call stops
matching branch 2 above — no row ever needs to change. If Stripe recovers
the payment later, the ordinary `customer.subscription.updated` webhook
puts the row back to ACTIVE and access resumes automatically.

**Grace-period math lives in a pure function**
(`entitlements/past-due-grace-period.ts`,
`isWithinPastDueGracePeriod(pastDueSince, graceDays, now)`), same
pure-function-first pattern as `isAbandoned` (6.7) — unit-testable without
a clock mock or a database.

**`GET /users/me/subscription` (`SubscriptionController`) is intentionally
left untouched.** The quality-gate report's own API-boundary table marks
it "existing, unchanged," and it answers a different question ("what does
the user's subscription record currently say") than entitlements do
("does the user get PREMIUM/PRO features right now") — conflating the two
would mean a user mid-grace-period sees "no active subscription" in their
account page while still being granted PREMIUM features, which is more
confusing than the current literal read. Reconciling that display is
explicitly out of scope for this subphase.

## Phase 6.12 — Payment Security Tests: design

**Not a new feature pass — a targeted look at what 6.1–6.11's per-unit
tests don't yet prove together.** Every collaborator (signature
verification, idempotency ledger, dispatcher, each domain service) already
has thorough unit coverage from its own subphase. What's still untested is
the **composition** — the exact sequence the quality-gate report's §13
threat table and §18 "Double Payment Prevention" describe as the actual
defense, not any one piece of it:

1. **`StripeWebhookController`'s full pipeline** (`stripe-webhook
   .controller.spec.ts`, new) — verify → idempotency → dispatch → mark
   outcome, as one unit with all four collaborators mocked. This is the
   literal, end-to-end proof of "Webhook-Verarbeitung muss idempotent
   sein": a duplicate event (`idempotency.recordIfNew` returning `false`)
   must never reach `dispatcher.dispatch` at all — not "dispatch is
   idempotent if called twice," but "dispatch is not called a second
   time." Also covers the failure path (`dispatch` throws →
   `markFailed` + rethrow, so Stripe's automatic retry gets a 500 and
   tries again) and the ignored path (unrecognized event type →
   `markIgnored`, still 200 so Stripe stops redelivering something
   already looked at).
2. **ValidationPipe as the first line against a forged client plan/status**
   (extends `payments-authorization.e2e-spec.ts`) — the quality-gate
   report's §13 mitigation for "client claims a plan it doesn't have" is
   "no endpoint anywhere accepts it," which today is true by omission
   (the DTOs simply don't declare a `status`/`plan` field for anything
   but the one legitimate `plan` on subscription checkout). This phase
   adds an explicit regression test: a subscription-checkout request
   carrying an extra `status: 'ACTIVE'` field is rejected 400 by
   `ValidationPipe({ forbidNonWhitelisted: true })` before any service
   method runs — proving the mitigation at the wire, not just by reading
   the DTO source.
3. **A positive assertion that no client-triggered payout endpoint
   exists.** `TutorPayoutService` (6.9) has no public write method at
   all — `recordTransfer`/`recordPayoutOutcome` are only ever called from
   `WebhookDispatcherService`. A route-level e2e probe (`POST
   /tutors/me/payouts` → 404, since only `GET` is registered) turns "we
   didn't build one" into a test that fails loudly if anyone ever adds
   one without deliberately revisiting this constraint.

No new pure functions, no new services — this subphase is entirely test
code, matching the approval's "after each subsystem: lint, typecheck,
tests" cadence applied one level up, to the subsystem boundary itself.

## Phase 6.13 — Sandbox E2E: design

**Mirrors the Phase 4.5 precedent exactly** (`scripts/ai-real-provider
-test.ts` / `ai:eval`, blocked by no `ANTHROPIC_API_KEY`) and the §16c
"Manual, non-CI Stripe test-mode verification script" the quality-gate
report specified up front: a standalone script under `apps/api/scripts/`,
never wired into CI (CI has no real Stripe test credentials and shouldn't
need any to stay green — same reasoning as `booking:verify-concurrency`),
runnable on demand by a human with real `sk_test_...` credentials.

**`verify-stripe-sandbox.ts`** exercises the actual money flows against
real Stripe **test-mode** API calls (never mocked), reporting each phase
independently as PASS/FAIL/SKIP rather than one monolithic result:

1. Create a test `Customer`.
2. Subscription checkout — create a Checkout Session
   (`mode: subscription`) against `STRIPE_PRICE_ID_PREMIUM`; verify a
   session URL comes back. Skipped (not failed) if that price id isn't
   configured, so a partial sandbox setup still yields a useful report.
3. Booking payment (destination charge) — create a `Custom`-type
   connected account with Stripe's documented test-mode values (test SSN,
   test DOB, test ToS acceptance) so it reaches `charges_enabled` without
   real KYC, then confirm a PaymentIntent with `application_fee_amount` +
   `transfer_data.destination` against it using Stripe's `pm_card_visa`
   test payment method, and assert it reaches `succeeded`. Uses `US` as
   the test account's country specifically because Custom-account test
   values are best-documented for `US` — this step verifies the
   destination-charge *mechanics* (commission split, atomic transfer),
   not DE-specific onboarding UX, which is out of scope for a mechanics
   verification script.
4. Refund — partially refund the PaymentIntent from step 3, assert the
   refund reaches `succeeded`.
5. Cleanup — delete the test customer and connected account regardless of
   outcome (`finally`), same discipline as `verify-booking-concurrency`.

**Aborts cleanly, exit code 0, the moment `StripeService.isConfigured()`
is false** — identical wording pattern to `ai:eval`'s abort message: no
phase is attempted, no result is fabricated. Added as
`pnpm --filter @deutschflow/api payments:verify-sandbox`.

**Run in this environment: BLOCKED.** Checked (same method as the Phase
4.5 precedent): shell environment, `apps/api/.env`, `apps/api/.env
.example`, every `.env*` file in the repo — no `STRIPE_SECRET_KEY`
anywhere, real or placeholder-with-a-value. Running the script produces
the clean abort described above; **no Stripe test-mode call of any kind
was made, and no result in this report is fabricated.** Everything
verifiable without real Stripe credentials — the full `pnpm lint` /
`typecheck` / `test` / `build` gate across the monorepo (§16, run in
Phase 6.14) and the entire unit/e2e suite built across 6.1–6.12 — is
verified. The one thing that remains open, exactly as it did for Phase
4.5's AI quality gate, is real Stripe test-mode confirmation: this phase
cannot be verified end-to-end against live Stripe test infrastructure
until a real `sk_test_...` key (plus `STRIPE_PRICE_ID_PREMIUM`/`_PRO` and
the two webhook secrets) is provided and
`payments:verify-sandbox` is run by a human with that credential.
