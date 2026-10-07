import { AppShell } from '@/components/shell/AppShell';
import { requireMember } from '@/lib/auth';
import { getPrefs } from '@/lib/prefs';

export const dynamic = 'force-dynamic';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const member = await requireMember();
  const { lang } = getPrefs();
  return (
    <AppShell member={member} lang={lang}>
      {children}
    </AppShell>
  );
}
