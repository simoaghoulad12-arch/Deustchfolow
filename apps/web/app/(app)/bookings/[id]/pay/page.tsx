import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { getMyBookingsAsStudent } from '@/lib/api/bookings';
import { createBookingCheckout } from '@/lib/api/payments';
import { SPECIALTY_LABELS, formatPrice } from '@/lib/tutor-labels';
import { FormMessage } from '@/components/ui/form-message';
import { BookingPaymentForm } from './payment-form';

export const metadata: Metadata = { title: 'Buchung bezahlen – DeutschFlow' };

export default async function PayBookingPage({ params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) redirect('/login');

  // No single-booking GET endpoint exists — filtering the student's own
  // list also doubles as the ownership check (a foreign booking id just
  // isn't in this list, same as elsewhere in this codebase).
  const bookings = await getMyBookingsAsStudent(session);
  const booking = bookings.find((b) => b.id === params.id);
  if (!booking) notFound();

  if (booking.status !== 'PENDING') {
    return (
      <div className="mx-auto max-w-xl space-y-4">
        <h1 className="text-2xl font-semibold">Buchung bezahlen</h1>
        <FormMessage type="error">
          Diese Buchung ist nicht (mehr) offen für eine Zahlung — Status:{' '}
          {booking.status === 'CANCELLED' ? 'storniert' : booking.status}.
        </FormMessage>
      </div>
    );
  }

  const checkout = await createBookingCheckout(session, booking.id);

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Buchung bezahlen</h1>
        <p className="text-sm text-muted-foreground">
          bei {booking.tutor.user.profile?.displayName ?? 'DeutschFlow-Tutor'}
        </p>
      </div>

      <div className="rounded-lg border border-border p-4">
        <p className="font-medium">{booking.offering.title}</p>
        <p className="text-xs text-muted-foreground">
          {booking.offering.durationMinutes} Min. · {SPECIALTY_LABELS[booking.offering.category]}
        </p>
        <p className="mt-1 font-medium">{formatPrice(booking.offering.priceCents, booking.offering.currency)}</p>
      </div>

      {!checkout.ok && <FormMessage type="error">{checkout.error}</FormMessage>}
      {checkout.ok && <BookingPaymentForm clientSecret={checkout.data.clientSecret} />}
    </div>
  );
}
