'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { PlaceholderArt } from '@/components/ui/PlaceholderArt';
import { products, formatPrice, type ProductCategory } from '@/data/products';

const FEATURED_CATEGORIES: ProductCategory[] = ['tee', 'hoodie', 'shorts', 'pants'];
const runwayProducts = FEATURED_CATEGORIES.map(
  (category) => products.find((product) => product.category === category)!
);

export function HorizontalRunway() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  const x = useTransform(scrollYProgress, [0, 1], ['0%', `-${(runwayProducts.length - 1) * 100}%`]);

  return (
    <section ref={ref} className="relative h-[400vh] bg-ink">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <p className="absolute left-5 top-16 z-10 text-xs uppercase tracking-widest2 text-gold sm:left-8 sm:top-24">
          The Collection
        </p>
        <motion.div style={{ x }} className="flex h-full">
          {runwayProducts.map((product) => (
            <Link
              key={product.slug}
              href={`/product/${product.slug}`}
              className="group relative flex h-full w-full flex-shrink-0 flex-col justify-end p-6 sm:p-12"
            >
              <PlaceholderArt category={product.category} className="absolute inset-0" />
              <div className="relative z-10 max-w-sm">
                <h3 className="font-display text-3xl transition group-hover:text-gold sm:text-5xl">
                  {product.name}
                </h3>
                <p className="mt-2 text-sm text-smoke">{formatPrice(product.priceCents)}</p>
              </div>
            </Link>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
