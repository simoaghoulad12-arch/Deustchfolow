'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { PlaceholderArt } from '@/components/ui/PlaceholderArt';
import { getProductBySlug } from '@/data/products';

const product = getProductBySlug('ns-hoodie-premium')!;

const LABELS = [
  { text: 'NS LOGO', range: [0.15, 0.35] as const },
  { text: 'STITCHING', range: [0.4, 0.6] as const },
  { text: 'FABRIC', range: [0.65, 0.85] as const },
];

export function LightScanReveal() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });

  const beamX = useTransform(scrollYProgress, [0, 1], ['-20%', '120%']);

  return (
    <section ref={ref} className="relative h-[220vh] bg-void">
      <div className="sticky top-0 flex h-[100svh] items-center justify-center overflow-hidden">
        <div className="relative h-[55vh] w-[70vw] max-w-lg">
          <PlaceholderArt category={product.category} className="h-full w-full" showLabel={false} />

          <motion.div
            style={{ left: beamX }}
            className="pointer-events-none absolute top-0 h-full w-24 -translate-x-1/2 bg-gradient-to-r from-transparent via-gold/40 to-transparent mix-blend-screen"
          />

          {LABELS.map((label) => (
            <ScanLabel key={label.text} text={label.text} progress={scrollYProgress} range={label.range} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ScanLabel({
  text,
  progress,
  range,
}: {
  text: string;
  progress: ReturnType<typeof useScroll>['scrollYProgress'];
  range: readonly [number, number];
}) {
  const opacity = useTransform(progress, [range[0], range[0] + 0.05, range[1] - 0.05, range[1]], [0, 1, 1, 0]);
  const y = useTransform(progress, [range[0], range[1]], [10, -10]);

  return (
    <motion.span
      style={{ opacity, y }}
      className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs uppercase tracking-widest2 text-gold"
    >
      {text}
    </motion.span>
  );
}
