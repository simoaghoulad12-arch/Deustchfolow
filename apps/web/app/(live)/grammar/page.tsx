import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getSession } from '@/lib/auth/session';
import { liveGet, type GrammarTopicSummary } from '@/lib/api/live';
import { Badge, EmptyState, ErrorState, PageHeader, ProgressBar } from '@/components/live/ui';

export const metadata = { title: 'Grammar · DeutschFlow' };

const STAGE_LABEL: Record<string, string> = { EXPLANATION: 'Started', EXAMPLES: 'Examples', GUIDED: 'Practising', AI_PRACTICE: 'AI practice', FREE: 'Free use', ASSESSMENT: 'Mastered' };

export default async function GrammarPage() {
  const session = await getSession();
  if (!session) redirect('/login');
  const topics = await liveGet<GrammarTopicSummary[]>(session, '/grammar');
  if (!topics) return <ErrorState retryHref="/grammar" />;
  if (topics.length === 0) return <EmptyState icon="🧩" title="No grammar topics yet" description="Grammar for this language is being prepared." />;
  const levels = [...new Set(topics.map((t) => t.cefrLevel))];

  return (
    <div>
      <PageHeader eyebrow="Grammar in context" title="Grammar" description="Explanation, examples, guided practice, then use it with the AI. Mistakes from your conversations show up here too." />
      <div className="space-y-8">
        {levels.map((level) => (
          <section key={level}>
            <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold">
              <Badge tone="indigo">{level}</Badge>
            </h2>
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {topics
                .filter((t) => t.cefrLevel === level)
                .map((t) => (
                  <li key={t.id}>
                    <Link href={`/grammar/${t.slug}`} className="block h-full rounded-2xl border border-border bg-white p-4 shadow-sm transition hover:border-indigo-200 hover:shadow-md">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold">{t.title}</h3>
                        {t.stage && <Badge tone={t.stage === 'ASSESSMENT' ? 'green' : 'amber'}>{STAGE_LABEL[t.stage] ?? t.stage}</Badge>}
                      </div>
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{t.summary}</p>
                      <div className="mt-3">
                        <ProgressBar value={t.mastery} tone={t.mastery >= 75 ? 'green' : 'indigo'} label={`${t.title} mastery`} />
                        <p className="mt-1 text-xs text-muted-foreground">{t.mastery}% mastery · {t.exerciseCount} exercises</p>
                      </div>
                    </Link>
                  </li>
                ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
