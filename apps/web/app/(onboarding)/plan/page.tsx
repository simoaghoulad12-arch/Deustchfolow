import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { liveGet, type Me } from '@/lib/api/live';
import { Badge, ButtonLink, Card } from '@/components/live/ui';

export const metadata = { title: 'Your plan · DeutschFlow' };

const SKILL_LABEL: Record<string, string> = { SPEAKING: 'Speaking', LISTENING: 'Listening', READING: 'Reading', WRITING: 'Writing', GRAMMAR: 'Grammar', VOCABULARY: 'Vocabulary' };

export default async function PlanPage() {
  const session = await getSession();
  if (!session) redirect('/login');
  const me = await liveGet<Me>(session, '/me');
  if (!me) redirect('/home');
  if (!me.onboardingCompleted) redirect('/onboarding');
  if (me.needsPlacement) redirect('/placement');
  const plan = me.plan;

  return (
    <div className="pt-6 sm:pt-10">
      <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600">Your personal plan</p>
      <h1 className="mt-2 text-balance text-3xl font-bold tracking-tight sm:text-4xl">
        {me.targetLanguage?.flag} {me.level} → {plan?.targetLevel ?? 'next level'}
      </h1>
      {plan ? (
        <>
          <p className="mt-3 max-w-2xl text-lg text-slate-700">{plan.headline}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {plan.focusSkills.map((s) => (
              <Badge key={s} tone="indigo">
                Focus: {SKILL_LABEL[s] ?? s}
              </Badge>
            ))}
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <Card>
              <h2 className="mb-3 font-semibold">Every day · {me.dailyMinutes} min</h2>
              <ol className="space-y-2">
                {plan.dailyRoutine.map((a, i) => (
                  <li key={`${a.kind}-${i}`} className="flex justify-between text-sm">
                    <span>{a.title}</span>
                    <span className="text-muted-foreground">{a.minutes} min</span>
                  </li>
                ))}
              </ol>
            </Card>
            <Card>
              <h2 className="mb-3 font-semibold">Your first month</h2>
              <ol className="space-y-3">
                {plan.weeks.map((w) => (
                  <li key={w.week} className="text-sm">
                    <span className="font-semibold">Week {w.week}:</span> {w.theme}
                  </li>
                ))}
              </ol>
            </Card>
          </div>
        </>
      ) : (
        <p className="mt-3 text-muted-foreground">Your plan is being prepared.</p>
      )}
      <div className="mt-10 flex flex-wrap gap-3">
        <ButtonLink href="/world" size="lg">
          Enter your world →
        </ButtonLink>
        <ButtonLink href="/home" variant="secondary" size="lg">
          Go to dashboard
        </ButtonLink>
      </div>
    </div>
  );
}
