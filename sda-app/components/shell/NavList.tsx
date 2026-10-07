'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { pick, type Lang } from '@/lib/i18n';
import { activeKey, NAV } from '@/lib/nav';

/** Navigation nach Gruppen (Seitenleiste auf dem Desktop, Menü auf dem Handy). */
export function NavList({ lang, onNavigate }: { lang: Lang; onNavigate?: () => void }) {
  const active = activeKey(usePathname());
  return (
    <div className="space-y-5">
      {NAV.map((group) => (
        <div key={group.label.de}>
          <p className="mb-1 px-3 text-xs font-semibold uppercase tracking-wider text-anth-ink/60">
            {pick(lang, group.label)}
          </p>
          <ul>
            {group.items.map((item) => (
              <li key={item.key}>
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  aria-current={active === item.key ? 'page' : undefined}
                  className="flex min-h-11 items-center rounded-lg px-3 text-[15px] text-anth-ink/90 hover:bg-anth2 aria-[current=page]:bg-anth2 aria-[current=page]:font-semibold aria-[current=page]:text-anth-ink aria-[current=page]:shadow-[inset_3px_0_0_var(--red)] rtl:aria-[current=page]:shadow-[inset_-3px_0_0_var(--red)]"
                >
                  {pick(lang, item.label)}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
