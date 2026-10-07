'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function LearnNav({
  items,
  variant,
}: {
  items: { href: string; label: string; icon: string }[];
  variant: 'top' | 'bottom';
}) {
  const path = usePathname();
  const active = (href: string) =>
    href === '/lernen'
      ? path === '/lernen' || path.startsWith('/lernen/modul')
      : path.startsWith(href);
  if (variant === 'top') {
    return (
      <nav aria-label="Lern-App" className="mx-auto flex max-w-4xl gap-1 px-4">
        {items.map((i) => (
          <Link
            key={i.href}
            href={i.href}
            aria-current={active(i.href) ? 'page' : undefined}
            className="inline-flex min-h-11 items-center border-b-2 border-transparent px-3 text-sm aria-[current=page]:border-red aria-[current=page]:font-semibold"
          >
            {i.label}
          </Link>
        ))}
      </nav>
    );
  }
  return (
    <nav
      aria-label="Lern-App"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-panel pb-[env(safe-area-inset-bottom)]"
    >
      <ul className="grid grid-cols-4">
        {items.map((i) => (
          <li key={i.href}>
            <Link
              href={i.href}
              aria-current={active(i.href) ? 'page' : undefined}
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
                <path d={i.icon} />
              </svg>
              {i.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
