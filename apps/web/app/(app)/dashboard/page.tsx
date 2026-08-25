import type { Metadata } from 'next';
import Link from 'next/link';
import { PLAN_CATALOG, PLAN_DISPLAY_NAME, SubscriptionPlan } from '@deutschflow/types';
import { getSession } from '@/lib/auth/session';
import { getMyProgress } from '@/lib/api/learning';
import { getMySubscription } from '@/lib/api/subscription';
import { getMyAiUsage } from '@/lib/api/ai-usage';
import { getMyLiveLessonQuota } from '@/lib/api/live-lesson-quota';
import { getMyBookingsAsStudent } from '@/lib/api/bookings';
import { BookingTime } from '@/components/booking-time';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = { title: 'Dashboard – DeutschFlow' };

const UPCOMING_BOOKING_STATUSES = new Set(['PENDING', 'CONFIRMED']);

function formatMinutes(ms: number): string {
  const minutes = Math.round(ms / 60_000);
  if (minutes < 1) return '< 1 Minute';
  if (minutes < 60) return `${minutes} Minuten`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest > 0 ? `${hours} Std. ${rest} Min.` : `${hours} Std.`;
}

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) return null;

  const [progress, subscription, aiUsage, liveLessonQuota, bookings] = await Promise.all([
    getMyProgress(session),
    getMySubscription(session),
    getMyAiUsage(session),
    getMyLiveLessonQuota(session),
    getMyBookingsAsStudent(session),
  ]);

  const currentPlan = subscription?.plan ?? SubscriptionPlan.FREE;
  const completedCount = progress?.lessons.filter((l) => l.status === 'COMPLETED').length ?? 0;
  const inProgressCount = progress?.lessons.filter((l) => l.status === 'IN_PROGRESS').length ?? 0;

  const recentActivity = [...(progress?.lessons ?? [])]
    .filter((l) => l.lastAccessedAt)
    .sort((a, b) => new Date(b.lastAccessedAt!).getTime() - new Date(a.lastAccessedAt!).getTime())
    .slice(0, 3);

  const nextBooking = bookings
    .filter((b) => UPCOMING_BOOKING_STATUSES.has(b.status) && new Date(b.startAt).getTime() > Date.now())
    .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime())[0];

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Willkommen zurück, {session.email}.</p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-border p-4">
          <p className="text-xs uppercase text-muted-foreground">Aktuelles Level</p>
          <p className="mt-1 text-xl font-semibold">{progress?.currentLevel ?? '—'}</p>
        </div>
        <div className="rounded-lg border border-border p-4">
          <p className="text-xs uppercase text-muted-foreground">Ziel-Level</p>
          <p className="mt-1 text-xl font-semibold">{progress?.targetLevel ?? '—'}</p>
        </div>
        <div className="rounded-lg border border-border p-4">
          <p className="text-xs uppercase text-muted-foreground">Fortschritt</p>
          <p className="mt-1 text-xl font-semibold">
            {completedCount} abgeschlossen
            {inProgressCount > 0 && (
              <span className="text-base font-normal text-muted-foreground"> · {inProgressCount} offen</span>
            )}
          </p>
        </div>
        <div className="rounded-lg border border-border p-4">
          <p className="text-xs uppercase text-muted-foreground">Lernzeit</p>
          <p className="mt-1 text-xl font-semibold">{formatMinutes(progress?.totalTimeSpentMs ?? 0)}</p>
        </div>
      </section>

      <section className="rounded-lg border border-border p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-xs uppercase text-muted-foreground">Plan</p>
            <p className="mt-1 text-lg font-semibold">{PLAN_DISPLAY_NAME[currentPlan]}</p>
          </div>
          <Link href="/settings/billing">
            <Button type="button" variant="outline" size="default">
              {currentPlan === SubscriptionPlan.FREE ? 'Upgraden' : 'Plan verwalten'}
            </Button>
          </Link>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs uppercase text-muted-foreground">KI-Nutzung heute</p>
            {aiUsage ? (
              <p className="mt-1 text-sm">
                Tutor: {aiUsage.usedToday.tutor} / {aiUsage.limits.tutorMessagesPerDay}
                <br />
                Schreibkorrektur: {aiUsage.usedToday.writing_correction} / {aiUsage.limits.writingCorrectionsPerDay}
              </p>
            ) : (
              <p className="mt-1 text-sm text-muted-foreground">Nicht verfügbar.</p>
            )}
          </div>

          <div>
            <p className="text-xs uppercase text-muted-foreground">Live-Unterrichtskontingent (diese Woche)</p>
            {PLAN_CATALOG[currentPlan].hasLiveLessonQuota ? (
              liveLessonQuota ? (
                <p className="mt-1 text-sm">
                  {liveLessonQuota.remainingMinutes} von {liveLessonQuota.totalMinutes} Min. übrig
                </p>
              ) : (
                <p className="mt-1 text-sm text-muted-foreground">Nicht verfügbar.</p>
              )
            ) : (
              <p className="mt-1 text-sm text-muted-foreground">
                Nicht im {PLAN_DISPLAY_NAME[currentPlan]}-Plan enthalten.
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-border p-4">
        <p className="text-xs uppercase text-muted-foreground">Nächste Buchung</p>
        {nextBooking ? (
          <>
            <p className="mt-1 font-medium">
              {nextBooking.tutor.user.profile?.displayName ?? 'DeutschFlow-Tutor'} — {nextBooking.offering.title}
            </p>
            <p className="text-sm text-muted-foreground">
              <BookingTime startAt={nextBooking.startAt} endAt={nextBooking.endAt} />
            </p>
            {nextBooking.status === 'PENDING' && (
              <Link href={`/bookings/${nextBooking.id}/pay`} className="mt-2 inline-block">
                <Button variant="outline">Zahlung abschließen</Button>
              </Link>
            )}
          </>
        ) : (
          <p className="mt-1 text-sm text-muted-foreground">
            Keine anstehende Buchung.{' '}
            <Link href="/tutors" className="underline">
              Tutor finden
            </Link>
          </p>
        )}
      </section>

      {recentActivity.length > 0 && (
        <section className="rounded-lg border border-border p-4">
          <p className="text-xs uppercase text-muted-foreground">Letzte Lernaktivitäten</p>
          <ul className="mt-2 space-y-2">
            {recentActivity.map((entry) => (
              <li key={entry.lesson.id} className="flex items-center justify-between gap-2 text-sm">
                <span>
                  {entry.lesson.title}{' '}
                  <span className="text-muted-foreground">— {entry.lesson.module.course.title}</span>
                </span>
                <span className="whitespace-nowrap text-xs text-muted-foreground">
                  {entry.status === 'COMPLETED' ? 'Abgeschlossen' : 'In Bearbeitung'}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {progress?.recommendedNextLesson && (
        <section className="rounded-lg border border-primary/30 bg-primary/5 p-4">
          <p className="text-xs uppercase text-muted-foreground">Empfohlen als Nächstes</p>
          <p className="mt-1 font-medium">{progress.recommendedNextLesson.title}</p>
          <p className="text-sm text-muted-foreground">
            {progress.recommendedNextLesson.estimatedMinutes} Minuten
          </p>
          <Link
            href={`/learn/${progress.recommendedNextLesson.module.course.slug}/${progress.recommendedNextLesson.slug}`}
            className="mt-3 inline-block"
          >
            <Button>Jetzt lernen</Button>
          </Link>
        </section>
      )}

      {!progress?.lastLesson && !progress?.recommendedNextLesson && (
        <section className="rounded-lg border border-border p-4">
          <p className="text-sm text-muted-foreground">
            Noch keine Lerninhalte verfügbar.{' '}
            <Link href="/learn" className="underline">
              Zur Kursübersicht
            </Link>
          </p>
        </section>
      )}
    </div>
  );
}
