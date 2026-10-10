import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { liveGet, type Me } from '@/lib/api/live';
import { LiveShell } from '@/components/live/live-shell';

export const dynamic = 'force-dynamic';

export default async function LiveLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect('/login');

  const me = await liveGet<Me>(session, '/me');
  if (me && !me.onboardingCompleted) redirect('/onboarding');
  if (me?.needsPlacement) redirect('/placement');

  return (
    <LiveShell session={session} me={me}>
      {children}
    </LiveShell>
  );
}
