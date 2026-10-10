import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { liveGet, type Me } from '@/lib/api/live';
import { LiveShell } from '@/components/live/live-shell';

export const dynamic = 'force-dynamic';

/**
 * Staff area. Same chrome as the learner app, but staff accounts are not
 * forced through onboarding or placement before they can manage content.
 */
export default async function StaffLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect('/login');
  const me = await liveGet<Me>(session, '/me');
  return (
    <LiveShell session={session} me={me}>
      {children}
    </LiveShell>
  );
}
