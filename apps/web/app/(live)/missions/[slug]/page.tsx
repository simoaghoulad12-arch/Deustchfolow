import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { getSession } from '@/lib/auth/session';
import { liveGet, type MissionDetail } from '@/lib/api/live';
import { Badge, Card, SectionTitle } from '@/components/live/ui';
import { accent } from '@/components/live/accent';
import { cn } from '@deutschflow/ui';
import { StartMission } from './start-mission';

export default async function MissionPage({ params }: { params: { slug: string } }) {
  const session = await getSession();
  if (!session) redirect('/login');
  const mission = await liveGet<MissionDetail>(session, `/missions/${encodeURIComponent(params.slug)}`);
  if (!mission) notFound();
  const a = accent(mission.environment?.accent);
  const choices = Array.isArray(mission.extra?.choices) ? (mission.extra?.choices as { id: string; label: string; consequence?: string }[]) : [];
  const stance = typeof mission.extra?.stance === 'string' ? mission.extra.stance : null;

  return (
    <div className="mx-auto max-w-3xl">
      <Link href={mission.environment ? `/world?env=${mission.environment.slug}` : '/world'} className="text-sm font-medium text-indigo-600 hover:underline">
        ← {mission.environment?.name ?? 'World'}
      </Link>
      <div className={cn('mt-4 overflow-hidden rounded-3xl border border-border bg-white shadow-sm')}>
        <div className={cn('flex items-center gap-4 p-6', a.soft)}>
          <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-4xl shadow-sm" aria-hidden>
            {mission.character?.avatar ?? mission.environment?.icon}
          </span>
          <div>
            <div className="mb-1 flex flex-wrap gap-1.5">
              <Badge tone="indigo">{mission.cefrLevel}</Badge>
              <Badge>{mission.estimatedMinutes} min</Badge>
              <Badge tone="violet">+{mission.xpReward} XP</Badge>
              {mission.mode !== 'MISSION' && <Badge tone="amber">{mission.mode.toLowerCase()} mode</Badge>}
            </div>
            <h1 className="text-2xl font-bold tracking-tight">{mission.title}</h1>
            {mission.character && (
              <p className="text-sm text-slate-600">
                with {mission.character.name}, {mission.character.role}
              </p>
            )}
          </div>
        </div>
        <div className="space-y-6 p-6">
          <p className="text-slate-700">{mission.description}</p>
          <div>
            <SectionTitle>Your goals</SectionTitle>
            <ol className="space-y-2">
              {mission.goals.map((g, i) => (
                <li key={g.id} className="flex items-center gap-3 text-sm">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-xs font-semibold text-indigo-700">{i + 1}</span>
                  {g.description}
                </li>
              ))}
            </ol>
          </div>
          {stance && (
            <Card className="bg-slate-50">
              <p className="text-sm">
                <span className="font-semibold">Your opponent argues:</span> {stance}
              </p>
            </Card>
          )}
          {mission.keyPhrases.length > 0 && (
            <div>
              <SectionTitle>Useful phrases</SectionTitle>
              <ul className="grid gap-2 sm:grid-cols-2">
                {mission.keyPhrases.map((p) => (
                  <li key={p.term} className="rounded-xl border border-border px-3 py-2 text-sm">
                    <span className="font-semibold">
                      {p.term}
                    </span>
                    <span className="block text-xs text-muted-foreground">{p.translation}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {mission.grammarFocus && <p className="text-sm text-muted-foreground">Grammar focus: {mission.grammarFocus}</p>}
          <StartMission slug={mission.slug} activeRunId={mission.activeRunId} locked={mission.status === 'locked'} choices={choices} />
        </div>
      </div>
    </div>
  );
}
