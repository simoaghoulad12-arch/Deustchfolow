import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { getTutorProfile } from '@/lib/api/tutors';
import { getFreeSlots } from '@/lib/api/tutor-availability';
import { SPECIALTY_LABELS, formatPrice } from '@/lib/tutor-labels';
import { SlotPickerForm } from './slot-picker-form';

export const metadata: Metadata = { title: 'Termin buchen – DeutschFlow' };

interface BookPageProps {
  params: { id: string };
  searchParams: { offeringId?: string; bookingError?: string };
}

export default async function BookTutorPage({ params, searchParams }: BookPageProps) {
  const session = await getSession();
  if (!session) redirect('/login');

  const tutor = await getTutorProfile(session, params.id);
  if (!tutor) notFound();

  const offering = tutor.offerings.find((o) => o.id === searchParams.offeringId);
  if (!offering) notFound();

  const now = new Date();
  const in14Days = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
  const slots = await getFreeSlots(session, params.id, {
    from: now.toISOString(),
    to: in14Days.toISOString(),
    durationMinutes: offering.durationMinutes,
  });

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Termin buchen</h1>
        <p className="text-sm text-muted-foreground">bei {tutor.displayName ?? 'DeutschFlow-Tutor'}</p>
      </div>

      <div className="rounded-lg border border-border p-4">
        <p className="font-medium">{offering.title}</p>
        <p className="text-xs text-muted-foreground">
          {offering.durationMinutes} Min. · {SPECIALTY_LABELS[offering.category]}
        </p>
        <p className="mt-1 font-medium">{formatPrice(offering.priceCents, offering.currency)}</p>
        <p className="mt-2 text-xs text-muted-foreground">
          Im nächsten Schritt bezahlst du sicher über Stripe — oder, falls dein Plan ein wöchentliches
          Live-Unterrichtskontingent enthält und es noch ausreicht, wird die Buchung direkt ohne Zahlung
          bestätigt.
        </p>
      </div>

      <SlotPickerForm
        tutorId={params.id}
        offeringId={offering.id}
        slots={slots}
        errorMessage={searchParams.bookingError}
      />
    </div>
  );
}
