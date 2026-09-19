import Link from 'next/link';
import { Logo } from '@/components/brand/Logo';

const COLUMNS = [
  {
    heading: 'Shop',
    links: [
      { href: '/shop', label: 'All Products' },
      { href: '/#lookbook', label: 'Collection' },
    ],
  },
  {
    heading: 'NS',
    links: [
      { href: '/about', label: 'About' },
      { href: '/#journal', label: 'Journal' },
      { href: '/#contact', label: 'Contact' },
    ],
  },
];

const MANIFESTO = ['Train', 'Grow', 'Evolve', 'NS'];

export function Footer() {
  return (
    <footer id="contact" className="relative overflow-hidden bg-void px-5 pb-10 pt-24 sm:px-8 sm:pt-32">
      <div className="pointer-events-none absolute -top-20 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-gold/10 blur-3xl" />

      <div className="relative flex flex-col gap-12 sm:flex-row sm:justify-between">
        <div className="max-w-sm">
          <span className="block h-10 w-10">
            <Logo />
          </span>
          <p className="mt-4 text-xs uppercase tracking-widest2 text-smoke">Nattysimo</p>
          <p className="mt-3 font-display text-2xl sm:text-3xl">Discipline builds freedom.</p>
        </div>

        <div className="flex gap-16">
          {COLUMNS.map((column) => (
            <div key={column.heading}>
              <p className="mb-4 text-xs uppercase tracking-widest2 text-smoke">{column.heading}</p>
              <ul className="space-y-2">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm transition hover:text-gold">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <p className="mb-4 text-xs uppercase tracking-widest2 text-smoke">Manifesto</p>
            <ul className="space-y-2">
              {MANIFESTO.map((word) => (
                <li key={word} className="text-sm uppercase tracking-widest2 text-smoke">
                  {word}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="relative mt-20 flex flex-col items-start justify-between gap-4 border-t border-stone/20 pt-6 text-xs text-smoke sm:flex-row sm:items-center">
        <p>© {new Date().getFullYear()} Nattysimo. All rights reserved.</p>
        <a
          href="https://instagram.com"
          target="_blank"
          rel="noreferrer"
          className="uppercase tracking-widest2 transition hover:text-gold"
        >
          Instagram
        </a>
      </div>
    </footer>
  );
}
