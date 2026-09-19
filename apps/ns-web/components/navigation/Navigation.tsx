'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { Logo } from '@/components/brand/Logo';
import { useCart } from '@/lib/cart-context';

const MENU_LINKS = [
  { href: '/shop', label: 'SHOP' },
  { href: '/#lookbook', label: 'COLLECTION' },
  { href: '/about', label: 'ABOUT' },
  { href: '/#journal', label: 'JOURNAL' },
  { href: '/#contact', label: 'CONTACT' },
];

export function Navigation() {
  const [menuOpen, setMenuOpen] = useState(false);
  const cart = useCart();

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-30 flex items-center justify-between px-5 py-4 sm:px-8 sm:py-6">
        <Link href="/" aria-label="NS home" className="h-7 w-7 text-bone transition hover:text-gold sm:h-8 sm:w-8">
          <Logo />
        </Link>
        <div className="flex items-center gap-5 text-xs uppercase tracking-widest2 sm:gap-8">
          <button
            onClick={cart.open}
            className="transition hover:text-gold"
            aria-label={`Open bag, ${cart.count} items`}
          >
            Bag {cart.count > 0 ? `(${cart.count})` : ''}
          </button>
          <button
            onClick={() => setMenuOpen(true)}
            className="transition hover:text-gold"
            aria-haspopup="true"
            aria-expanded={menuOpen}
          >
            Menu
          </button>
        </div>
      </header>

      <AnimatePresence>
        {menuOpen ? (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Site menu"
            className="fixed inset-0 z-40 flex flex-col justify-between bg-ink px-6 py-6 sm:px-12 sm:py-10"
            initial={{ clipPath: 'circle(0% at 100% 0%)' }}
            animate={{ clipPath: 'circle(150% at 100% 0%)' }}
            exit={{ clipPath: 'circle(0% at 100% 0%)' }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex items-center justify-between">
              <span className="h-7 w-7 text-bone">
                <Logo />
              </span>
              <button
                onClick={() => setMenuOpen(false)}
                aria-label="Close menu"
                className="text-xs uppercase tracking-widest2 transition hover:text-gold"
              >
                Close
              </button>
            </div>

            <nav className="flex flex-col gap-2">
              {MENU_LINKS.map((link, index) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + index * 0.06, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className="font-display text-4xl transition hover:text-gold sm:text-6xl"
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
            </nav>

            <p className="text-xs uppercase tracking-widest2 text-smoke">Discipline builds freedom.</p>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
