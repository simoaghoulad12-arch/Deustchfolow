import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { getMyBookingsAsStudent } from '@/lib/api/bookings';
import { BOOKING_STATUS_LABELS, SPECIALTY_LABELS, formatPrice } from '@/lib/tutor-labels';
import { BookingTime } from '@/components/booking-time';
import { Button } from '@/components/ui/button';
import { FormMessage } from '@/components/ui/form-message';
import { cancelBookingAction } from './actions';

export const metadata: Metadata = { title: 'Meine Buchungen – DeutschFlow' };

const CANCELLABLE_STATUSES = new Set(['PENDING', 'CONFIRMED']);

export default async function BookingsPage({
  searchParams,
}: {
  searchParams: { created?: string; cancelled?: string; cancelError?: string };
}) {
  const session = await getSession();
  if (!session) redirect('/login');

  const bookings = await getMyBookingsAsStudent(session);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Meine Buchungen</h1>
        <p className="text-sm text-muted-foreground">Deine Termine bei DeutschFlow-Tutoren.</p>
      </div>

      {searchParams.created && (
        <FormMessage type="success">
          Buchungsanfrage gesendet. Der Tutor muss den Termin noch bestätigen.
        </FormMessage>
      )}
      {searchParams.cancelled && <FormMessage type="success">Buchung storniert.</FormMessage>}
      {searchParams.cancelError && <FormMessage type="error">{searchParams.cancelError}</FormMessage>}

      {bookings.length === 0 && (
        <p className="text-sm text-muted-foreground">Du hast noch keine Termine gebucht.</p>
      )}

      <ul className="space-y-3">
        {bookings.map((booking) => (
          <li key={booking.id} className="space-y-2 rounded-lg border border-border p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-medium">
                  {booking.tutor.user.profile?.displayName ?? 'DeutschFlow-Tutor'} — {booking.offering.title}
                </p>
                <p className="text-xs text-muted-foreground">
                  {SPECIALTY_LABELS[booking.offering.category]} ·{' '}
                  {formatPrice(booking.offering.priceCents, booking.offering.currency)}
                </p>
              </div>
              <span className="whitespace-nowrap rounded-full border border-border px-3 py-1 text-xs font-medium text-muted-foreground">
                {BOOKING_STATUS_LABELS[booking.status]}
              </span>
            </div>
            <p className="text-sm">
              <BookingTime startAt={booking.startAt} endAt={booking.endAt} />
            </p>
            {booking.cancellationReason && (
              <p className="text-xs text-muted-foreground">Grund: {booking.cancellationReason}</p>
            )}
            {CANCELLABLE_STATUSES.has(booking.status) && (
              <form action={cancelBookingAction}>
                <input type="hidden" name="bookingId" value={booking.id} />
                <Button type="submit" variant="outline" size="default">
                  Stornieren
                </Button>
              </form>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
