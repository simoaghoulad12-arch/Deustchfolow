import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { liveGet, type ModeMission } from '@/lib/api/live';
import { ErrorState, PageHeader } from '@/components/live/ui';
import { ModeList } from '@/components/live/mode-list';

export const metadata = { title: 'Chaos mode · DeutschFlow' };

export default async function Page() {
  const session = await getSession();
  if (!session) redirect('/login');
  const missions = await liveGet<ModeMission[]>(session, '/missions?mode=CHAOS');
  if (!missions) return <ErrorState retryHref="/chaos" />;
  return (
    <div>
      <PageHeader eyebrow="Expect the unexpected" title="Chaos mode" description="Real life rarely follows a script. A random twist hits every run — a cancelled train, a declined card, a lost passport. Stay calm and talk your way through it." />
      <ModeList missions={missions} empty="Chaos missions for your language are coming soon." />
    </div>
  );
}
