'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { products } from '@/lib/commerce/catalog';
import { ProductCard } from '@/components/product/ProductCard';
import { Reveal } from '@/components/motion/Reveal';
import { Icon } from '@/components/ui/Icon';
import { useLocale } from '@/lib/i18n/context';
import { useCopy } from '@/lib/i18n/copy';
import { home } from '@/lib/i18n/copy/home';

/**
 * COLLECTION 01 runway.
 * Desktop: the section pins and vertical scroll drives the product rail
 * sideways. Phones: a native swipe rail with snap points — faster and more
 * natural under a thumb than scroll-jacking.
 */
export function Collection() {
  const t = useCopy(home).collection;
  const rtl = useLocale() === 'ar';
  const section = useRef<HTMLElement>(null);
  const rail = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const [distance, setDistance] = useState(0);

  useEffect(() => {
    const measure = () => {
      const el = rail.current;
      if (!el) return;
      setDistance(Math.max(el.scrollWidth - window.innerWidth + 64, 0));
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  const { scrollYProgress } = useScroll({ target: section, offset: ['start start', 'end end'] });
  // The rail starts at the right edge in Arabic, so it travels the other way.
  const x = useTransform(scrollYProgress, [0, 1], [0, rtl ? distance : -distance]);
  const progress = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

  const header = (
    <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="label text-mist">{t.eyebrow(products.length)}</p>
        <h2 id="collection-title" className="mt-5 font-display text-5xl leading-none sm:text-7xl">
          {t.title}
        </h2>
      </div>
      <Link
        href="/shop"
        className="label inline-flex items-center gap-3 text-ivory/80 hover:text-gold"
      >
        {t.viewAll} <Icon name="arrow" className="h-4 w-4" />
      </Link>
    </div>
  );

  return (
    <>
      {/* Phones & tablets */}
      <section className="bg-coal py-24 lg:hidden" aria-labelledby="collection-title">
        <Reveal className="px-5 sm:px-8">{header}</Reveal>
        <div className="no-scrollbar mt-10 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-5 px-5 pb-2 sm:scroll-px-8 sm:px-8">
          {products.map((p, i) => (
            <div key={p.slug} className="w-[72vw] max-w-[320px] shrink-0 snap-start">
              <ProductCard product={p} index={i} sizes="72vw" />
            </div>
          ))}
          <Link
            href="/shop"
            className="flex w-[50vw] max-w-[240px] shrink-0 snap-start flex-col items-center justify-center gap-4 border border-white/10 text-center"
          >
            <span className="font-display text-3xl">{t.viewAll}</span>
            <span className="label text-mist">{t.title}</span>
          </Link>
        </div>
      </section>

      {/* Desktop */}
      <section
        ref={section}
        className="relative hidden bg-coal lg:block"
        style={{ height: reduce ? 'auto' : `calc(100vh + ${distance}px)` }}
        aria-labelledby="collection-title-lg"
      >
        <div
          className={
            reduce ? 'py-24' : 'sticky top-0 flex h-screen flex-col justify-center overflow-hidden'
          }
        >
          <div className="mx-auto w-full max-w-[1600px] px-8">
            <div className="flex items-end justify-between">
              <div>
                <p className="label text-mist">{t.eyebrow(products.length)}</p>
                <h2
                  id="collection-title-lg"
                  className="mt-5 font-display text-7xl leading-none xl:text-8xl"
                >
                  {t.title}
                </h2>
              </div>
              <Link
                href="/shop"
                className="label inline-flex items-center gap-3 text-ivory/80 hover:text-gold"
              >
                {t.viewAll} <Icon name="arrow" className="h-4 w-4" />
              </Link>
            </div>
          </div>
          <motion.div
            ref={rail}
            style={reduce ? undefined : { x }}
            className={`mt-12 flex gap-5 px-8 ${reduce ? 'overflow-x-auto' : ''}`}
          >
            {products.map((p, i) => (
              <div key={p.slug} className="w-[22vw] min-w-[260px] max-w-[340px] shrink-0">
                <ProductCard product={p} index={i} sizes="22vw" />
              </div>
            ))}
          </motion.div>
          {!reduce && (
            <div className="mx-auto mt-12 w-full max-w-[1600px] px-8">
              <div className="h-px w-full bg-white/10">
                <motion.div className="h-px bg-gold" style={{ width: progress }} />
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
