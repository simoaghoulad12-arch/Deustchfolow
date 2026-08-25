import 'server-only';
import type { SubscriptionPlan } from '@deutschflow/types';
import { callNestApi } from './nest-client';
import type { SessionUser } from '../auth/session';

export type CheckoutResult = { url: string } | { error: string };

/**
 * Server-side only — creates a Stripe-hosted Checkout Session via the
 * existing CheckoutService and hands back the redirect URL. The browser
 * never sees a Stripe secret key and never picks the price: `plan` is
 * validated against `CreateSubscriptionCheckoutDto` (PREMIUM/PRO only)
 * on the API side, which resolves the Stripe Price id server-side.
 */
export async function createSubscriptionCheckout(
  user: SessionUser,
  plan: typeof SubscriptionPlan.PREMIUM | typeof SubscriptionPlan.PRO,
): Promise<CheckoutResult> {
  const response = await callNestApi('/payments/subscriptions/checkout', user, {
    method: 'POST',
    body: JSON.stringify({ plan }),
  });

  if (!response.ok) {
    return { error: 'Checkout konnte nicht gestartet werden. Bitte versuche es erneut.' };
  }

  const data: { url: string } = await response.json();
  return { url: data.url };
}

/**
 * Requests cancel-at-period-end for the caller's active subscription.
 * Never an immediate hard revoke — the user keeps access until the
 * paid period ends (SubscriptionService's existing behavior).
 */
export async function cancelSubscription(user: SessionUser): Promise<{ ok: boolean }> {
  const response = await callNestApi('/payments/subscriptions/cancel', user, { method: 'POST' });
  return { ok: response.ok };
}
