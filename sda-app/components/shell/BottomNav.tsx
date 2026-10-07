'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { pick, type Lang } from '@/lib/i18n';
import { activeKey, BOTTOM_NAV, ROUTES } from '@/lib/nav';

const ICONS: Record<string, string> = {
  dash: 'M4 13h7V4H4zM13 20h7v-9h-7zM4 20h7v-5H4zM13 9h7V4h-7z',
  play: 'M12 8v4l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z',
  cur: 'M4 5h7a3 3 0 0 1 3 3v12a2 2 0 0 0-2-2H4zM20 5h-4a3 3 0 0 0-3 3',
  doc: 'M6 3h9l4 4v14H6zM14 3v5h5M9 13h7M9 17h5',
};

/** Untere Leiste auf dem Handy (wie legacy): die vier häufigsten Seiten. */
export function BottomNav({ lang }: { lang: Lang }) {
  const active = activeKey(usePathname());
  return (
    <nav
      aria-label="Schnellzugriff"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-panel pb-[env(safe-area-inset-bottom)] lg:hidden"
    >
      <ul className="grid grid-cols-4">
        {BOTTOM_NAV.map((b) => (
          <li key={b.key}>
            <Link
              href={ROUTES[b.key]}
              aria-current={active === b.key ? 'page' : undefined}
              className="flex min-h-14 flex-col items-center justify-center gap-0.5 text-xs text-muted aria-[current=page]:font-semibold aria-[current=page]:text-red"
            >
              <svg
                viewBox="0 0 24 24"
                width="22"
                height="22"
                aria-hidden="true"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path d={ICONS[b.key]} />
              </svg>
              {pick(lang, b.label)}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
