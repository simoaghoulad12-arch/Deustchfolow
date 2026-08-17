import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { getTutorProfile } from '@/lib/api/tutors';
import { getFreeSlots } from '@/lib/api/tutor-availability';
import { SPECIALTY_LABELS, VERIFICATION_LABELS, formatPrice } from '@/lib/tutor-labels';
import { Button } from '@/components/ui/button';
import { FreeSlotsList } from './free-slots-list';

interface TutorProfilePageProps {
  params: { id: string };
}

export async function generateMetadata({ params }: TutorProfilePageProps): Promise<Metadata> {
  const session = await getSession();
  if (!session) return { title: 'Tutor – DeutschFlow' };
  const tutor = await getTutorProfile(session, params.id);
  return { title: tutor ? `${tutor.displayName ?? 'Tutor'} – DeutschFlow` : 'Tutor – DeutschFlow' };
}

export default async function TutorProfilePage({ params }: TutorProfilePageProps) {
  const session = await getSession();
  if (!session) redirect('/login');

  const tutor = await getTutorProfile(session, params.id);
  if (!tutor) notFound();

  const now = new Date();
  const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const freeSlots = await getFreeSlots(session, params.id, {
    from: now.toISOString(),
    to: in7Days.toISOString(),
    durationMinutes: 30,
  });

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div className="space-y-3 rounded-lg border border-border p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold">{tutor.displayName ?? 'DeutschFlow-Tutor'}</h1>
            {tutor.headline && <p className="text-muted-foreground">{tutor.headline}</p>}
          </div>
          <span
            className={`whitespace-nowrap rounded-full border px-3 py-1 text-xs font-medium ${
              tutor.verificationStatus === 'VERIFIED'
                ? 'border-primary/30 bg-primary/5'
                : 'border-border text-muted-foreground'
            }`}
          >
            {VERIFICATION_LABELS[tutor.verificationStatus]}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-sm">
          <span>
            {tutor.averageRating !== null
              ? `★ ${tutor.averageRating.toFixed(1)} (${tutor.reviewCount} Bewertungen)`
              : 'Noch keine Bewertungen'}
          </span>
          <span className="text-muted-foreground">{tutor.completedSessions} abgeschlossene Sessions</span>
        </div>
      </div>

      {tutor.aboutMe && (
        <section className="space-y-2">
          <h2 className="text-sm font-medium uppercase text-muted-foreground">Über mich</h2>
          <p className="whitespace-pre-wrap text-sm">{tutor.aboutMe}</p>
        </section>
      )}

      <section className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-border p-4">
          <p className="text-xs uppercase text-muted-foreground">Sprachen</p>
          <p className="mt-1 text-sm">
            {tutor.languages.length > 0 ? tutor.languages.join(', ') : '—'}
          </p>
        </div>
        <div className="rounded-lg border border-border p-4">
          <p className="text-xs uppercase text-muted-foreground">CEFR-Levels</p>
          <p className="mt-1 text-sm">
            {tutor.teachingLevels.length > 0 ? tutor.teachingLevels.join(', ') : '—'}
          </p>
        </div>
        <div className="rounded-lg border border-border p-4">
          <p className="text-xs uppercase text-muted-foreground">Spezialgebiete</p>
          <p className="mt-1 text-sm">
            {tutor.specialties.length > 0
              ? tutor.specialties.map((s) => SPECIALTY_LABELS[s]).join(', ')
              : '—'}
          </p>
        </div>
        <div className="rounded-lg border border-border p-4">
          <p className="text-xs uppercase text-muted-foreground">Unterrichtserfahrung</p>
          <p className="mt-1 text-sm">
            {tutor.yearsExperience !== null ? `${tutor.yearsExperience} Jahre` : '—'}
          </p>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-medium uppercase text-muted-foreground">Nächste freie Termine</h2>
        <FreeSlotsList slots={freeSlots} />
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-medium uppercase text-muted-foreground">Angebote</h2>
        {tutor.offerings.length === 0 && (
          <p className="text-sm text-muted-foreground">Dieser Tutor hat noch keine Angebote veröffentlicht.</p>
        )}
        {tutor.offerings.map((offering) => (
          <div
            key={offering.id}
            className="flex items-center justify-between gap-4 rounded-lg border border-border p-4"
          >
            <div>
              <p className="font-medium">{offering.title}</p>
              <p className="text-xs text-muted-foreground">
                {offering.durationMinutes} Min. · {SPECIALTY_LABELS[offering.category]}
                {offering.cefrLevels.length > 0 ? ` · ${offering.cefrLevels.join(', ')}` : ''}
              </p>
              {offering.description && (
                <p className="mt-1 text-sm text-muted-foreground">{offering.description}</p>
              )}
            </div>
            <div className="flex flex-col items-end gap-2">
              <span className="font-medium">{formatPrice(offering.priceCents, offering.currency)}</span>
              <Link href={`/tutors/${tutor.userId}/book?offeringId=${offering.id}`}>
                <Button size="default">Termin buchen</Button>
              </Link>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
