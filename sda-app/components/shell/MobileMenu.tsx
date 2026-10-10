'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { signOut } from '@/app/login/actions';
import { t, type Lang } from '@/lib/i18n';
import { NavList } from './NavList';

/** Menü-Knopf und ausklappbare Navigation für schmale Bildschirme. */
export function MobileMenu({ lang, memberLabel }: { lang: Lang; memberLabel: string }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const closeRef = useRef<HTMLButtonElement>(null);
  const openRef = useRef<HTMLButtonElement>(null);

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const opener = openRef.current;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      opener?.focus();
    };
  }, [open]);

  return (
    <>
      <button
        ref={openRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={t(lang, 'menu')}
        className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-white/25 lg:hidden"
      >
        <svg
          viewBox="0 0 24 24"
          width="22"
          height="22"
          aria-hidden="true"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
      </button>
      {/* Portal auf <body>: sonst liegt das Menü in der Ebene der Kopfzeile und die untere Leiste verdeckt es. */}
      {open &&
        createPortal(
          <div className="fixed inset-0 z-50 lg:hidden">
            <button
              type="button"
              tabIndex={-1}
              aria-hidden="true"
              className="absolute inset-0 bg-black/50"
              onClick={() => setOpen(false)}
            />
            <div
              id="mobile-menu"
              role="dialog"
              aria-modal="true"
              aria-label={t(lang, 'mainNav')}
              className="absolute inset-y-0 start-0 flex w-[min(320px,85vw)] flex-col overflow-y-auto bg-anth p-3 pb-8 text-anth-ink"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="px-3 font-bold">{t(lang, 'menu')}</span>
                <button
                  ref={closeRef}
                  type="button"
                  onClick={() => setOpen(false)}
                  className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-white/25"
                  aria-label={t(lang, 'close')}
                >
                  <svg
                    viewBox="0 0 24 24"
                    width="20"
                    height="20"
                    aria-hidden="true"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M6 6l12 12M18 6L6 18" />
                  </svg>
                </button>
              </div>
              <nav aria-label={t(lang, 'mainNav')}>
                <NavList lang={lang} onNavigate={() => setOpen(false)} />
              </nav>
              <div className="mt-6 border-t border-white/15 px-3 pt-4">
                <p className="mb-2 text-sm opacity-80">{memberLabel}</p>
                <form action={signOut}>
                  <button
                    type="submit"
                    className="min-h-11 w-full rounded-lg border border-white/25 px-3"
                  >
                    {t(lang, 'signOut')}
                  </button>
                </form>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
