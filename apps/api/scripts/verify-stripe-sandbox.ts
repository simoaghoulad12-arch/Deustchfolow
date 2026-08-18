import 'reflect-metadata';
import { StripeService } from '../src/modules/payments/stripe/stripe.service';

/**
 * Manual, opt-in proof that the real Phase 6 money flows work against
 * REAL Stripe TEST-MODE infrastructure (never mocked) — the §16c
 * "Manual, non-CI Stripe test-mode verification script" the quality-gate
 * report specified. Mirrors `verify-booking-concurrency.ts`'s precedent
 * exactly: never runs in CI (no real Stripe credentials there and none
 * should be needed to stay green), opt-in for a human with a real
 * `sk_test_...` key.
 *
 * Aborts cleanly with no fabricated result if STRIPE_SECRET_KEY isn't
 * configured — same "keine Fake-Ergebnisse" discipline as `ai:eval`.
 *
 * Run with: pnpm --filter @deutschflow/api payments:verify-sandbox
 */

interface PhaseResult {
  phase: string;
  status: 'PASS' | 'FAIL' | 'SKIP';
  detail: string;
}

async function main(): Promise<void> {
  const stripe = new StripeService();

  if (!stripe.isConfigured()) {
    console.log(
      '[verify-stripe-sandbox] STRIPE_SECRET_KEY is not set. Aborting cleanly — no Stripe test-mode call ' +
        'of any kind was made and no result was fabricated. Set STRIPE_SECRET_KEY (a real sk_test_... key) ' +
        'as a local server-only env var to run this verification.',
    );
    process.exitCode = 0;
    return;
  }

  const client = stripe.client;
  const results: PhaseResult[] = [];
  let customerId: string | undefined;
  let connectedAccountId: string | undefined;

  try {
    // --- Phase 1: Customer ---
    const customer = await client.customers.create({ email: `verify-sandbox-${Date.now()}@example.com` });
    customerId = customer.id;
    results.push({ phase: 'Customer creation', status: 'PASS', detail: customer.id });

    // --- Phase 2: Subscription checkout (Checkout Session) ---
    const premiumPriceId = process.env.STRIPE_PRICE_ID_PREMIUM;
    if (!premiumPriceId) {
      results.push({ phase: 'Subscription checkout', status: 'SKIP', detail: 'STRIPE_PRICE_ID_PREMIUM not configured' });
    } else {
      const session = await client.checkout.sessions.create({
        mode: 'subscription',
        customer: customerId,
        line_items: [{ price: premiumPriceId, quantity: 1 }],
        success_url: `${process.env.APP_URL ?? 'http://localhost:3000'}/success`,
        cancel_url: `${process.env.APP_URL ?? 'http://localhost:3000'}/cancel`,
      });
      results.push({
        phase: 'Subscription checkout',
        status: session.url ? 'PASS' : 'FAIL',
        detail: session.url ?? 'no session URL returned',
      });
    }

    // --- Phase 3: Booking payment (destination charge) ---
    // Custom-account test values, per Stripe's documented test-mode
    // pattern — reaches charges_enabled without real KYC. US, not DE:
    // this verifies destination-charge MECHANICS (commission split,
    // atomic transfer), not DE-specific onboarding UX (out of scope
    // here).
    const account = await client.accounts.create({
      type: 'custom',
      country: 'US',
      capabilities: { card_payments: { requested: true }, transfers: { requested: true } },
      business_type: 'individual',
      individual: {
        first_name: 'Test',
        last_name: 'Tutor',
        email: `verify-sandbox-tutor-${Date.now()}@example.com`,
        dob: { day: 1, month: 1, year: 1901 },
        ssn_last_4: '0000',
        address: { line1: 'address_full_match', city: 'New York', state: 'NY', postal_code: '10001', country: 'US' },
      },
      tos_acceptance: { date: Math.floor(Date.now() / 1000), ip: '127.0.0.1' },
      business_profile: { mcc: '8299', url: 'https://example.com' },
    });
    connectedAccountId = account.id;

    if (!account.charges_enabled) {
      results.push({
        phase: 'Booking payment (destination charge)',
        status: 'SKIP',
        detail: `connected account ${account.id} not charges_enabled (requirements: ${JSON.stringify(account.requirements?.currently_due)})`,
      });
    } else {
      const paymentIntent = await client.paymentIntents.create({
        amount: 2000,
        currency: 'usd',
        customer: customerId,
        payment_method: 'pm_card_visa',
        confirm: true,
        application_fee_amount: 400,
        transfer_data: { destination: account.id },
        automatic_payment_methods: { enabled: true, allow_redirects: 'never' },
      });

      results.push({
        phase: 'Booking payment (destination charge)',
        status: paymentIntent.status === 'succeeded' ? 'PASS' : 'FAIL',
        detail: `PaymentIntent ${paymentIntent.id} status: ${paymentIntent.status}`,
      });

      // --- Phase 4: Refund ---
      if (paymentIntent.status === 'succeeded') {
        const refund = await client.refunds.create({ payment_intent: paymentIntent.id, amount: 500 });
        results.push({
          phase: 'Refund',
          status: refund.status === 'succeeded' ? 'PASS' : 'FAIL',
          detail: `Refund ${refund.id} status: ${refund.status}`,
        });
      } else {
        results.push({ phase: 'Refund', status: 'SKIP', detail: 'no successful PaymentIntent to refund' });
      }
    }
  } finally {
    console.log('[verify-stripe-sandbox] Cleaning up test-mode fixtures...');
    if (customerId) {
      await client.customers.del(customerId).catch((e) => console.error('[verify-stripe-sandbox] customer cleanup failed:', e));
    }
    if (connectedAccountId) {
      await client.accounts.del(connectedAccountId).catch((e) => console.error('[verify-stripe-sandbox] account cleanup failed:', e));
    }
  }

  console.log('\n[verify-stripe-sandbox] Results:');
  for (const r of results) {
    console.log(`  [${r.status}] ${r.phase} — ${r.detail}`);
  }

  const hasFailure = results.some((r) => r.status === 'FAIL');
  process.exitCode = hasFailure ? 1 : 0;
}

main().catch((error) => {
  console.error('[verify-stripe-sandbox] Unexpected error:', error);
  process.exitCode = 1;
});
