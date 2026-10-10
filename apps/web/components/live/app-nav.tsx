'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@deutschflow/ui';
import { PRACTICE_NAV, PRIMARY_NAV, type NavItem } from './nav-items';

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavLink({ item, pathname }: { item: NavItem; pathname: string }) {
  const active = isActive(pathname, item.href);
  return (
    <Link
      href={item.href}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors',
        active ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
      )}
    >
      <span aria-hidden className="text-base">
        {item.icon}
      </span>
      {item.label}
    </Link>
  );
}

export function Sidebar({ footer, isAdmin }: { footer: React.ReactNode; isAdmin: boolean }) {
  const pathname = usePathname();
  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-border bg-white/80 px-4 py-6 backdrop-blur lg:flex">
      <Link href="/home" className="mb-8 flex items-center gap-2 px-3 text-lg font-bold tracking-tight">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 text-white">D</span>
        DeutschFlow
      </Link>
      <nav aria-label="Main" className="flex flex-1 flex-col gap-1 overflow-y-auto">
        {PRIMARY_NAV.map((item) => (
          <NavLink key={item.href} item={item} pathname={pathname} />
        ))}
        <p className="mb-1 mt-6 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Practice</p>
        {PRACTICE_NAV.map((item) => (
          <NavLink key={item.href} item={item} pathname={pathname} />
        ))}
        <p className="mb-1 mt-6 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Account</p>
        <NavLink item={{ href: '/profile', label: 'Profile', icon: '👤' }} pathname={pathname} />
        {isAdmin && <NavLink item={{ href: '/admin', label: 'Admin', icon: '🛠️' }} pathname={pathname} />}
      </nav>
      <div className="mt-4 border-t border-border pt-4">{footer}</div>
    </aside>
  );
}

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Main" className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
      <ul className="mx-auto grid max-w-lg grid-cols-5">
        {PRIMARY_NAV.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={cn('flex flex-col items-center gap-0.5 py-2 text-[11px] font-medium', active ? 'text-indigo-700' : 'text-slate-500')}
              >
                <span aria-hidden className={cn('text-lg transition-transform', active && 'scale-110')}>
                  {item.icon}
                </span>
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function MobileMoreMenu({ isAdmin }: { isAdmin: boolean }) {
  return (
    <details className="relative lg:hidden">
      <summary className="flex h-9 cursor-pointer list-none items-center rounded-xl border border-border bg-white px-3 text-sm font-medium [&::-webkit-details-marker]:hidden">
        More
      </summary>
      <div className="absolute right-0 z-50 mt-2 w-56 rounded-2xl border border-border bg-white p-2 shadow-lg">
        {[...PRACTICE_NAV, { href: '/profile', label: 'Profile', icon: '👤' }, ...(isAdmin ? [{ href: '/admin', label: 'Admin', icon: '🛠️' }] : [])].map((item) => (
          <Link key={item.href} href={item.href} className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm hover:bg-slate-100">
            <span aria-hidden>{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </div>
    </details>
  );
}
