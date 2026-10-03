'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect } from 'react';
import { useStore } from '@/lib/commerce/store';
import { formatPrice, DEFAULT_SHIPPING } from '@/lib/commerce/provider';
import { useLocale } from '@/lib/i18n/context';
import { useCopy } from '@/lib/i18n/copy';
import { shell } from '@/lib/i18n/copy/shell';
import { useWorlds } from '@/lib/i18n/useWorlds';
import { lineName, lineVariant } from '@/lib/i18n/cart';
import { Icon } from '@/components/ui/Icon';

const EASE = [0.16, 1, 0.3, 1] as const;

export function CartDrawer() {
  const { cartOpen, closeCart, lines, subtotalCents, setQuantity, removeLine, count } = useStore();
  const pathname = usePathname();
  const t = useCopy(shell);
  const WORLDS = useWorlds();
  const locale = useLocale();
  const rtl = locale === 'ar';
  const freeAbove = DEFAULT_SHIPPING.freeAboveCents ?? 0;
  const remaining = Math.max(freeAbove - subtotalCents, 0);

  useEffect(() => closeCart(), [pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!cartOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && closeCart();
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = original;
      window.removeEventListener('keydown', onKey);
    };
  }, [cartOpen, closeCart]);

  return (
    <AnimatePresence>
      {cartOpen && (
        <>
          <motion.button
            type="button"
            aria-label={t.cart.close}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label={t.cart.dialog}
            className="fixed inset-y-0 end-0 z-50 flex w-full max-w-[440px] flex-col border-s border-white/[0.07] bg-coal"
            initial={{ x: rtl ? '-100%' : '100%' }}
            animate={{ x: 0 }}
            exit={{ x: rtl ? '-100%' : '100%' }}
            transition={{ duration: 0.7, ease: EASE }}
          >
            <header className="flex h-16 items-center justify-between border-b border-white/[0.07] px-5">
              <p className="label">{t.cart.title(count)}</p>
              <button
                type="button"
                onClick={closeCart}
                className="-me-2 flex h-11 w-11 items-center justify-center"
                aria-label={t.cart.close}
              >
                <Icon name="close" />
              </button>
            </header>

            {lines.length > 0 && freeAbove > 0 && (
              <div className="border-b border-white/[0.07] px-5 py-4">
                <p className="text-xs text-mist">
                  {remaining > 0 ? (
                    <>{t.cart.freeAway(formatPrice(remaining, locale))}</>
                  ) : (
                    <span className="text-gold">{t.cart.freeUnlocked}</span>
                  )}
                </p>
                <div className="mt-3 h-px w-full bg-white/10">
                  <div
                    className="h-px bg-gold transition-[width] duration-700 ease-cinematic"
                    style={{ width: `${Math.min((subtotalCents / freeAbove) * 100, 100)}%` }}
                  />
                </div>
              </div>
            )}

            <div className="flex-1 overflow-y-auto overscroll-contain px-5">
              {lines.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-6 text-center">
                  <p className="font-display text-3xl">{t.cart.empty}</p>
                  <p className="max-w-[240px] text-sm text-mist">{t.cart.emptySub}</p>
                  <Link href="/shop" className="btn-solid" onClick={closeCart}>
                    {t.cart.shop}
                  </Link>
                </div>
              ) : (
                <ul className="divide-y divide-white/[0.07]">
                  {lines.map((line) => (
                    <li key={line.sku} className="flex gap-4 py-5">
                      <Link
                        href={
                          line.slug.startsWith('sets/') ? `/${line.slug}` : `/product/${line.slug}`
                        }
                        onClick={closeCart}
                        className="relative aspect-[4/5] w-24 shrink-0 overflow-hidden bg-graphite"
                      >
                        <Image src={line.image} alt="" fill sizes="96px" className="object-cover" />
                      </Link>
                      <div className="flex flex-1 flex-col">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="label text-accent" data-world={line.world}>
                              {WORLDS[line.world].name}
                            </p>
                            <p className="mt-1.5 text-sm">{lineName(line, locale)}</p>
                            <p className="mt-1 text-xs text-mist">{lineVariant(line, locale)}</p>
                          </div>
                          <p className="whitespace-nowrap text-sm tabular-nums">
                            {formatPrice(line.unitPriceCents * line.quantity, locale)}
                          </p>
                        </div>
                        <div className="mt-auto flex items-center justify-between pt-3">
                          <div className="flex items-center border border-white/10">
                            <button
                              type="button"
                              className="flex h-9 w-9 items-center justify-center"
                              onClick={() => setQuantity(line.sku, line.quantity - 1)}
                              aria-label={t.cart.decrease(lineName(line, locale))}
                            >
                              <Icon name="minus" className="h-3.5 w-3.5" />
                            </button>
                            <span className="w-6 text-center text-xs tabular-nums">
                              {line.quantity}
                            </span>
                            <button
                              type="button"
                              className="flex h-9 w-9 items-center justify-center"
                              onClick={() => setQuantity(line.sku, line.quantity + 1)}
                              aria-label={t.cart.increase(lineName(line, locale))}
                            >
                              <Icon name="plus" className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          <button
                            type="button"
                            className="text-[11px] uppercase tracking-[0.2em] text-mist underline-offset-4 hover:text-ivory hover:underline"
                            onClick={() => removeLine(line.sku)}
                          >
                            {t.cart.remove}
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {lines.length > 0 && (
              <footer className="safe-bottom border-t border-white/[0.07] px-5 pb-5 pt-5">
                <div className="flex items-baseline justify-between">
                  <p className="label text-mist">{t.cart.subtotal}</p>
                  <p className="text-lg tabular-nums">{formatPrice(subtotalCents, locale)}</p>
                </div>
                <p className="mt-1 text-xs text-fog">{t.cart.note}</p>
                <Link href="/checkout" onClick={closeCart} className="btn-solid mt-5 w-full">
                  {t.cart.checkout} <Icon name="arrow" className="h-4 w-4" />
                </Link>
              </footer>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
