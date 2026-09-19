'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { motion, useScroll, useTransform } from 'framer-motion';

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });

  const y = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);

  return (
    <section ref={ref} className="relative flex h-[100svh] items-end overflow-hidden bg-ink">
      <motion.div style={{ scale }} className="absolute inset-0">
        <Image
          src="/images/real/tanktop-front.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="origin-bottom scale-[1.75] object-cover object-[50%_75%] opacity-70 sm:scale-100"
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_30%,rgba(183,155,106,0.14),transparent_55%)]" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/60 to-ink/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/70 via-transparent to-ink/30" />
      </motion.div>

      <motion.div style={{ y, opacity }} className="relative z-10 w-full px-5 pb-14 sm:px-8 sm:pb-20">
        <p className="mb-4 text-xs uppercase tracking-widest2 text-gold">NATTYSIMO — Chapter One</p>
        <h1 className="max-w-4xl font-display text-4xl leading-[1.05] sm:text-6xl md:text-7xl">
          Discipline
          <br />
          builds freedom.
        </h1>
        <p className="mt-6 max-w-md text-sm text-smoke sm:text-base">No one is watching. Keep going.</p>
      </motion.div>

      <div className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2 text-[10px] uppercase tracking-widest2 text-smoke sm:bottom-8">
        Scroll
      </div>
    </section>
  );
}
