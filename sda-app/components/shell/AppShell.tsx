import Link from 'next/link';
import { signOut } from '@/app/login/actions';
import type { CurrentMember } from '@/lib/auth';
import { t, type Lang } from '@/lib/i18n';
import { ROLE_LABELS } from '@/lib/roles';
import { BottomNav } from './BottomNav';
import { MobileMenu } from './MobileMenu';
import { NavList } from './NavList';

/**
 * App-Rahmen wie legacy/index.html: Kopfzeile mit Suche, Seitenleiste auf dem Desktop,
 * Menü und untere Leiste auf dem Handy.
 */
export function AppShell({
  member,
  lang,
  children,
}: {
  member: CurrentMember;
  lang: Lang;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <a
        href="#inhalt"
        className="sr-only z-[60] rounded bg-panel px-3 py-2 focus:not-sr-only focus:fixed focus:start-2 focus:top-2"
      >
        {t(lang, 'skipToContent')}
      </a>
      <header className="sticky top-0 z-40 border-b-[3px] border-red bg-anth pt-[env(safe-area-inset-top)] text-anth-ink">
        <div className="flex items-center gap-3 px-3 py-2">
          <MobileMenu
            lang={lang}
            memberLabel={`${member.fullName || member.email} · ${ROLE_LABELS[member.role]}`}
          />
          <Link href="/" className="shrink-0 leading-tight">
            <span className="block [font-family:var(--font-head)] text-[15px] font-bold tracking-wide">
              SMART DEUTSCH
            </span>
            <span className="block text-[11px] opacity-70">{t(lang, 'tagline')}</span>
          </Link>
          <form action="/suche" role="search" className="min-w-0 flex-1">
            <label className="sr-only" htmlFor="kopf-suche">
              {t(lang, 'search')}
            </label>
            <input
              id="kopf-suche"
              name="q"
              type="search"
              placeholder={t(lang, 'searchPlaceholder')}
              className="min-h-11 w-full rounded-lg border border-white/20 bg-anth2 px-3 text-base text-anth-ink placeholder:text-anth-ink/50"
            />
          </form>
          <div className="hidden items-center gap-3 text-sm md:flex">
            <span className="max-w-[16ch] truncate" title={member.email}>
              {member.fullName || member.email}
              <span className="block text-[11px] opacity-70">{ROLE_LABELS[member.role]}</span>
            </span>
            <form action={signOut}>
              <button type="submit" className="min-h-11 rounded-lg border border-white/25 px-3">
                {t(lang, 'signOut')}
              </button>
            </form>
          </div>
        </div>
      </header>
      <div className="lg:flex">
        <aside className="hidden w-72 shrink-0 lg:block">
          <nav
            aria-label={t(lang, 'mainNav')}
            className="sticky top-[67px] h-[calc(100vh-67px)] overflow-y-auto bg-anth p-3 text-anth-ink"
          >
            <NavList lang={lang} />
          </nav>
        </aside>
        <main id="inhalt" className="min-w-0 flex-1 px-4 pb-28 pt-5 lg:px-8 lg:pb-12">
          <div className="mx-auto max-w-4xl">{children}</div>
        </main>
      </div>
      <BottomNav lang={lang} />
    </div>
  );
}
