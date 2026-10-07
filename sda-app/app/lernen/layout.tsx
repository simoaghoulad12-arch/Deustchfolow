import { LearnShell } from '@/components/learn/LearnShell';
import { requireStudent } from '@/lib/auth';
import { getPrefs } from '@/lib/prefs';

export const dynamic = 'force-dynamic';

/** Lern-App für Schüler (Rolle student). Team-Seiten sind für Schüler gesperrt (requireMember leitet hierher). */
export default async function LearnLayout({ children }: { children: React.ReactNode }) {
  const member = await requireStudent();
  const { lang } = getPrefs();
  return (
    <LearnShell name={member.fullName || member.email} lang={lang}>
      {children}
    </LearnShell>
  );
}
