import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { liveGet, type JournalEntry, type JournalGrowth, type Me } from '@/lib/api/live';
import { Card, ErrorState, PageHeader, Stat } from '@/components/live/ui';
import { JournalComposer } from './journal-composer';

export const metadata = { title: 'Journal · DeutschFlow' };

export default async function JournalPage() {
  const session = await getSession();
  if (!session) redirect('/login');
  const [data, me] = await Promise.all([liveGet<{ entries: JournalEntry[]; growth: JournalGrowth | null }>(session, '/journal'), liveGet<Me>(session, '/me')]);
  if (!data) return <ErrorState retryHref="/journal" />;
  const lang = me?.targetLanguage?.code ?? 'de';
  const g = data.growth;

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="AI journal" title="Your journal" description="Write a few sentences about your day. The AI corrects them, explains why and shows a natural version — and you can watch yourself improve." />
      {g && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat icon="📓" label="Entries" value={g.entries} />
          <Stat icon="🎯" label="Score" value={`${g.scoreBefore} → ${g.scoreNow}`} hint="first vs. recent entries" />
          <Stat icon="✍️" label="Words per entry" value={`${g.wordsBefore} → ${g.wordsNow}`} />
          <Stat icon="🩹" label="Mistakes / 100 words" value={`${g.mistakesPer100Before} → ${g.mistakesPer100Now}`} />
        </div>
      )}
      <JournalComposer languageCode={lang} />
      <section>
        <h2 className="mb-3 text-lg font-semibold">Previous entries</h2>
        {data.entries.length === 0 ? (
          <p className="text-sm text-muted-foreground">Your entries will appear here.</p>
        ) : (
          <ul className="space-y-3">
            {data.entries.map((e) => (
              <li key={e.id}>
                <Card>
                  <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
                    <time dateTime={e.createdAt}>{new Date(e.createdAt).toLocaleDateString('en', { weekday: 'long', day: 'numeric', month: 'long' })}</time>
                    <span>
                      {e.wordCount} words{e.score != null ? ` · score ${e.score}` : ''}
                    </span>
                  </div>
                  <p lang={lang}>{e.text}</p>
                  {e.correctedText && e.correctedText !== e.text && (
                    <p className="mt-2 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-900" lang={lang}>
                      ✨ {e.correctedText}
                    </p>
                  )}
                  {e.analysis?.feedback && <p className="mt-2 text-sm text-muted-foreground">{e.analysis.feedback}</p>}
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
