import { notFound, redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { liveGet, type Me, type MissionRun } from '@/lib/api/live';
import { MissionChat } from './mission-chat';

export const metadata = { title: 'Conversation · DeutschFlow' };

export default async function RunPage({ params }: { params: { runId: string } }) {
  const session = await getSession();
  if (!session) redirect('/login');
  if (!/^[0-9a-f-]{36}$/i.test(params.runId)) notFound();
  const [run, me] = await Promise.all([liveGet<MissionRun>(session, `/runs/${params.runId}`), liveGet<Me>(session, '/me')]);
  if (!run) notFound();
  return <MissionChat run={run} languageCode={me?.targetLanguage?.code ?? 'de'} />;
}
