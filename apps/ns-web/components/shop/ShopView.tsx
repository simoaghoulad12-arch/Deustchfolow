'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { products } from '@/lib/commerce/catalog';
import { WORLD_ORDER, isWorldId, type WorldId } from '@/lib/brand';
import { useWorlds } from '@/lib/i18n/useWorlds';
import { useCopy } from '@/lib/i18n/copy';
import { home } from '@/lib/i18n/copy/home';
import { ProductCard } from '@/components/product/ProductCard';
import { cn } from '@/lib/cn';

type Filter = 'all' | WorldId;

export function ShopView() {
  const t = useCopy(home).shop;
  const WORLDS = useWorlds();
  const [filter, setFilter] = useState<Filter>('all');

  // Deep links from Instagram: /shop?world=sports
  useEffect(() => {
    const w = new URLSearchParams(window.location.search).get('world');
    if (w && isWorldId(w)) setFilter(w);
  }, []);

  const select = (f: Filter) => {
    setFilter(f);
    const url = f === 'all' ? '/shop' : `/shop?world=${f}`;
    window.history.replaceState(null, '', url);
  };

  const list = filter === 'all' ? products : products.filter((p) => p.world === filter);

  return (
    <div data-world={filter === 'all' ? 'hybrid' : filter}>
      <div className="sticky top-16 z-20 -mx-5 border-b border-white/[0.07] bg-ink/85 px-5 backdrop-blur-xl sm:top-[72px] sm:-mx-8 sm:px-8">
        <div
          className="no-scrollbar flex gap-6 overflow-x-auto sm:gap-10"
          role="tablist"
          aria-label={t.filterAria}
        >
          {(['all', ...WORLD_ORDER] as Filter[]).map((f) => {
            const count =
              f === 'all' ? products.length : products.filter((p) => p.world === f).length;
            return (
              <button
                key={f}
                role="tab"
                type="button"
                aria-selected={filter === f}
                onClick={() => select(f)}
                className={cn(
                  'label relative shrink-0 py-5 transition-colors',
                  filter === f ? 'text-ivory' : 'text-fog hover:text-ivory/80',
                )}
              >
                {f === 'all' ? t.all : WORLDS[f].name}
                <sup className="ms-1 text-[8px] text-fog">{count}</sup>
                {filter === f && (
                  <motion.span
                    layoutId="shop-tab"
                    className="absolute inset-x-0 bottom-0 h-px bg-accent"
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.p
          key={filter}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="mt-8 max-w-xl text-sm leading-relaxed text-mist"
        >
          {filter === 'all' ? t.intro(products.length) : WORLDS[filter].intro}
        </motion.p>
      </AnimatePresence>

      <motion.div
        layout
        className="mt-10 grid grid-cols-2 gap-x-3 gap-y-12 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-5"
      >
        <AnimatePresence mode="popLayout">
          {list.map((p, i) => (
            <motion.div
              key={p.slug}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 0.6,
                delay: Math.min(i * 0.04, 0.3),
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <ProductCard
                product={p}
                index={products.indexOf(p)}
                priority={i < 4}
                sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
