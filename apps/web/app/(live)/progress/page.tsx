import { redirect } from 'next/navigation';
import { DNA_LABELS, type DnaDimension } from '@deutschflow/types';
import { getSession } from '@/lib/auth/session';
import { liveGet, type ProgressOverview } from '@/lib/api/live';
import { Badge, Card, ErrorState, PageHeader, ProgressBar, ScoreBar, SectionTitle, Stat } from '@/components/live/ui';
import { DnaRadar } from '@/components/live/dna-radar';

export const metadata = { title: 'Progress · DeutschFlow' };

export default async function ProgressPage() {
  const session = await getSession();
  if (!session) redirect('/login');
  const p = await liveGet<ProgressOverview>(session, '/progress');
  if (!p) return <ErrorState retryHref="/progress" />;
  const maxXp = Math.max(10, ...p.xpByDay.map((d) => d.xp));
  const s = p.stats;

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Your growth" title="Progress" description="Everything you’ve done, measured. The numbers update after every mission, review and practice session." />

      <Card>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <span className="text-4xl font-extrabold text-indigo-600">{p.level}</span>
            <div>
              <p className="font-semibold">Current level</p>
              <p className="text-sm text-muted-foreground">Estimated from your performance: {p.estimatedLevel}</p>
            </div>
          </div>
          <div className="flex-1">
            <div className="mb-1 flex justify-between text-xs text-muted-foreground">
              <span>Progress to the next level</span>
              <span>{p.levelProgress}%</span>
            </div>
            <ProgressBar value={p.levelProgress} label="Level progress" />
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat icon="⭐" label="Total XP" value={s.totalXp.toLocaleString('en')} />
        <Stat icon="🔥" label="Streak" value={`${s.currentStreak} days`} hint={`Best ${s.longestStreak}`} />
        <Stat icon="🎯" label="Missions" value={s.missionsCompleted} hint={s.averageMissionScore != null ? `Avg score ${s.averageMissionScore}` : undefined} />
        <Stat icon="⏱️" label="Learning time" value={`${s.learningMinutes} min`} hint={`${s.speakingMinutes} min speaking`} />
        <Stat icon="📚" label="Words" value={s.words} hint={`${s.wordsMastered} mastered`} />
        <Stat icon="🩹" label="Mistakes fixed" value={s.mistakesMastered} hint={`${s.mistakesOpen} open`} />
        <Stat icon="🧩" label="Grammar mastery" value={`${s.grammarMastery}%`} />
        <Stat icon="📓" label="Journal entries" value={s.journalEntries} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <SectionTitle>XP — last 30 days</SectionTitle>
          <div className="flex h-40 items-end gap-1" role="img" aria-label="XP per day for the last 30 days">
            {p.xpByDay.map((d) => (
              <div key={d.day} className="group relative flex-1">
                <div className="w-full rounded-t bg-gradient-to-t from-indigo-500 to-violet-400" style={{ height: `${Math.max(d.xp ? 4 : 1, (d.xp / maxXp) * 150)}px`, opacity: d.xp ? 1 : 0.25 }} title={`${d.day}: ${d.xp} XP`} />
              </div>
            ))}
          </div>
          <div className="mt-2 flex justify-between text-xs text-muted-foreground">
            <span>{p.xpByDay[0]?.day}</span>
            <span>Today</span>
          </div>
        </Card>
        <Card>
          <SectionTitle>Language DNA</SectionTitle>
          <DnaRadar dna={p.dna} />
        </Card>
      </div>

      <Card>
        <SectionTitle>Skills</SectionTitle>
        <div className="grid gap-4 sm:grid-cols-2">
          {(Object.keys(p.dna) as DnaDimension[]).map((d) => (
            <ScoreBar key={d} label={DNA_LABELS[d]} value={p.dna[d]} />
          ))}
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <SectionTitle>Recent missions</SectionTitle>
          {p.recentMissions.length === 0 ? (
            <p className="text-sm text-muted-foreground">Complete a mission to see it here.</p>
          ) : (
            <ul className="divide-y divide-border">
              {p.recentMissions.map((m, i) => (
                <li key={`${m.slug}-${i}`} className="flex items-center justify-between py-2 text-sm">
                  <span className="font-medium">{m.title}</span>
                  <span className="text-muted-foreground">
                    {m.score ?? '–'} pts · +{m.xpAwarded} XP
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
        <Card>
          <SectionTitle action={<Badge tone="violet">{p.achievements.filter((a) => a.unlockedAt).length} / {p.achievements.length}</Badge>}>Achievements</SectionTitle>
          <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {p.achievements.map((a) => (
              <li key={a.code} className={`rounded-xl border p-3 text-center text-xs ${a.unlockedAt ? 'border-violet-200 bg-violet-50' : 'border-border opacity-50 grayscale'}`} title={a.description}>
                <span className="block text-2xl" aria-hidden>
                  {a.icon}
                </span>
                <span className="mt-1 block font-semibold">{a.title}</span>
                <span className="sr-only">{a.unlockedAt ? 'Unlocked' : 'Locked'}: {a.description}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
