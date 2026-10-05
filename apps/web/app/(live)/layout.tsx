import { redirect } from 'next/navigation';
import Link from 'next/link';
import { UserRole } from '@deutschflow/types';
import { getSession } from '@/lib/auth/session';
import { liveGet, type Me } from '@/lib/api/live';
import { logoutAction } from '../(app)/actions';
import { BottomNav, MobileMoreMenu, Sidebar } from '@/components/live/app-nav';

export const dynamic = 'force-dynamic';

export default async function LiveLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect('/login');

  const me = await liveGet<Me>(session, '/me');
  if (me && !me.onboardingCompleted) redirect('/onboarding');
  if (me?.needsPlacement) redirect('/placement');

  const isAdmin = session.role === UserRole.ADMIN || session.role === UserRole.CONTENT_EDITOR;
  const name = me?.displayName ?? session.email.split('@')[0];

  const footer = (
    <div className="flex items-center justify-between gap-2 px-2">
      <Link href="/profile" className="min-w-0">
        <p className="truncate text-sm font-semibold">{name}</p>
        <p className="truncate text-xs text-muted-foreground">
          {me?.targetLanguage ? `${me.targetLanguage.flag} ${me.targetLanguage.name} · ${me.level ?? ''}` : session.email}
        </p>
      </Link>
      <form action={logoutAction}>
        <button type="submit" className="rounded-lg px-2 py-1 text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-900">
          Log out
        </button>
      </form>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-slate-50/70">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2">
        Skip to content
      </a>
      <Sidebar footer={footer} isAdmin={isAdmin} />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-border bg-white/80 backdrop-blur">
          <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
            <Link href="/home" className="flex items-center gap-2 font-bold tracking-tight lg:hidden">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 text-sm text-white">D</span>
              <span className="hidden sm:inline">DeutschFlow</span>
            </Link>
            <div className="hidden text-sm text-muted-foreground lg:block">
              {me?.targetLanguage ? (
                <span>
                  Learning <span className="font-medium text-foreground">{me.targetLanguage.flag} {me.targetLanguage.name}</span>
                </span>
              ) : null}
            </div>
            <div className="flex items-center gap-2">
              {me?.stats && (
                <>
                  <span className="inline-flex h-9 items-center gap-1 rounded-xl bg-orange-50 px-3 text-sm font-semibold text-orange-700" title="Day streak">
                    <span aria-hidden>🔥</span>
                    {me.stats.currentStreak}
                    <span className="sr-only">day streak</span>
                  </span>
                  <span className="inline-flex h-9 items-center gap-1 rounded-xl bg-indigo-50 px-3 text-sm font-semibold text-indigo-700" title="Total XP">
                    <span aria-hidden>⭐</span>
                    {me.stats.totalXp.toLocaleString('en')}
                    <span className="sr-only">XP</span>
                  </span>
                </>
              )}
              <MobileMoreMenu isAdmin={isAdmin} />
            </div>
          </div>
        </header>
        <main id="main" className="mx-auto w-full max-w-6xl flex-1 px-4 pb-28 pt-6 sm:px-6 lg:pb-12 lg:pt-8">
          {!me && (
            <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900" role="status">
              Some of your learning data could not be loaded right now. You can keep going — we will retry automatically.
            </div>
          )}
          {children}
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
