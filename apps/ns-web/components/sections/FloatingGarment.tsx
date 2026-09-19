'use client';

import { useRef } from 'react';
import Link from 'next/link';
import {
  motion,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
} from 'framer-motion';
import { PlaceholderArt } from '@/components/ui/PlaceholderArt';
import { getProductBySlug, formatPrice } from '@/data/products';

const product = getProductBySlug('ns-essential-tee')!;

export function FloatingGarment() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end end'] });
  const scale = useTransform(scrollYProgress, [0, 0.6, 1], [0.75, 1, 2.4]);
  const closerOpacity = useTransform(scrollYProgress, [0.15, 0.35, 0.6], [0, 1, 0]);
  const detailOpacity = useTransform(scrollYProgress, [0.75, 0.95], [0, 1]);

  const rotateX = useSpring(useMotionValue(0), { stiffness: 120, damping: 20 });
  const rotateY = useSpring(useMotionValue(0), { stiffness: 120, damping: 20 });

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const bounds = stageRef.current?.getBoundingClientRect();
    if (!bounds) return;
    const relativeX = (event.clientX - bounds.left) / bounds.width - 0.5;
    const relativeY = (event.clientY - bounds.top) / bounds.height - 0.5;
    rotateY.set(relativeX * 16);
    rotateX.set(relativeY * -16);
  }

  function handlePointerLeave() {
    rotateX.set(0);
    rotateY.set(0);
  }

  return (
    <section ref={sectionRef} className="relative h-[260vh] bg-ink">
      <div className="sticky top-0 flex h-[100svh] flex-col items-center justify-center overflow-hidden">
        <motion.p
          style={{ opacity: closerOpacity }}
          className="absolute top-16 text-xs uppercase tracking-widest2 text-gold sm:top-24"
        >
          Look closer
        </motion.p>

        <div
          ref={stageRef}
          onPointerMove={handlePointerMove}
          onPointerLeave={handlePointerLeave}
          className="[perspective:1000px]"
        >
          <motion.div
            style={{ scale, rotateX, rotateY }}
            className="relative h-[46vh] w-[64vw] max-w-md [transform-style:preserve-3d]"
          >
            <PlaceholderArt category={product.category} className="h-full w-full" />
          </motion.div>
        </div>

        <motion.div
          style={{ opacity: detailOpacity }}
          className="absolute bottom-14 flex flex-col items-center gap-3 text-center sm:bottom-20"
        >
          <h3 className="font-display text-2xl sm:text-3xl">{product.name}</h3>
          <p className="text-sm text-smoke">{formatPrice(product.priceCents)}</p>
          <Link
            href={`/product/${product.slug}`}
            className="mt-2 border border-bone/40 px-6 py-3 text-xs uppercase tracking-widest2 transition hover:border-gold hover:text-gold"
          >
            View Product
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
