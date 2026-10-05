import type { Metadata } from 'next';
import Link from 'next/link';
import { CEFRLevel } from '@deutschflow/types';
import { getSession } from '@/lib/auth/session';
import { getMyVocabularySummary, getVocabularyList } from '@/lib/api/vocabulary';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export const metadata: Metadata = { title: 'Vokabeln – DeutschFlow' };

const PAGE_SIZE = 50;
const LEVELS = Object.values(CEFRLevel);

function isLevel(value: string | undefined): value is CEFRLevel {
  return !!value && (LEVELS as string[]).includes(value);
}

export default async function VocabularyPage({
  searchParams,
}: {
  searchParams: { level?: string; search?: string; page?: string };
}) {
  const session = await getSession();
  if (!session) return null;

  const level = isLevel(searchParams.level) ? searchParams.level : undefined;
  const search = searchParams.search?.trim().slice(0, 100) || undefined;
  const page = Math.max(1, Number.parseInt(searchParams.page ?? '1', 10) || 1);

  const [summary, list] = await Promise.all([
    getMyVocabularySummary(session),
    getVocabularyList(session, { level, search, skip: (page - 1) * PAGE_SIZE, take: PAGE_SIZE }),
  ]);

  const pageCount = Math.max(1, Math.ceil(list.total / PAGE_SIZE));
  const pageHref = (target: number) => {
    const params = new URLSearchParams();
    if (level) params.set('level', level);
    if (search) params.set('search', search);
    if (target > 1) params.set('page', String(target));
    const qs = params.toString();
    return `/vocabulary${qs ? `?${qs}` : ''}`;
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Vokabeln</h1>
        <p className="text-sm text-muted-foreground">
          Kurzes tägliches Training nach dem Karteikasten-Prinzip: Wörter, die du kannst, kommen seltener
          wieder — Wörter, die du vergisst, öfter.
        </p>
      </div>

      <section className="rounded-lg border border-primary/30 bg-primary/5 p-4">
        {summary ? (
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase text-muted-foreground">Heute</p>
              <p className="mt-1 text-lg font-semibold">
                {summary.dueCount} fällig
                {summary.newAvailable > 0 && (
                  <span className="text-base font-normal text-muted-foreground">
                    {' '}
                    · {summary.newAvailable} neue verfügbar
                  </span>
                )}
              </p>
              <p className="text-sm text-muted-foreground">
                {summary.learningCount} in Arbeit · {summary.masteredCount} gemeistert
              </p>
            </div>
            {summary.sessionSize > 0 ? (
              <Link href="/vocabulary/review">
                <Button>Jetzt üben ({summary.sessionSize})</Button>
              </Link>
            ) : (
              <p className="text-sm text-muted-foreground">Alles erledigt — schau morgen wieder vorbei.</p>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Trainingsstand gerade nicht verfügbar.</p>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Wortliste</h2>
        <form className="flex flex-wrap gap-2" action="/vocabulary">
          <label htmlFor="vocab-search" className="sr-only">
            Suchen
          </label>
          <Input
            id="vocab-search"
            name="search"
            defaultValue={search ?? ''}
            placeholder="Wort oder Übersetzung"
            className="min-w-0 flex-1"
          />
          <label htmlFor="vocab-level" className="sr-only">
            Level
          </label>
          <select
            id="vocab-level"
            name="level"
            defaultValue={level ?? ''}
            className="h-11 rounded-md border border-border bg-background px-3 text-sm"
          >
            <option value="">Alle Level</option>
            {LEVELS.map((code) => (
              <option key={code} value={code}>
                {code}
              </option>
            ))}
          </select>
          <Button type="submit" variant="outline">
            Filtern
          </Button>
        </form>

        {list.items.length === 0 ? (
          <p className="text-sm text-muted-foreground">Keine Vokabeln gefunden.</p>
        ) : (
          <ul className="divide-y divide-border rounded-lg border border-border">
            {list.items.map((item) => (
              <li key={item.id} className="flex flex-wrap items-baseline justify-between gap-2 p-3 text-sm">
                <span>
                  <span className="font-medium">{item.word}</span>
                  {item.partOfSpeech && <span className="text-muted-foreground"> · {item.partOfSpeech}</span>}
                </span>
                <span className="text-muted-foreground">
                  {item.translation} <span className="ml-2 text-xs">{item.level}</span>
                </span>
              </li>
            ))}
          </ul>
        )}

        {pageCount > 1 && (
          <nav className="flex items-center justify-between text-sm" aria-label="Seiten">
            {page > 1 ? (
              <Link href={pageHref(page - 1)} className="underline">
                Zurück
              </Link>
            ) : (
              <span />
            )}
            <span className="text-muted-foreground">
              Seite {page} von {pageCount}
            </span>
            {page < pageCount ? (
              <Link href={pageHref(page + 1)} className="underline">
                Weiter
              </Link>
            ) : (
              <span />
            )}
          </nav>
        )}
      </section>
    </div>
  );
}
