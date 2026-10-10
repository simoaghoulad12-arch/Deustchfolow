import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { liveGet, type Me, type VocabularyCard, type VocabularyOverview } from '@/lib/api/live';
import { Badge, Card, ErrorState, PageHeader, Stat } from '@/components/live/ui';
import { ReviewSession } from './review-session';
import { IntroduceButton, AddWordButton } from './vocab-buttons';

export const metadata = { title: 'Vocabulary · DeutschFlow' };

export default async function VocabularyPage({ searchParams }: { searchParams: { q?: string; level?: string; category?: string; page?: string } }) {
  const session = await getSession();
  if (!session) redirect('/login');
  const params = new URLSearchParams();
  if (searchParams.q) params.set('q', searchParams.q.slice(0, 80));
  if (searchParams.level && /^(A1|A2|B1|B2)$/.test(searchParams.level)) params.set('level', searchParams.level);
  if (searchParams.category) params.set('category', searchParams.category.slice(0, 60));
  if (searchParams.page && /^\d+$/.test(searchParams.page)) params.set('page', searchParams.page);
  const [overview, due, browse, me] = await Promise.all([
    liveGet<VocabularyOverview>(session, '/vocabulary'),
    liveGet<VocabularyCard[]>(session, '/vocabulary/due'),
    liveGet<{ total: number; page: number; pageSize: number; items: VocabularyCard[] }>(session, `/vocabulary/browse?${params.toString()}`),
    liveGet<Me>(session, '/me'),
  ]);
  if (!overview || !due) return <ErrorState retryHref="/words" />;
  const lang = me?.targetLanguage?.code ?? overview.languageCode;
  const page = browse?.page ?? 1;
  const pages = browse ? Math.max(1, Math.ceil(browse.total / browse.pageSize)) : 1;
  const link = (p: number) => {
    const q = new URLSearchParams(params);
    q.set('page', String(p));
    return `/words?${q.toString()}#browse`;
  };

  return (
    <div className="space-y-8">
      <PageHeader eyebrow="Spaced repetition" title="Your words" description="Words from your missions land here automatically. Review them just before you would forget them." action={<IntroduceButton />} />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat icon="📥" label="Due now" value={overview.due} />
        <Stat icon="📚" label="In your deck" value={overview.total} />
        <Stat icon="🏆" label="Mastered" value={overview.mastered} />
        <Stat icon="🔁" label="Reviewed today" value={overview.reviewedToday} />
      </div>

      <ReviewSession cards={due} languageCode={lang} />

      <section id="browse">
        <h2 className="mb-3 text-lg font-semibold">Browse all words</h2>
        <form className="mb-4 flex flex-col gap-2 sm:flex-row" action="/words">
          <input name="q" defaultValue={searchParams.q} placeholder="Search a word or translation" aria-label="Search" className="h-11 flex-1 rounded-xl border border-border bg-white px-3" />
          <select name="level" defaultValue={searchParams.level ?? ''} aria-label="Level" className="h-11 rounded-xl border border-border bg-white px-3">
            <option value="">All levels</option>
            {['A1', 'A2', 'B1', 'B2'].map((l) => (
              <option key={l}>{l}</option>
            ))}
          </select>
          <select name="category" defaultValue={searchParams.category ?? ''} aria-label="Category" className="h-11 rounded-xl border border-border bg-white px-3">
            <option value="">All topics</option>
            {overview.categories.map((c) => (
              <option key={c.name} value={c.name}>
                {c.name} ({c.count})
              </option>
            ))}
          </select>
          <button className="h-11 rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white">Filter</button>
        </form>
        {!browse || browse.items.length === 0 ? (
          <Card>
            <p className="text-sm text-muted-foreground">No words match your filters.</p>
          </Card>
        ) : (
          <>
            <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {browse.items.map((w) => (
                <li key={w.id} className="flex items-start justify-between gap-3 rounded-xl border border-border bg-white p-3">
                  <div className="min-w-0">
                    <p className="font-semibold" lang={lang}>
                      {w.word}
                    </p>
                    <p className="text-sm text-muted-foreground">{w.translation}</p>
                    <div className="mt-1 flex gap-1">
                      <Badge tone="indigo">{w.level}</Badge>
                      {w.category && <Badge>{w.category}</Badge>}
                    </div>
                  </div>
                  {w.inDeck ? <Badge tone="green">{w.status === 'MASTERED' ? 'Mastered' : 'In deck'}</Badge> : <AddWordButton id={w.id} />}
                </li>
              ))}
            </ul>
            {pages > 1 && (
              <nav className="mt-4 flex items-center justify-center gap-3 text-sm" aria-label="Pagination">
                {page > 1 && <a href={link(page - 1)} className="rounded-lg border border-border bg-white px-3 py-1.5">← Previous</a>}
                <span>
                  Page {page} of {pages}
                </span>
                {page < pages && <a href={link(page + 1)} className="rounded-lg border border-border bg-white px-3 py-1.5">Next →</a>}
              </nav>
            )}
          </>
        )}
      </section>
    </div>
  );
}
