import Link from 'next/link';
import { signOut } from '@/app/login/actions';
import { t, type Lang, type UIKey } from '@/lib/i18n';
import { LearnNav } from './LearnNav';

export const LEARN_NAV: { href: string; key: UIKey; icon: string }[] = [
  { href: '/lernen', key: 'myPath', icon: 'M4 19h16M4 15l4-4 4 3 6-7' },
  {
    href: '/lernen/hausaufgaben',
    key: 'myHomework',
    icon: 'M6 3h9l4 4v14H6zM14 3v5h5M9 13h7M9 17h5',
  },
  {
    href: '/lernen/fehler',
    key: 'myErrors',
    icon: 'M12 8v5M12 16h.01M10.3 3.9 2.6 17.4A2 2 0 0 0 4.3 20h15.4a2 2 0 0 0 1.7-2.6L13.7 3.9a2 2 0 0 0-3.4 0z',
  },
  { href: '/lernen/deutschland', key: 'germany', icon: 'M3 21h18M5 21V8l7-5 7 5v13M9 21v-6h6v6' },
];

/** Rahmen der Lern-App: Kopfzeile, Navigation oben (Desktop) bzw. unten (Handy). */
export function LearnShell({
  name,
  lang,
  children,
}: {
  name: string;
  lang: Lang;
  children: React.ReactNode;
}) {
  const items = LEARN_NAV.map((n) => ({ href: n.href, label: t(lang, n.key), icon: n.icon }));
  return (
    <div className="min-h-screen">
      <a
        href="#inhalt"
        className="sr-only z-[60] rounded bg-panel px-3 py-2 focus:not-sr-only focus:fixed focus:start-2 focus:top-2"
      >
        {t(lang, 'skipToContent')}
      </a>
      <header className="sticky top-0 z-40 border-b-[3px] border-red bg-anth pt-[env(safe-area-inset-top)] text-anth-ink">
        <div className="mx-auto flex max-w-4xl items-center gap-3 px-4 py-2">
          <Link href="/lernen" className="shrink-0 leading-tight">
            <span className="block text-[15px] font-bold tracking-wide [font-family:var(--font-head)]">
              SMART DEUTSCH
            </span>
            <span className="block text-[11px] opacity-70">{t(lang, 'learnApp')}</span>
          </Link>
          <span className="min-w-0 flex-1 truncate text-end text-sm opacity-80">{name}</span>
          <Link
            href="/lernen/einstellungen"
            className="inline-flex min-h-11 items-center rounded-lg border border-white/25 px-3 text-sm"
          >
            {t(lang, 'settings')}
          </Link>
          <form action={signOut}>
            <button
              type="submit"
              className="min-h-11 rounded-lg border border-white/25 px-3 text-sm"
            >
              {t(lang, 'signOut')}
            </button>
          </form>
        </div>
        <div className="hidden border-t border-white/10 md:block">
          <LearnNav items={items} variant="top" />
        </div>
      </header>
      <main id="inhalt" className="mx-auto max-w-4xl px-4 pb-28 pt-5 md:pb-12">
        {children}
      </main>
      <div className="md:hidden">
        <LearnNav items={items} variant="bottom" />
      </div>
    </div>
  );
}
