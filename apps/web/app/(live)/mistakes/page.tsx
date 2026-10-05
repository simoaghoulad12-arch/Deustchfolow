import { redirect } from 'next/navigation';
import { MISTAKE_CATEGORY_LABELS } from '@deutschflow/types';
import { getSession } from '@/lib/auth/session';
import { liveGet, type Me, type Mistake } from '@/lib/api/live';
import { EmptyState, ErrorState, PageHeader, Stat } from '@/components/live/ui';
import { MistakeDrill } from './mistake-drill';

export const metadata = { title: 'My mistakes · DeutschFlow' };

export default async function MistakesPage({ searchParams }: { searchParams: { state?: string } }) {
  const session = await getSession();
  if (!session) redirect('/login');
  const state = ['NEW', 'PRACTICING', 'MASTERED'].includes(searchParams.state ?? '') ? searchParams.state : undefined;
  const [data, me] = await Promise.all([
    liveGet<{ items: Mistake[]; summary: { category: keyof typeof MISTAKE_CATEGORY_LABELS; distinct: number; occurrences: number }[] }>(session, `/mistakes${state ? `?state=${state}` : ''}`),
    liveGet<Me>(session, '/me'),
  ]);
  if (!data) return <ErrorState retryHref="/mistakes" />;
  const open = data.items.filter((m) => m.masteryState !== 'MASTERED');
  const mastered = data.items.filter((m) => m.masteryState === 'MASTERED');

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Error memory" title="My mistakes" description="Every mistake the AI noticed, grouped and remembered. Type the natural version three times in a row and it’s mastered." />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat icon="🎯" label="To practise" value={open.length} />
        <Stat icon="🏆" label="Mastered" value={mastered.length} />
        {data.summary.slice(0, 2).map((s) => (
          <Stat key={s.category} icon="📌" label={MISTAKE_CATEGORY_LABELS[s.category]} value={`${s.occurrences}×`} hint={`${s.distinct} patterns`} />
        ))}
      </div>
      <nav className="flex gap-2 text-sm" aria-label="Filter">
        {[
          { v: undefined, l: 'All' },
          { v: 'NEW', l: 'New' },
          { v: 'PRACTICING', l: 'Practising' },
          { v: 'MASTERED', l: 'Mastered' },
        ].map((f) => (
          <a key={f.l} href={f.v ? `/mistakes?state=${f.v}` : '/mistakes'} aria-current={state === f.v ? 'page' : undefined} className={`rounded-full px-3 py-1.5 ${state === f.v ? 'bg-slate-900 text-white' : 'border border-border bg-white'}`}>
            {f.l}
          </a>
        ))}
      </nav>
      {data.items.length === 0 ? (
        <EmptyState icon="🌱" title="No mistakes yet" description="Play a mission or write a journal entry. The AI will collect your mistakes here so you can fix them for good." />
      ) : (
        <MistakeDrill mistakes={data.items} languageCode={me?.targetLanguage?.code ?? 'de'} />
      )}
    </div>
  );
}
