import { redirect } from 'next/navigation';
import { MISTAKE_CATEGORY_LABELS, type MistakeCategory } from '@deutschflow/types';
import { getSession } from '@/lib/auth/session';
import { liveGet } from '@/lib/api/live';
import { Card, ErrorState, PageHeader, ScoreBar } from '@/components/live/ui';
import { BarChart } from '@/components/live/bar-chart';

export const metadata = { title: 'Analytics · Admin' };

type Series = { day: string; value: number }[];
type Analytics = {
  signups: Series;
  activeLearners: Series;
  missionsCompleted: Series;
  aiRequests: Series;
  mistakesByCategory: { category: MistakeCategory; count: number }[];
  averageDna: { dimension: string; score: number }[];
  learnersByLanguage: { languageCode: string; count: number }[];
};

export default async function AnalyticsPage() {
  const session = await getSession();
  if (!session) redirect('/login');
  const a = await liveGet<Analytics>(session, '/admin/analytics');
  if (!a) return <ErrorState retryHref="/admin/analytics" />;
  const topMistakes = a.mistakesByCategory.slice(0, 6);
  const maxMistakes = Math.max(1, ...topMistakes.map((m) => m.count));
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Last 14 days" title="Analytics" description="Who is learning, what they practise and where they struggle." />
      <div className="grid gap-4 md:grid-cols-2">
        <Card><BarChart data={a.signups} label="New sign-ups" /></Card>
        <Card><BarChart data={a.activeLearners} label="Active learners" /></Card>
        <Card><BarChart data={a.missionsCompleted} label="Missions completed" /></Card>
        <Card><BarChart data={a.aiRequests} label="AI requests (real provider)" /></Card>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <h2 className="mb-3 font-semibold">Most common mistakes</h2>
          {topMistakes.length === 0 ? (
            <p className="text-sm text-muted-foreground">No mistakes recorded yet.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {topMistakes.map((m) => (
                <li key={m.category}>
                  <div className="flex justify-between gap-2">
                    <span>{MISTAKE_CATEGORY_LABELS[m.category] ?? m.category}</span>
                    <span className="tabular-nums text-muted-foreground">{m.count}</span>
                  </div>
                  <div className="mt-1 h-1.5 rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-amber-500" style={{ width: `${(m.count / maxMistakes) * 100}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
        <Card>
          <h2 className="mb-3 font-semibold">Average Language DNA</h2>
          {a.averageDna.length === 0 ? (
            <p className="text-sm text-muted-foreground">No skill data yet.</p>
          ) : (
            <div className="space-y-2">
              {a.averageDna.map((d) => (
                <ScoreBar key={d.dimension} label={d.dimension.replace(/_/g, ' ').toLowerCase()} value={d.score} />
              ))}
            </div>
          )}
        </Card>
        <Card>
          <h2 className="mb-3 font-semibold">Learners by language</h2>
          <ul className="space-y-1 text-sm">
            {a.learnersByLanguage.map((l) => (
              <li key={l.languageCode} className="flex justify-between">
                <span className="uppercase">{l.languageCode}</span>
                <span className="tabular-nums text-muted-foreground">{l.count}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
