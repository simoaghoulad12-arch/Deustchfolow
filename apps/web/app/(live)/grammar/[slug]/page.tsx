import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { getSession } from '@/lib/auth/session';
import { liveGet, type GrammarTopicDetail, type Me } from '@/lib/api/live';
import { Badge, Card, ProgressBar } from '@/components/live/ui';
import { GrammarPractice } from './grammar-practice';

export default async function GrammarTopicPage({ params }: { params: { slug: string } }) {
  const session = await getSession();
  if (!session) redirect('/login');
  const [topic, me] = await Promise.all([liveGet<GrammarTopicDetail>(session, `/grammar/${encodeURIComponent(params.slug)}`), liveGet<Me>(session, '/me')]);
  if (!topic) notFound();
  const lang = me?.targetLanguage?.code ?? 'de';

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link href="/grammar" className="text-sm font-medium text-indigo-600 hover:underline">
        ← All topics
      </Link>
      <header>
        <Badge tone="indigo">{topic.cefrLevel}</Badge>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">{topic.title}</h1>
        <p className="mt-1 text-muted-foreground">{topic.summary}</p>
        {topic.progress && (
          <div className="mt-3 max-w-xs">
            <ProgressBar value={topic.progress.mastery} label="Mastery" />
            <p className="mt-1 text-xs text-muted-foreground">{topic.progress.mastery}% mastery</p>
          </div>
        )}
      </header>
      <Card>
        <h2 className="mb-2 font-semibold">1 · Explanation</h2>
        <p className="whitespace-pre-line text-slate-700">{topic.explanation}</p>
      </Card>
      <Card>
        <h2 className="mb-3 font-semibold">2 · Examples</h2>
        <ul className="space-y-3">
          {topic.examples.map((e) => (
            <li key={e.target} className="rounded-xl bg-slate-50 p-3">
              <p className="font-medium" lang={lang}>
                {e.target}
              </p>
              <p className="text-sm text-muted-foreground">{e.translation}</p>
              {e.note && <p className="mt-1 text-xs text-indigo-700">{e.note}</p>}
            </li>
          ))}
        </ul>
      </Card>
      <GrammarPractice topic={topic} languageCode={lang} />
    </div>
  );
}
