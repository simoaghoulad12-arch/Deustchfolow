import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { liveGet, type Language, type Me } from '@/lib/api/live';
import { OnboardingWizard } from './wizard';

export const metadata = { title: 'Welcome · DeutschFlow' };

export default async function OnboardingPage() {
  const session = await getSession();
  if (!session) redirect('/login');
  const [languages, me] = await Promise.all([liveGet<(Language & { isTarget: boolean })[]>(session, '/languages'), liveGet<Me>(session, '/me')]);
  if (me?.onboardingCompleted && !me.needsPlacement) redirect('/home');
  return <OnboardingWizard languages={(languages ?? []).filter((l) => l.isTarget)} initialName={me?.displayName ?? ''} />;
}
