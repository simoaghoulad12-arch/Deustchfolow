import 'server-only';
import type { SubscriptionPlan } from '@deutschflow/types';
import { callNestApi } from './nest-client';
import type { SessionUser } from '../auth/session';

export type PaymentActionResult<T> = { ok: true; data: T } | { ok: false; error: string };

async function parsePaymentErrorMessage(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { message?: string | string[] };
    if (Array.isArray(body.message)) return body.message.join(' ');
    if (typeof body.message === 'string') return body.message;
  } catch {
    // No JSON body — fall through to the generic message.
  }
  return 'Etwas ist schiefgelaufen. Bitte versuche es erneut.';
}

/**
 * Stripe-hosted Checkout for PREMIUM/PRO — the API returns the URL to
 * redirect the browser to (see CheckoutService, `apps/api`). FREE is
 * never checked out.
 */
export async function createSubscriptionCheckout(
  user: SessionUser,
  plan: typeof SubscriptionPlan.PREMIUM | typeof SubscriptionPlan.PRO,
): Promise<PaymentActionResult<{ url: string }>> {
  const response = await callNestApi('/payments/subscriptions/checkout', user, {
    method: 'POST',
    body: JSON.stringify({ plan }),
  });
  if (!response.ok) return { ok: false, error: await parsePaymentErrorMessage(response) };
  return { ok: true, data: await response.json() };
}

/** Self-service cancel-at-period-end — never an immediate hard revoke. */
export async function cancelSubscription(user: SessionUser): Promise<PaymentActionResult<{ requested: true }>> {
  const response = await callNestApi('/payments/subscriptions/cancel', user, { method: 'POST' });
  if (!response.ok) return { ok: false, error: await parsePaymentErrorMessage(response) };
  return { ok: true, data: await response.json() };
}

/**
 * The marketplace one-time booking payment — a Stripe PaymentIntent
 * `clientSecret` to confirm client-side with Stripe.js Elements, not a
 * hosted-Checkout URL (different Stripe product than subscriptions, see
 * BookingPaymentService).
 */
export async function createBookingCheckout(
  user: SessionUser,
  bookingId: string,
): Promise<PaymentActionResult<{ clientSecret: string }>> {
  const response = await callNestApi(`/payments/bookings/${encodeURIComponent(bookingId)}/checkout`, user, {
    method: 'POST',
  });
  if (!response.ok) return { ok: false, error: await parsePaymentErrorMessage(response) };
  return { ok: true, data: await response.json() };
}
