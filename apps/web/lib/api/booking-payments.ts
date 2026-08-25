import 'server-only';
import { callNestApi } from './nest-client';
import type { SessionUser } from '../auth/session';

export type BookingCheckoutResult =
  | { clientSecret: string }
  | { quotaCovered: true }
  | { error: string };

/**
 * Starts (or, for a retried call, resumes) payment for a PENDING
 * booking. Server-side only — mirrors BookingPaymentService.createCheckout
 * exactly: tries the caller's PRO/MAX weekly live-lesson quota first
 * (server-side, never trusting a client-supplied plan), and only falls
 * back to a real Stripe PaymentIntent when the quota doesn't cover it.
 * Idempotent: calling this again for a booking whose checkout already
 * started re-fetches the same PaymentIntent's client secret rather than
 * creating a second one.
 */
export async function startBookingCheckout(user: SessionUser, bookingId: string): Promise<BookingCheckoutResult> {
  const response = await callNestApi(`/payments/bookings/${encodeURIComponent(bookingId)}/checkout`, user, {
    method: 'POST',
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    return { error: errorBody?.message ?? 'Zahlung konnte nicht gestartet werden.' };
  }

  return response.json();
}
