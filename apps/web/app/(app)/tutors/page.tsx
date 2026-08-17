import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { getTutors } from '@/lib/api/tutors';
import { SPECIALTY_LABELS, VERIFICATION_LABELS, formatPrice } from '@/lib/tutor-labels';
import type { CEFRLevel, TutorSpecialty } from '@deutschflow/types';

export const metadata: Metadata = { title: 'Tutoren finden – DeutschFlow' };

const LEVELS: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1'];
const SPECIALTIES = Object.keys(SPECIALTY_LABELS) as TutorSpecialty[];

interface TutorsPageProps {
  searchParams: {
    level?: string;
    language?: string;
    specialty?: string;
    maxPriceCents?: string;
    minRating?: string;
  };
}

export default async function TutorsPage({ searchParams }: TutorsPageProps) {
  const session = await getSession();
  if (!session) redirect('/login');

  const query = {
    level: LEVELS.includes(searchParams.level as CEFRLevel) ? (searchParams.level as CEFRLevel) : undefined,
    language: searchParams.language?.trim() || undefined,
    specialty: SPECIALTIES.includes(searchParams.specialty as TutorSpecialty)
      ? (searchParams.specialty as TutorSpecialty)
      : undefined,
    maxPriceCents: searchParams.maxPriceCents ? Number(searchParams.maxPriceCents) * 100 : undefined,
    minRating: searchParams.minRating ? Number(searchParams.minRating) : undefined,
  };

  const tutors = await getTutors(session, query);

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Tutoren finden</h1>
        <p className="text-sm text-muted-foreground">
          Echte Deutsch-Konversation, Prüfungsvorbereitung und mehr — von Menschen, nicht nur von KI.
        </p>
      </div>

      <form className="grid gap-3 rounded-lg border border-border p-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="space-y-1">
          <label htmlFor="level" className="text-xs uppercase text-muted-foreground">
            CEFR-Level
          </label>
          <select
            id="level"
            name="level"
            defaultValue={searchParams.level ?? ''}
            className="h-10 w-full rounded-md border border-border bg-background px-2 text-sm"
          >
            <option value="">Alle</option>
            {LEVELS.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label htmlFor="specialty" className="text-xs uppercase text-muted-foreground">
            Spezialgebiet
          </label>
          <select
            id="specialty"
            name="specialty"
            defaultValue={searchParams.specialty ?? ''}
            className="h-10 w-full rounded-md border border-border bg-background px-2 text-sm"
          >
            <option value="">Alle</option>
            {SPECIALTIES.map((specialty) => (
              <option key={specialty} value={specialty}>
                {SPECIALTY_LABELS[specialty]}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label htmlFor="language" className="text-xs uppercase text-muted-foreground">
            Sprache
          </label>
          <input
            id="language"
            name="language"
            defaultValue={searchParams.language ?? ''}
            placeholder="z. B. Englisch"
            className="h-10 w-full rounded-md border border-border bg-background px-2 text-sm"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="maxPriceCents" className="text-xs uppercase text-muted-foreground">
            Preis bis (€)
          </label>
          <input
            id="maxPriceCents"
            name="maxPriceCents"
            type="number"
            min={0}
            defaultValue={searchParams.maxPriceCents ?? ''}
            className="h-10 w-full rounded-md border border-border bg-background px-2 text-sm"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="minRating" className="text-xs uppercase text-muted-foreground">
            Mindestbewertung
          </label>
          <select
            id="minRating"
            name="minRating"
            defaultValue={searchParams.minRating ?? ''}
            className="h-10 w-full rounded-md border border-border bg-background px-2 text-sm"
          >
            <option value="">Alle</option>
            {[3, 4, 4.5].map((rating) => (
              <option key={rating} value={rating}>
                {rating}+ Sterne
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-end">
          <button
            type="submit"
            className="h-10 w-full rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground"
          >
            Filtern
          </button>
        </div>
      </form>

      <div className="space-y-4">
        {tutors.length === 0 && (
          <p className="text-sm text-muted-foreground">Keine Tutoren gefunden. Versuche andere Filter.</p>
        )}

        {tutors.map((tutor) => (
          <Link
            key={tutor.userId}
            href={`/tutors/${tutor.userId}`}
            className="block rounded-lg border border-border p-5 transition-colors hover:border-primary/40"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-1">
                <p className="text-lg font-semibold">{tutor.displayName ?? 'DeutschFlow-Tutor'}</p>
                {tutor.headline && <p className="text-sm text-muted-foreground">{tutor.headline}</p>}
              </div>
              {tutor.verificationStatus === 'VERIFIED' && (
                <span className="whitespace-nowrap rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-xs font-medium">
                  {VERIFICATION_LABELS.VERIFIED}
                </span>
              )}
            </div>

            <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
              {tutor.specialties.map((specialty) => (
                <span key={specialty} className="rounded-full border border-border px-2 py-0.5">
                  {SPECIALTY_LABELS[specialty]}
                </span>
              ))}
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
              <span>
                {tutor.averageRating !== null
                  ? `★ ${tutor.averageRating.toFixed(1)} (${tutor.reviewCount})`
                  : 'Noch keine Bewertungen'}
              </span>
              <span className="text-muted-foreground">{tutor.completedSessions} abgeschlossene Sessions</span>
              {tutor.offerings[0] && (
                <span className="font-medium">
                  ab {formatPrice(tutor.offerings[0].priceCents, tutor.offerings[0].currency)}
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
