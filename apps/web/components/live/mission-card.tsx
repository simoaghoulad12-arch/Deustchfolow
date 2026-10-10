import Link from 'next/link';
import type { MissionSummary } from '@deutschflow/types';
import { cn } from '@deutschflow/ui';
import { Badge } from './ui';
import { accent } from './accent';

const STATUS: Record<MissionSummary['status'], { label: string; tone: 'neutral' | 'indigo' | 'green' | 'amber' }> = {
  locked: { label: 'Locked', tone: 'neutral' },
  available: { label: 'New', tone: 'indigo' },
  in_progress: { label: 'In progress', tone: 'amber' },
  completed: { label: 'Completed', tone: 'green' },
};

export function MissionCard({ mission, compact = false }: { mission: MissionSummary; compact?: boolean }) {
  const a = accent(mission.environment?.accent);
  const locked = mission.status === 'locked';
  const status = STATUS[mission.status];
  const body = (
    <>
      <div className="flex items-start gap-3">
        <span className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-2xl', a.soft)} aria-hidden>
          {mission.character?.avatar ?? mission.environment?.icon ?? '🎯'}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <h3 className="font-semibold leading-tight">{mission.title}</h3>
          </div>
          {!compact && <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{mission.description}</p>}
          <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
            <Badge tone="indigo">{mission.cefrLevel}</Badge>
            <Badge tone={status.tone}>{locked ? `🔒 ${status.label}` : status.label}</Badge>
            <span>· {mission.estimatedMinutes} min</span>
            <span>· +{mission.xpReward} XP</span>
            {mission.bestScore != null && <span>· best {mission.bestScore}</span>}
          </div>
        </div>
      </div>
    </>
  );

  if (locked) {
    return (
      <div className="rounded-2xl border border-border bg-slate-50 p-4 opacity-70" aria-disabled="true" title="Reach the required level to unlock this mission">
        {body}
      </div>
    );
  }
  return (
    <Link href={`/missions/${mission.slug}`} className="block rounded-2xl border border-border bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md">
      {body}
    </Link>
  );
}
