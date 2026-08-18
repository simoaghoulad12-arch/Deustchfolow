# Stripe Sandbox Verification — Runbook

Status as of Phase 6.5: **BLOCKED — no real `STRIPE_SECRET_KEY` available
in the development sandbox.** This runbook is what a human runs once a
real test-mode key is available; nothing here has been executed against
real Stripe infrastructure, and nothing in this repo claims otherwise.

## What this verifies

The actual Stripe TEST-MODE money flows, exercised against real Stripe
test infrastructure (never mocked): customer creation, a subscription
Checkout Session, a destination-charge PaymentIntent against a Connect
test account (commission split + atomic transfer mechanics), and a
refund. See `docs/production-readiness/payments.md` for what's already
been verified without a live key (webhook signature/idempotency, DB
constraints, no client-settable payment status, etc. — all confirmed via
static code review and unit tests, independent of this runbook).

**This never runs against live Stripe.** `StripeService` explicitly
refuses any key starting with `sk_live_` — it is structurally impossible
to run this against a production Stripe account by accident.

## Prerequisites

- A Stripe account with test mode enabled (the default state of any new
  Stripe account).
- Two test-mode Prices created in the Stripe dashboard for the PREMIUM
  and PRO subscription plans.
- **Never commit any of these values. Never paste them into a shared
  chat.**

## Environment variables (names only — see
`docs/production-readiness/environment.md` for the full matrix)

| Variable | Required | Notes |
|---|---|---|
| `STRIPE_SECRET_KEY` | Yes | Must start with `sk_test_` — `sk_live_` is rejected by the code itself. |
| `STRIPE_PUBLISHABLE_KEY` | For frontend work | Not used by the verification script itself. |
| `STRIPE_WEBHOOK_SECRET`, `STRIPE_CONNECT_WEBHOOK_SECRET` | For webhook testing | Get these from `stripe listen` (Stripe CLI) or the dashboard's webhook endpoint config — not exercised by the sandbox script below, which tests the synchronous API flows, not webhook delivery. |
| `STRIPE_PRICE_ID_PREMIUM`, `STRIPE_PRICE_ID_PRO` | Yes, for the subscription-checkout phase | The two test-mode Price ids created above. Without these, that one phase is reported `SKIP`, not `FAIL` — the rest of the script still runs. |
| `APP_URL` | No | Used to build the Checkout Session's success/cancel redirect URLs; defaults to `http://localhost:3000`. |

Set as real shell exports or in `apps/api/.env` (confirm it's
`.gitignore`d before running, same discipline as the AI runbook).

## Command

```
pnpm --filter @deutschflow/api payments:verify-sandbox
```

Source: `apps/api/scripts/verify-stripe-sandbox.ts`. Never runs in CI
(same reasoning as `booking:verify-concurrency` and `ai:eval` — CI has no
real credentials and shouldn't need any to stay green).

## What "done" looks like

The script reports each phase independently — read all of them, not just
the final exit code:

1. **Customer creation** — PASS/FAIL.
2. **Subscription checkout** — PASS/FAIL/SKIP (SKIP if
   `STRIPE_PRICE_ID_PREMIUM` isn't set).
3. **Booking payment (destination charge)** — creates a Custom-type
   Connect test account with Stripe's documented test-mode values (test
   SSN, test DOB, test ToS acceptance) to reach `charges_enabled` without
   real KYC, confirms a PaymentIntent against it with
   `application_fee_amount` + `transfer_data.destination`, using
   `pm_card_visa`. PASS/FAIL/SKIP (SKIP if the test account doesn't reach
   `charges_enabled` — the reported `requirements.currently_due` array
   explains why).
4. **Refund** — a partial refund of the PaymentIntent from step 3.
   PASS/FAIL/SKIP.

The script cleans up its own test fixtures (deletes the test customer and
connected account) in a `finally` block regardless of outcome.

Exit code `0` with no failures = done. A `SKIP` on step 3/4 is expected
and acceptable if step 3's Connect test account setup didn't fully
activate — that's a known, documented limitation of automating Custom-
account test-mode activation (see the script's own comments), not a
failure of the underlying destination-charge mechanics, which is what
actually matters for production readiness.

## What this does NOT verify

- Webhook delivery and processing against a live Stripe webhook endpoint
  (this script tests the synchronous API responses; use `stripe listen`
  + `stripe trigger` separately to exercise
  `StripeWebhookController`/`WebhookDispatcherService` against real,
  signed webhook deliveries if that level of verification is needed).
- DE-specific Connect onboarding UX (the test account intentionally uses
  `US` as its country because Custom-account test values are best-
  documented for `US` — this verifies the destination-charge commission-
  split/atomic-transfer *mechanics*, not the real onboarding flow a DE
  tutor will actually go through).
- Live-mode behavior (structurally impossible to trigger via this
  script).

## If something goes wrong

- **A phase reports FAIL:** this is a real problem — do not re-run
  hoping it passes; investigate the reported error message before
  touching any code.
- **Connect test account never reaches `charges_enabled`:** check the
  reported `requirements.currently_due` array — Stripe's test-mode
  Custom-account activation requirements can change; the script's own
  test data may need updating to match current Stripe requirements.
