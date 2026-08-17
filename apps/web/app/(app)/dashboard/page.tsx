import type { Metadata } from 'next';
import Link from 'next/link';
import { getSession } from '@/lib/auth/session';
import { getMyProgress } from '@/lib/api/learning';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = { title: 'Dashboard – DeutschFlow' };

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

  const progress = await getMyProgress(session);

  const completedCount = progress?.lessons.filter((l) => l.status === 'COMPLETED').length ?? 0;
  const inProgressCount = progress?.lessons.filter((l) => l.status === 'IN_PROGRESS').length ?? 0;

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

      {progress?.lastLesson && (
        <section className="rounded-lg border border-border p-4">
          <p className="text-xs uppercase text-muted-foreground">Zuletzt gelernt</p>
          <p className="mt-1 font-medium">{progress.lastLesson.lesson.title}</p>
          <p className="text-sm text-muted-foreground">
            {progress.lastLesson.lesson.module.course.title}
          </p>
          <Link
            href={`/learn/${progress.lastLesson.lesson.module.course.slug}/${progress.lastLesson.lesson.slug}`}
            className="mt-3 inline-block"
          >
            <Button variant="outline">Weiterlernen</Button>
          </Link>
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
