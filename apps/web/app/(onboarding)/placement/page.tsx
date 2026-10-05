import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { liveGet, type Me } from '@/lib/api/live';
import { PlacementTest } from './placement-test';

export const metadata = { title: 'Placement test · DeutschFlow' };

export default async function PlacementPage() {
  const session = await getSession();
  if (!session) redirect('/login');
  const me = await liveGet<Me>(session, '/me');
  if (me && !me.onboardingCompleted) redirect('/onboarding');
  return <PlacementTest languageName={me?.targetLanguage?.name ?? 'your language'} languageCode={me?.targetLanguage?.code ?? 'de'} />;
}
