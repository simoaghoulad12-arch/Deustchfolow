import { redirect } from 'next/navigation';
import Link from 'next/link';
import { UserRole } from '@deutschflow/types';
import { getSession } from '@/lib/auth/session';
import { logoutAction } from './actions';
import { Button } from '@/components/ui/button';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) {
    redirect('/login');
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-border">
        <div className="container flex h-16 items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="text-lg font-semibold">
              DeutschFlow
            </Link>
            <nav className="hidden items-center gap-4 text-sm text-muted-foreground sm:flex">
              <Link href="/dashboard" className="hover:text-foreground">
                Dashboard
              </Link>
              <Link href="/learn" className="hover:text-foreground">
                Lernen
              </Link>
              <Link href="/tutors" className="hover:text-foreground">
                Tutoren
              </Link>
              {session.role === UserRole.TUTOR && (
                <Link href="/tutor/availability" className="hover:text-foreground">
                  Meine Verfügbarkeit
                </Link>
              )}
              <Link href="/ai-tutor" className="hover:text-foreground">
                KI-Tutor
              </Link>
              <Link href="/writing" className="hover:text-foreground">
                Schreiben
              </Link>
              <Link href="/settings" className="hover:text-foreground">
                Einstellungen
              </Link>
            </nav>
          </div>
          <form action={logoutAction}>
            <Button type="submit" variant="outline" size="default">
              Abmelden
            </Button>
          </form>
        </div>
      </header>
      <main className="container flex-1 py-10">{children}</main>
    </div>
  );
}
