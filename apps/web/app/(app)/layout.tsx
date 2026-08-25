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
            {/*
              Primary nav per product spec: Lernen, KI Tutor, Sprechen, Tutoren,
              Deutschland, Mein Fortschritt. "Community" is intentionally omitted —
              no backend feature exists for it yet, and this platform does not
              simulate features that aren't real.
            */}
            <nav className="hidden items-center gap-4 text-sm text-muted-foreground sm:flex">
              <Link href="/learn" className="hover:text-foreground">
                Lernen
              </Link>
              <Link href="/ai-tutor" className="hover:text-foreground">
                KI Tutor
              </Link>
              <Link href="/tutors?specialty=CONVERSATION" className="hover:text-foreground">
                Sprechen
              </Link>
              <Link href="/tutors" className="hover:text-foreground">
                Tutoren
              </Link>
              <Link href="/germany/my-path" className="hover:text-foreground">
                Deutschland
              </Link>
              <Link href="/dashboard" className="hover:text-foreground">
                Mein Fortschritt
              </Link>
            </nav>
          </div>
          <form action={logoutAction}>
            <Button type="submit" variant="outline" size="default">
              Abmelden
            </Button>
          </form>
        </div>
        <div className="container hidden border-t border-border/60 py-2 sm:block">
          <nav className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <Link href="/bookings" className="hover:text-foreground">
              Meine Buchungen
            </Link>
            <Link href="/practice/real-life" className="hover:text-foreground">
              Alltagssimulationen
            </Link>
            <Link href="/career" className="hover:text-foreground">
              Karriere
            </Link>
            <Link href="/writing" className="hover:text-foreground">
              Schreiben
            </Link>
            {session.role === UserRole.TUTOR && (
              <>
                <Link href="/tutor/availability" className="hover:text-foreground">
                  Meine Verfügbarkeit
                </Link>
                <Link href="/tutor/bookings" className="hover:text-foreground">
                  Buchungsanfragen
                </Link>
                <Link href="/tutor/earnings" className="hover:text-foreground">
                  Einnahmen
                </Link>
                <Link href="/tutor/reviews" className="hover:text-foreground">
                  Bewertungen
                </Link>
                <Link href="/tutor/verification" className="hover:text-foreground">
                  Verifizierung
                </Link>
              </>
            )}
            <Link href="/settings" className="hover:text-foreground">
              Einstellungen
            </Link>
          </nav>
        </div>
      </header>
      <main className="container flex-1 py-10">{children}</main>
    </div>
  );
}
