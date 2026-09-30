'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Mark } from '@/components/brand/Mark';
import { useStore } from '@/lib/commerce/store';
import { BRAND, SOCIAL, WORLDS, WORLD_ORDER } from '@/lib/brand';
import { cn } from '@/lib/cn';
import { Icon } from '@/components/ui/Icon';

const EASE = [0.16, 1, 0.3, 1] as const;

const PRIMARY = [
  { href: '/shop', label: 'Collection 01' },
  ...WORLD_ORDER.map((id) => ({ href: `/worlds/${id}`, label: WORLDS[id].name })),
  { href: '/story', label: 'Story' },
];

export function SiteHeader() {
  const pathname = usePathname();
  const { scrollY } = useScroll();
  const [solid, setSolid] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { count, openCart, wishlist } = useStore();

  useMotionValueEvent(scrollY, 'change', (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setSolid(y > 40);
    setHidden(y > 480 && y > prev && !menuOpen);
  });

  useEffect(() => setMenuOpen(false), [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenuOpen(false);
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = original;
      window.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  useEffect(() => {
    const open = () => setMenuOpen(true);
    window.addEventListener('natysimo:open-menu', open);
    return () => window.removeEventListener('natysimo:open-menu', open);
  }, []);

  return (
    <>
      <motion.header
        className={cn(
          'fixed inset-x-0 top-0 z-40 transition-[background-color,backdrop-filter,border-color] duration-700 ease-cinematic',
          solid ? 'border-b border-white/[0.06] bg-ink/80 backdrop-blur-xl' : 'border-b border-transparent bg-transparent'
        )}
        animate={{ y: hidden ? '-100%' : '0%' }}
        transition={{ duration: 0.6, ease: EASE }}
      >
        <div className="mx-auto grid h-16 max-w-[1600px] grid-cols-[1fr_auto_1fr] items-center px-4 sm:h-[72px] sm:px-8">
          <div className="flex items-center gap-8">
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className="-ml-2 flex h-11 w-11 items-center justify-center lg:hidden"
              aria-label="Open menu"
              aria-expanded={menuOpen}
            >
              <Icon name="menu" />
            </button>
            <nav aria-label="Primary" className="hidden items-center gap-8 lg:flex">
              {PRIMARY.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'label text-ivory/70 transition-colors hover:text-ivory',
                    pathname.startsWith(item.href) && 'text-ivory'
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          <Link href="/" aria-label="NATYSIMO — home" className="flex items-center gap-3">
            <span className="block w-7 sm:w-8">
              <Mark priority sizes="32px" alt="" />
            </span>
            <span className="font-display text-[15px] tracking-wide2 text-ivory sm:text-base">{BRAND.name}</span>
          </Link>

          <div className="flex items-center justify-end gap-1 sm:gap-3">
            <Link href="/wishlist" className="relative hidden h-11 w-11 items-center justify-center sm:flex" aria-label={`Wishlist, ${wishlist.length} saved`}>
              <Icon name="heart" />
              {wishlist.length > 0 && <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-gold" />}
            </Link>
            <Link href="/account" className="hidden h-11 w-11 items-center justify-center sm:flex" aria-label="Account">
              <Icon name="user" />
            </Link>
            <button type="button" onClick={openCart} className="-mr-2 flex h-11 min-w-11 items-center justify-center gap-2 px-2" aria-label={`Open bag, ${count} items`}>
              <Icon name="bag" />
              <span className="label tabular-nums text-ivory/80">{count}</span>
            </button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            className="fixed inset-0 z-50 flex flex-col bg-ink"
            initial={{ clipPath: 'inset(0 0 100% 0)' }}
            animate={{ clipPath: 'inset(0 0 0% 0)' }}
            exit={{ clipPath: 'inset(0 0 100% 0)' }}
            transition={{ duration: 0.8, ease: EASE }}
          >
            <div className="flex h-16 items-center justify-between px-4">
              <span className="w-7">
                <Mark sizes="28px" alt="" />
              </span>
              <button type="button" onClick={() => setMenuOpen(false)} className="-mr-2 flex h-11 w-11 items-center justify-center" aria-label="Close menu">
                <Icon name="close" />
              </button>
            </div>

            <nav aria-label="Menu" className="flex flex-1 flex-col justify-center px-6">
              <Link href="/shop" className="group border-b border-white/[0.07] py-5">
                <MenuLine index="00" label="Collection 01" delay={0.2} />
              </Link>
              {WORLD_ORDER.map((id, i) => (
                <Link key={id} href={`/worlds/${id}`} data-world={id} className="group flex items-center justify-between border-b border-white/[0.07] py-5">
                  <MenuLine index={WORLDS[id].index} label={WORLDS[id].name} delay={0.26 + i * 0.06} sub={WORLDS[id].descriptor} />
                  <motion.span
                    className="w-10"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 + i * 0.06, duration: 0.8, ease: EASE }}
                  >
                    <Mark world={id} sizes="40px" alt="" />
                  </motion.span>
                </Link>
              ))}
              <Link href="/story" className="group py-5">
                <MenuLine index="04" label="Story" delay={0.44} />
              </Link>
            </nav>

            <div className="safe-bottom grid grid-cols-3 border-t border-white/[0.07] text-center">
              <Link href="/wishlist" className="label py-5 text-ivory/70">
                Wishlist
              </Link>
              <Link href="/account" className="label border-x border-white/[0.07] py-5 text-ivory/70">
                Account
              </Link>
              <a href={SOCIAL.instagram} target="_blank" rel="noreferrer" className="label py-5 text-ivory/70">
                Instagram
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function MenuLine({ index, label, delay, sub }: { index: string; label: string; delay: number; sub?: string }) {
  return (
    <span className="block overflow-hidden">
      <motion.span
        className="flex items-baseline gap-4"
        initial={{ y: '110%' }}
        animate={{ y: '0%' }}
        transition={{ delay, duration: 0.9, ease: EASE }}
      >
        <span className="label text-accent">{index}</span>
        <span>
          <span className="block font-display text-[2.6rem] leading-none text-ivory transition-colors group-hover:text-accent">{label}</span>
          {sub && <span className="label mt-2 block text-mist">{sub}</span>}
        </span>
      </motion.span>
    </span>
  );
}
