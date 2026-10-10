import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { liveGet, type ModeMission } from '@/lib/api/live';
import { ErrorState, PageHeader } from '@/components/live/ui';
import { ModeList } from '@/components/live/mode-list';

export const metadata = { title: 'Story mode · DeutschFlow' };

export default async function Page() {
  const session = await getSession();
  if (!session) redirect('/login');
  const missions = await liveGet<ModeMission[]>(session, '/missions?mode=STORY');
  if (!missions) return <ErrorState retryHref="/story" />;
  return (
    <div>
      <PageHeader eyebrow="Your choices matter" title="Story mode" description="A story in chapters. Each chapter is a conversation, and the choice you make at the start changes how it plays out." />
      <ModeList missions={missions} empty="Stories for your language are coming soon." />
    </div>
  );
}
