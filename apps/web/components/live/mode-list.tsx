import type { ModeMission } from '@/lib/api/live';
import { EmptyState } from './ui';
import { MissionCard } from './mission-card';

export function ModeList({ missions, empty }: { missions: ModeMission[]; empty: string }) {
  if (missions.length === 0) return <EmptyState icon="🧭" title="Nothing here yet" description={empty} />;
  return (
    <ul className="grid gap-3 md:grid-cols-2">
      {missions.map((m) => (
        <li key={m.id}>
          <MissionCard mission={m} />
        </li>
      ))}
    </ul>
  );
}
