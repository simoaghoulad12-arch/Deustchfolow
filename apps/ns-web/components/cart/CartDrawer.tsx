'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useCart } from '@/lib/cart-context';
import { formatPrice } from '@/data/products';
import { ProductVisual } from '@/components/product/ProductVisual';
import { getProductBySlug } from '@/data/products';

export function CartDrawer() {
  const { isOpen, close, lines, subtotalCents, setQuantity, removeLine } = useCart();
  const [confirmed, setConfirmed] = useState(false);

  return (
    <AnimatePresence>
      {isOpen ? (
        <>
          <motion.button
            aria-label="Close bag"
            className="fixed inset-0 z-40 bg-void/70"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
          />
          <motion.aside
            role="dialog"
            aria-label="Shopping bag"
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-ink"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex items-center justify-between border-b border-stone/20 px-6 py-5">
              <h2 className="font-display text-lg tracking-wide">BAG ({lines.length})</h2>
              <button
                onClick={close}
                aria-label="Close"
                className="text-smoke transition hover:text-bone"
              >
                CLOSE
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4">
              {lines.length === 0 ? (
                <p className="mt-12 text-center text-sm text-smoke">Your bag is empty.</p>
              ) : (
                <ul className="space-y-6">
                  {lines.map((line) => {
                    const product = getProductBySlug(line.slug);
                    return (
                      <li key={`${line.slug}-${line.color}-${line.size}`} className="flex gap-4">
                        <div className="relative h-24 w-20 flex-shrink-0 overflow-hidden">
                          <ProductVisual
                            src={line.image}
                            alt={line.name}
                            category={product?.category ?? 'tee'}
                            sizes="80px"
                          />
                        </div>
                        <div className="flex flex-1 flex-col justify-between">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="text-sm font-medium">{line.name}</p>
                              <p className="text-xs text-smoke">
                                {line.color} / {line.size}
                              </p>
                            </div>
                            <p className="text-sm">{formatPrice(line.priceCents * line.quantity)}</p>
                          </div>
                          <div className="flex items-center gap-3 text-xs">
                            <button
                              className="h-6 w-6 border border-stone/30 transition hover:border-gold"
                              onClick={() =>
                                setQuantity(line.slug, line.color, line.size, line.quantity - 1)
                              }
                              aria-label={`Decrease quantity of ${line.name}`}
                            >
                              −
                            </button>
                            <span>{line.quantity}</span>
                            <button
                              className="h-6 w-6 border border-stone/30 transition hover:border-gold"
                              onClick={() =>
                                setQuantity(line.slug, line.color, line.size, line.quantity + 1)
                              }
                              aria-label={`Increase quantity of ${line.name}`}
                            >
                              +
                            </button>
                            <button
                              className="ml-auto text-smoke underline-offset-4 transition hover:text-bone hover:underline"
                              onClick={() => removeLine(line.slug, line.color, line.size)}
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <div className="border-t border-stone/20 px-6 py-6">
              <div className="mb-4 flex items-center justify-between text-sm">
                <span className="text-smoke">Subtotal</span>
                <span className="font-medium">{formatPrice(subtotalCents)}</span>
              </div>
              {confirmed ? (
                <p className="text-center text-xs uppercase tracking-widest2 text-gold">
                  Order simulated — checkout provider not yet connected
                </p>
              ) : (
                <button
                  disabled={lines.length === 0}
                  className="w-full bg-bone py-4 text-xs uppercase tracking-widest2 text-ink transition hover:bg-gold disabled:cursor-not-allowed disabled:opacity-30"
                  onClick={() => setConfirmed(true)}
                >
                  Checkout
                </button>
              )}
            </div>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}
