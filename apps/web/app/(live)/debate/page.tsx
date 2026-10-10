import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { liveGet, type ModeMission } from '@/lib/api/live';
import { ErrorState, PageHeader } from '@/components/live/ui';
import { ModeList } from '@/components/live/mode-list';

export const metadata = { title: 'Debate · DeutschFlow' };

export default async function Page() {
  const session = await getSession();
  if (!session) redirect('/login');
  const missions = await liveGet<ModeMission[]>(session, '/missions?mode=DEBATE');
  if (!missions) return <ErrorState retryHref="/debate" />;
  return (
    <div>
      <PageHeader eyebrow="Argue your point" title="Debate" description="The AI takes the other side and pushes back. Give reasons, react to counterarguments and use connectors to win the debate." />
      <ModeList missions={missions} empty="Debates for your language are coming soon." />
    </div>
  );
}
