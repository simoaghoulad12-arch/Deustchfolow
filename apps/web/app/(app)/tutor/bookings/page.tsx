import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { UserRole } from '@deutschflow/types';
import { getSession } from '@/lib/auth/session';
import { getMyBookingsAsTutor, type Booking } from '@/lib/api/bookings';
import { BOOKING_STATUS_LABELS, formatPrice } from '@/lib/tutor-labels';
import { BookingTime } from '@/components/booking-time';
import { Button } from '@/components/ui/button';
import { FormMessage } from '@/components/ui/form-message';
import { confirmBookingAction, cancelBookingAction, completeBookingAction, noShowAction } from './actions';

export const metadata: Metadata = { title: 'Buchungen – DeutschFlow' };

function BookingCard({ booking, now }: { booking: Booking; now: number }) {
  const endAtMs = new Date(booking.endAt).getTime();
  const startAtMs = new Date(booking.startAt).getTime();

  return (
    <li className="space-y-2 rounded-lg border border-border p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-medium">
            {booking.student.profile?.displayName ?? 'Schüler:in'} — {booking.offering.title}
          </p>
          <p className="text-xs text-muted-foreground">
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
      {booking.notes && <p className="text-xs text-muted-foreground">Notiz: {booking.notes}</p>}
      {booking.cancellationReason && (
        <p className="text-xs text-muted-foreground">Grund: {booking.cancellationReason}</p>
      )}

      <div className="flex flex-wrap gap-2">
        {booking.status === 'PENDING' && (
          <form action={confirmBookingAction}>
            <input type="hidden" name="bookingId" value={booking.id} />
            <Button type="submit" size="default">
              Bestätigen
            </Button>
          </form>
        )}
        {(booking.status === 'PENDING' || booking.status === 'CONFIRMED') && (
          <form action={cancelBookingAction}>
            <input type="hidden" name="bookingId" value={booking.id} />
            <Button type="submit" variant="outline" size="default">
              Stornieren
            </Button>
          </form>
        )}
        {booking.status === 'CONFIRMED' && endAtMs <= now && (
          <form action={completeBookingAction}>
            <input type="hidden" name="bookingId" value={booking.id} />
            <Button type="submit" variant="outline" size="default">
              Als abgeschlossen markieren
            </Button>
          </form>
        )}
        {booking.status === 'CONFIRMED' && startAtMs <= now && (
          <form action={noShowAction}>
            <input type="hidden" name="bookingId" value={booking.id} />
            <Button type="submit" variant="outline" size="default">
              Nicht erschienen
            </Button>
          </form>
        )}
      </div>
    </li>
  );
}

export default async function TutorBookingsPage({
  searchParams,
}: {
  searchParams: { saved?: string; actionError?: string };
}) {
  const session = await getSession();
  if (!session) redirect('/login');
  if (session.role !== UserRole.TUTOR) redirect('/dashboard');

  const bookings = await getMyBookingsAsTutor(session);
  const now = Date.now();

  const upcoming = bookings
    .filter((b) => new Date(b.startAt).getTime() > now)
    .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());
  const past = bookings
    .filter((b) => new Date(b.startAt).getTime() <= now)
    .sort((a, b) => new Date(b.startAt).getTime() - new Date(a.startAt).getTime());

  const students = new Map<string, string>();
  for (const booking of bookings) {
    students.set(booking.student.id, booking.student.profile?.displayName ?? 'Schüler:in');
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Buchungen</h1>
        <p className="text-sm text-muted-foreground">Anfragen und Termine deiner Schüler:innen.</p>
      </div>

      {searchParams.saved && <FormMessage type="success">Gespeichert.</FormMessage>}
      {searchParams.actionError && <FormMessage type="error">{searchParams.actionError}</FormMessage>}

      {bookings.length === 0 && <p className="text-sm text-muted-foreground">Noch keine Buchungen.</p>}

      {students.size > 0 && (
        <section className="rounded-lg border border-border p-4">
          <p className="text-xs uppercase text-muted-foreground">Meine Schüler:innen ({students.size})</p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {[...students.values()].map((name) => (
              <li key={name} className="rounded-full border border-border px-3 py-1 text-sm">
                {name}
              </li>
            ))}
          </ul>
        </section>
      )}

      {upcoming.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-medium uppercase text-muted-foreground">Kommende Termine</h2>
          <ul className="space-y-3">
            {upcoming.map((booking) => (
              <BookingCard key={booking.id} booking={booking} now={now} />
            ))}
          </ul>
        </section>
      )}

      {past.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-medium uppercase text-muted-foreground">Vergangene Termine</h2>
          <ul className="space-y-3">
            {past.map((booking) => (
              <BookingCard key={booking.id} booking={booking} now={now} />
            ))}
          </ul>
        </section>
      )}

      <p className="text-xs text-muted-foreground">
        <Link href="/tutor/reviews" className="underline">
          Bewertungen ansehen
        </Link>{' '}
        ·{' '}
        <Link href="/tutor/earnings" className="underline">
          Einnahmen ansehen
        </Link>
      </p>
    </div>
  );
}
