'use client';

import Link from 'next/link';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';
import { products } from '@/lib/commerce/catalog';
import { SETS, setTitle } from '@/lib/commerce/sets';
import { formatPrice } from '@/lib/commerce/provider';
import { WORLDS, WORLD_ORDER } from '@/lib/brand';
import { Icon } from '@/components/ui/Icon';

type Result = { href: string; title: string; meta: string; image?: string; price?: number };

const INDEX: (Result & { text: string })[] = [
  ...products.map((p) => ({
    href: `/product/${p.slug}`,
    title: p.name,
    meta: `${WORLDS[p.world].name} · ${p.line}`,
    image: p.images[0].src,
    price: p.price.amountCents,
    text: [p.name, p.line, p.category, WORLDS[p.world].name, p.story, ...p.details]
      .join(' ')
      .toLowerCase(),
  })),
  ...SETS.map((s) => ({
    href: `/sets/${s.slug}`,
    title: setTitle(s),
    meta: s.tagline,
    image: s.image.src,
    price: s.priceCents,
    text: [s.name, 'set bundle look', s.tagline, s.story].join(' ').toLowerCase(),
  })),
  ...WORLD_ORDER.map((id) => ({
    href: `/worlds/${id}`,
    title: `NATYSIMO ${WORLDS[id].name}`,
    meta: WORLDS[id].descriptor,
    text: [WORLDS[id].name, WORLDS[id].descriptor, WORLDS[id].intro, 'world']
      .join(' ')
      .toLowerCase(),
  })),
];

const SUGGESTIONS = ['Tank', 'Shorts', 'Hoodie', 'Set', 'Bag', 'Sports'];

export function SearchOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [q, setQ] = useState('');
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setQ('');
    const t = window.setTimeout(() => input.current?.focus(), 80);
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.clearTimeout(t);
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = original;
    };
  }, [open, onClose]);

  const results = useMemo(() => {
    const terms = q.toLowerCase().trim().split(/\s+/).filter(Boolean);
    if (terms.length === 0) return [];
    return INDEX.filter((r) => terms.every((t) => r.text.includes(t))).slice(0, 8);
  }, [q]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="Search"
          className="fixed inset-0 z-[55] flex flex-col bg-ink/[0.97] backdrop-blur-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
        >
          <div className="mx-auto flex w-full max-w-3xl items-center gap-3 border-b border-white/10 px-5 pb-4 pt-5 sm:pt-10">
            <label htmlFor="site-search" className="sr-only">
              Search NATYSIMO
            </label>
            <input
              id="site-search"
              ref={input}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search pieces, sets, worlds"
              className="h-14 flex-1 bg-transparent font-display text-3xl text-ivory placeholder:text-fog focus:outline-none sm:text-4xl"
              autoComplete="off"
              enterKeyHint="search"
            />
            <button
              type="button"
              onClick={onClose}
              className="-mr-2 flex h-11 w-11 items-center justify-center"
              aria-label="Close search"
            >
              <Icon name="close" />
            </button>
          </div>

          <div className="mx-auto w-full max-w-3xl flex-1 overflow-y-auto px-5 py-6">
            {q.trim() === '' ? (
              <div className="flex flex-wrap gap-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setQ(s)}
                    className="label border border-white/15 px-4 py-3 text-ivory/80 hover:border-ivory"
                  >
                    {s}
                  </button>
                ))}
              </div>
            ) : results.length === 0 ? (
              <p className="text-sm text-mist">Nothing for “{q}”. Try “tank”, “set” or “hoodie”.</p>
            ) : (
              <ul className="divide-y divide-white/[0.07]" aria-live="polite">
                {results.map((r) => (
                  <li key={r.href}>
                    <Link href={r.href} onClick={onClose} className="flex items-center gap-4 py-4">
                      <span className="relative h-16 w-12 shrink-0 overflow-hidden bg-graphite">
                        {r.image && (
                          <Image src={r.image} alt="" fill sizes="48px" className="object-cover" />
                        )}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm">{r.title}</span>
                        <span className="mt-1 block truncate text-xs text-mist">{r.meta}</span>
                      </span>
                      {r.price !== undefined && (
                        <span className="text-sm tabular-nums">{formatPrice(r.price)}</span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
