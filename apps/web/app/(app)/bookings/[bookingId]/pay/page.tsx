import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { getMyBookingsAsStudent } from '@/lib/api/bookings';
import { startBookingCheckout } from '@/lib/api/booking-payments';
import { SPECIALTY_LABELS, formatPrice } from '@/lib/tutor-labels';
import { BookingTime } from '@/components/booking-time';
import { FormMessage } from '@/components/ui/form-message';
import { StripePaymentForm } from './stripe-payment-form';

export const metadata: Metadata = { title: 'Zahlung abschließen – DeutschFlow' };

export default async function BookingPaymentPage({ params }: { params: { bookingId: string } }) {
  const session = await getSession();
  if (!session) redirect('/login');

  const bookings = await getMyBookingsAsStudent(session);
  const booking = bookings.find((b) => b.id === params.bookingId);
  if (!booking) notFound();

  if (booking.status !== 'PENDING') {
    // Already paid/confirmed (or cancelled) — nothing to pay for here.
    redirect('/bookings');
  }

  const result = await startBookingCheckout(session, booking.id);

  if ('quotaCovered' in result) {
    redirect('/bookings?confirmed=quota');
  }

  return (
    <div className="mx-auto max-w-md space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Zahlung abschließen</h1>
        <p className="text-sm text-muted-foreground">
          {booking.tutor.user.profile?.displayName ?? 'DeutschFlow-Tutor'} — {booking.offering.title}
        </p>
      </div>

      <div className="space-y-1 rounded-lg border border-border p-4 text-sm">
        <p>
          <BookingTime startAt={booking.startAt} endAt={booking.endAt} />
        </p>
        <p className="text-xs text-muted-foreground">
          {booking.offering.durationMinutes} Min. · {SPECIALTY_LABELS[booking.offering.category]}
        </p>
        <p className="font-medium">{formatPrice(booking.offering.priceCents, booking.offering.currency)}</p>
      </div>

      {'error' in result ? (
        <FormMessage type="error">{result.error}</FormMessage>
      ) : (
        <StripePaymentForm clientSecret={result.clientSecret} bookingId={booking.id} />
      )}

      <p className="text-xs text-muted-foreground">
        Zahlungen laufen sicher über Stripe. Wir speichern niemals deine Kartendaten.
      </p>
    </div>
  );
}
