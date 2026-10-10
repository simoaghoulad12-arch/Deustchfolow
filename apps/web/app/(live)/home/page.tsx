import { redirect } from 'next/navigation';
import Link from 'next/link';
import { MISTAKE_CATEGORY_LABELS } from '@deutschflow/types';
import { getSession } from '@/lib/auth/session';
import { liveGet, type Home } from '@/lib/api/live';
import { Badge, ButtonLink, Card, ErrorState, ProgressBar, SectionTitle, Stat } from '@/components/live/ui';
import { DnaRadar } from '@/components/live/dna-radar';
import { MissionCard } from '@/components/live/mission-card';
import { DailyChallengeCard } from './daily-challenge';

export const metadata = { title: 'Home · DeutschFlow' };

function greeting() {
  const h = new Date().getUTCHours();
  return h < 11 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
}

export default async function HomePage() {
  const session = await getSession();
  if (!session) redirect('/login');
  const home = await liveGet<Home>(session, '/home');
  if (!home) return <ErrorState retryHref="/home" />;
  if (!home.ready) redirect('/onboarding');

  const { me, coach, challenge, nextMission, activeRun, dna, reviewDue, mistakes, xpToday } = home;
  const dailyGoalXp = Math.max(50, (me.dailyMinutes ?? 10) * 10);
  const name = me.displayName ?? '';

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 p-6 text-white shadow-lg sm:p-8">
        <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/10 blur-2xl" aria-hidden />
        <p className="text-sm font-medium text-white/80">
          {greeting()}
          {name ? `, ${name}` : ''} · {me.targetLanguage?.flag} {me.targetLanguage?.name} {me.level}
        </p>
        <h1 className="mt-2 max-w-2xl text-balance text-2xl font-bold tracking-tight sm:text-3xl">
          {coach?.headline ?? 'Ready for your next real conversation?'}
        </h1>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          {activeRun ? (
            <ButtonLink href={`/runs/${activeRun.id}`} variant="secondary" size="lg">
              Continue “{activeRun.title}” →
            </ButtonLink>
          ) : nextMission ? (
            <ButtonLink href={`/missions/${nextMission.slug}`} variant="secondary" size="lg">
              Start “{nextMission.title}” →
            </ButtonLink>
          ) : (
            <ButtonLink href="/world" variant="secondary" size="lg">
              Explore your world →
            </ButtonLink>
          )}
          <div className="min-w-[200px] flex-1 sm:max-w-xs">
            <div className="mb-1 flex justify-between text-xs text-white/80">
              <span>Today</span>
              <span>
                {xpToday} / {dailyGoalXp} XP
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/20">
              <div className="h-full rounded-full bg-white" style={{ width: `${Math.min(100, (xpToday / dailyGoalXp) * 100)}%` }} />
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <Stat icon="🔥" label="Streak" value={`${me.stats?.currentStreak ?? 0} days`} hint={`Best: ${me.stats?.longestStreak ?? 0}`} />
        <Stat icon="⭐" label="Total XP" value={(me.stats?.totalXp ?? 0).toLocaleString('en')} hint={`+${xpToday} today`} />
        <Stat icon="📚" label="Words due" value={reviewDue} hint={reviewDue ? 'Review now' : 'All caught up'} />
        <Stat icon="⏱️" label="Learning time" value={`${me.stats?.learningMinutes ?? 0} min`} hint={`${me.stats?.speakingMinutes ?? 0} min speaking`} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="min-w-0 space-y-6 lg:col-span-2">
          {coach && (
            <Card>
              <SectionTitle action={<Badge tone="violet">AI coach</Badge>}>Your coach</SectionTitle>
              <ul className="space-y-2 text-sm">
                {coach.insights.map((insight) => (
                  <li key={insight} className="flex gap-2">
                    <span className="text-indigo-500" aria-hidden>
                      •
                    </span>
                    <span>{insight}</span>
                  </li>
                ))}
              </ul>
              <Link href={coach.recommendation.href} className="mt-4 flex items-center justify-between gap-3 rounded-xl bg-indigo-50 p-4 transition hover:bg-indigo-100">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">Recommended · {coach.recommendation.minutes} min</p>
                  <p className="font-semibold">{coach.recommendation.title}</p>
                  <p className="text-sm text-muted-foreground">{coach.recommendation.reason}</p>
                </div>
                <span className="text-xl text-indigo-600" aria-hidden>
                  →
                </span>
              </Link>
            </Card>
          )}

          <div id="challenge">
            <DailyChallengeCard challenge={challenge} languageCode={me.targetLanguage?.code} />
          </div>

          {nextMission && (
            <section>
              <SectionTitle action={<Link href="/world" className="text-sm font-medium text-indigo-600 hover:underline">Open world</Link>}>
                Next mission
              </SectionTitle>
              <MissionCard mission={nextMission} />
            </section>
          )}

          {me.plan && (
            <Card>
              <SectionTitle action={<Badge tone="indigo">{me.plan.targetLevel} in ~{me.plan.estimatedWeeks} weeks</Badge>}>Today’s plan</SectionTitle>
              <ol className="grid gap-2 sm:grid-cols-2">
                {me.plan.dailyRoutine.map((a, i) => (
                  <li key={`${a.kind}-${i}`}>
                    <Link href={a.href} className="flex items-center justify-between rounded-xl border border-border p-3 text-sm hover:border-indigo-200 hover:bg-indigo-50/40">
                      <span className="font-medium">{a.title}</span>
                      <span className="text-muted-foreground">{a.minutes} min</span>
                    </Link>
                  </li>
                ))}
              </ol>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <SectionTitle action={<Link href="/progress" className="text-sm font-medium text-indigo-600 hover:underline">Details</Link>}>Language DNA</SectionTitle>
            <DnaRadar dna={dna} />
          </Card>

          <Card>
            <SectionTitle action={<Link href="/mistakes" className="text-sm font-medium text-indigo-600 hover:underline">Practice</Link>}>Mistakes to fix</SectionTitle>
            {mistakes.length === 0 ? (
              <p className="text-sm text-muted-foreground">No open mistakes. The AI will collect them as you talk.</p>
            ) : (
              <ul className="space-y-3">
                {mistakes.slice(0, 4).map((m) => (
                  <li key={m.category}>
                    <div className="mb-1 flex justify-between text-sm">
                      <span>{MISTAKE_CATEGORY_LABELS[m.category]}</span>
                      <span className="text-muted-foreground">{m.occurrences}×</span>
                    </div>
                    <ProgressBar value={Math.min(100, m.occurrences * 15)} tone="amber" label={MISTAKE_CATEGORY_LABELS[m.category]} />
                  </li>
                ))}
              </ul>
            )}
          </Card>

          {home.recentAchievements.length > 0 && (
            <Card>
              <SectionTitle>Recent achievements</SectionTitle>
              <ul className="space-y-2">
                {home.recentAchievements.map((a) => (
                  <li key={a.code} className="flex items-center gap-3 text-sm">
                    <span className="text-2xl" aria-hidden>
                      {a.icon}
                    </span>
                    <span className="font-medium">{a.title}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
