import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { liveGet, type World } from '@/lib/api/live';
import { Badge, ErrorState, PageHeader, ProgressBar } from '@/components/live/ui';
import { MissionCard } from '@/components/live/mission-card';
import { accent } from '@/components/live/accent';
import { cn } from '@deutschflow/ui';

export const metadata = { title: 'Your world · DeutschFlow' };

export default async function WorldPage({ searchParams }: { searchParams: { env?: string } }) {
  const session = await getSession();
  if (!session) redirect('/login');
  const world = await liveGet<World>(session, '/world');
  if (!world) return <ErrorState retryHref="/world" />;

  const environments = world.environments.filter((e) => e.missionCount > 0);
  const selected = environments.find((e) => e.slug === searchParams.env) ?? environments.find((e) => e.unlocked) ?? environments[0];
  const totalDone = environments.reduce((s, e) => s + e.completedCount, 0);
  const total = environments.reduce((s, e) => s + e.missionCount, 0);

  return (
    <div>
      <PageHeader
        eyebrow={`Level ${world.level}`}
        title="Your language world"
        description="Every place is a real situation. Pick a location and step into a conversation."
        action={
          <div className="w-48">
            <p className="mb-1 text-right text-xs text-muted-foreground">
              {totalDone} / {total} missions
            </p>
            <ProgressBar value={total ? (totalDone / total) * 100 : 0} label="World progress" />
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
        <nav aria-label="Locations" className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3">
          {environments.map((env) => {
            const a = accent(env.accent);
            const active = env.slug === selected?.slug;
            return (
              <a
                key={env.slug}
                href={`/world?env=${env.slug}`}
                aria-current={active ? 'true' : undefined}
                className={cn(
                  'group relative flex flex-col rounded-2xl border bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md',
                  active ? `border-transparent ring-2 ${a.ring}` : 'border-border',
                  !env.unlocked && 'opacity-60',
                )}
              >
                <span className={cn('mb-3 flex h-12 w-12 items-center justify-center rounded-xl text-2xl', a.soft)} aria-hidden>
                  {env.icon}
                </span>
                <span className="font-semibold leading-tight">{env.name}</span>
                <span className="mt-0.5 text-xs text-muted-foreground">
                  {env.unlocked ? `${env.completedCount}/${env.missionCount} done` : `🔒 From ${env.minLevel}`}
                </span>
                {env.completedCount > 0 && env.completedCount === env.missionCount && (
                  <span className="absolute right-3 top-3 text-sm" aria-label="All missions completed">
                    ✅
                  </span>
                )}
              </a>
            );
          })}
        </nav>

        {selected && (
          <section aria-labelledby="env-title" className="rounded-3xl border border-border bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-5 flex items-start gap-4">
              <span className={cn('flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-3xl', accent(selected.accent).soft)} aria-hidden>
                {selected.icon}
              </span>
              <div>
                <h2 id="env-title" className="text-xl font-bold tracking-tight">
                  {selected.name}
                </h2>
                <p className="text-sm text-muted-foreground">{selected.description}</p>
                <div className="mt-2 flex gap-2">
                  <Badge tone="indigo">From {selected.minLevel}</Badge>
                  <Badge>{selected.missionCount} missions</Badge>
                </div>
              </div>
            </div>
            <ul className="space-y-3">
              {selected.missions.map((m) => (
                <li key={m.id}>
                  <MissionCard mission={m} />
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}
