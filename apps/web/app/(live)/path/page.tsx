import Link from 'next/link';
import { redirect } from 'next/navigation';
import { cn } from '@deutschflow/ui';
import { getSession } from '@/lib/auth/session';
import { liveGet, type PathOverview } from '@/lib/api/live';
import { Badge, ButtonLink, Card, EmptyState, ErrorState, PageHeader, ProgressBar } from '@/components/live/ui';

export const metadata = { title: 'Learning path · DeutschFlow' };

const SKILL_ICON: Record<string, string> = { VOCABULARY: '📚', GRAMMAR: '🧩', READING: '📖', LISTENING: '🎧', SPEAKING: '🎙️', WRITING: '✍️' };

export default async function PathPage() {
  const session = await getSession();
  if (!session) redirect('/login');
  const path = await liveGet<PathOverview>(session, '/path');
  if (!path) return <ErrorState retryHref="/path" />;
  const available = path.levels.filter((l) => l.available);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="CEFR curriculum"
        title="Your A1–B2 path"
        description="Ten modules per level. Each lesson combines vocabulary, grammar, reading, listening, speaking and writing, then sends you into the world to use it."
        action={path.nextLesson ? <ButtonLink href={`/path/${path.nextLesson}`}>Continue →</ButtonLink> : undefined}
      />
      {available.length === 0 ? (
        <EmptyState icon="🧭" title="No curriculum yet" description="The structured course for this language is being prepared. Missions, grammar and practice modes are already available." />
      ) : (
        path.levels.map((level) => (
          <section key={level.level} aria-labelledby={`level-${level.level}`}>
            <div className="mb-3 flex flex-wrap items-center gap-3">
              <h2 id={`level-${level.level}`} className="text-lg font-semibold">
                {level.level} <span className="font-normal text-muted-foreground">· {level.name}</span>
              </h2>
              {level.level === path.currentLevel && <Badge tone="indigo">Your level</Badge>}
              {level.available && level.total > 0 && level.completed === level.total && <Badge tone="green">Completed</Badge>}
              {level.available && (
                <span className="ml-auto text-xs tabular-nums text-muted-foreground">
                  {level.completed} / {level.total} lessons
                </span>
              )}
            </div>
            {!level.available ? (
              <p className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">Coming soon for this language.</p>
            ) : (
              <>
                <ProgressBar value={level.total ? (level.completed / level.total) * 100 : 0} tone="green" label={`${level.level} progress`} className="mb-4" />
                <div className="grid gap-3 md:grid-cols-2">
                  {level.modules.map((m, i) => {
                    const done = m.lessons.filter((l) => l.completed).length;
                    return (
                      <Card key={m.id} as="article" className="min-w-0">
                        <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">Module {i + 1}</p>
                        <h3 className="font-semibold">{m.title}</h3>
                        {m.description && <p className="mt-1 text-sm text-muted-foreground">{m.description}</p>}
                        <ol className="mt-3 space-y-1">
                          {m.lessons.map((l) => (
                            <li key={l.slug}>
                              <Link href={`/path/${l.slug}`} className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-slate-50">
                                <span aria-hidden>{SKILL_ICON[l.skill] ?? '•'}</span>
                                <span className={cn('min-w-0 flex-1 truncate', l.completed && 'text-muted-foreground')}>{l.title}</span>
                                <span className="shrink-0 text-xs text-muted-foreground">{l.completed ? <span className="text-emerald-600">✓ done</span> : `${l.estimatedMinutes} min`}</span>
                              </Link>
                            </li>
                          ))}
                        </ol>
                        <p className="mt-2 text-xs text-muted-foreground">
                          {done} / {m.lessons.length} lessons
                        </p>
                      </Card>
                    );
                  })}
                </div>
              </>
            )}
          </section>
        ))
      )}
    </div>
  );
}
