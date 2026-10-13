import { notFound, redirect } from 'next/navigation';
import { UserRole } from '@deutschflow/types';
import { getSession } from '@/lib/auth/session';
import { liveGet } from '@/lib/api/live';
import { Badge, Card, ErrorState, PageHeader } from '@/components/live/ui';
import { AiSwitch } from './ai-switch';

export const metadata = { title: 'AI settings · Admin' };

type AiStatus = {
  configured: boolean;
  enabled: boolean;
  mode: 'real' | 'offline';
  model: string | null;
  limits: Record<string, { tutorMessagesPerDay: number; writingCorrectionsPerDay: number; immersionTurnsPerDay: number; maxInputChars: number }>;
  requests24h: { feature: string; count: number }[];
};

export default async function AiSettingsPage() {
  const session = await getSession();
  if (!session) redirect('/login');
  if (session.role !== UserRole.ADMIN) notFound();
  const s = await liveGet<AiStatus>(session, '/admin/ai');
  if (!s) return <ErrorState retryHref="/admin/ai" />;
  return (
    <div className="space-y-6">
      <PageHeader title="AI settings" description="Which AI answers your learners, and how much they may use it. API keys live only in the server environment and are never shown here." />
      <Card>
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="font-semibold">Provider</h2>
          {s.mode === 'real' ? <Badge tone="green">Real AI active{s.model ? ` · ${s.model}` : ''}</Badge> : <Badge tone="amber">Offline coach</Badge>}
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          {s.configured
            ? 'An API key is configured on the server. You can switch to the offline coach at any time, for example to cap costs.'
            : 'No API key is configured, so every conversation uses the built-in offline coach. Set ANTHROPIC_API_KEY in the API service to enable real AI.'}
        </p>
        {s.configured && <AiSwitch enabled={s.enabled} />}
      </Card>
      <Card>
        <h2 className="mb-3 font-semibold">Daily limits per plan</h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[420px] text-left text-sm">
            <thead className="text-xs text-muted-foreground">
              <tr>
                <th className="py-1 pr-3 font-medium">Plan</th>
                <th className="py-1 pr-3 font-medium">Immersion turns</th>
                <th className="py-1 pr-3 font-medium">Tutor messages</th>
                <th className="py-1 pr-3 font-medium">Writing corrections</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(s.limits).map(([plan, l]) => (
                <tr key={plan} className="border-t border-border">
                  <td className="py-2 pr-3 font-medium">{plan}</td>
                  <td className="py-2 pr-3 tabular-nums">{l.immersionTurnsPerDay}</td>
                  <td className="py-2 pr-3 tabular-nums">{l.tutorMessagesPerDay}</td>
                  <td className="py-2 pr-3 tabular-nums">{l.writingCorrectionsPerDay}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <Card>
        <h2 className="mb-3 font-semibold">Real-AI requests in the last 24 hours</h2>
        {s.requests24h.length === 0 ? (
          <p className="text-sm text-muted-foreground">None yet.</p>
        ) : (
          <ul className="space-y-1 text-sm">
            {s.requests24h.map((r) => (
              <li key={r.feature} className="flex justify-between">
                <span>{r.feature}</span>
                <span className="tabular-nums">{r.count}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
