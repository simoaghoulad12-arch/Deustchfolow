'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

export function BrandStatement() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });

  const disciplineOpacity = useTransform(scrollYProgress, [0, 0.35, 0.5], [1, 1, 0]);
  const disciplineScale = useTransform(scrollYProgress, [0, 0.5], [1, 1.4]);
  const disciplineTracking = useTransform(scrollYProgress, [0, 0.5], [0, 0.4]);

  const freedomOpacity = useTransform(scrollYProgress, [0.5, 0.65, 1], [0, 1, 1]);
  const freedomScale = useTransform(scrollYProgress, [0.5, 1], [0.85, 1]);

  return (
    <section ref={ref} className="relative h-[220vh] bg-ink">
      <div className="sticky top-0 flex h-[100svh] items-center justify-center overflow-hidden px-6 text-center">
        <motion.h2
          style={{ opacity: disciplineOpacity, scale: disciplineScale, letterSpacing: disciplineTracking }}
          className="absolute font-display text-[15vw] uppercase leading-none sm:text-[11vw]"
        >
          Discipline
        </motion.h2>
        <motion.h2
          style={{ opacity: freedomOpacity, scale: freedomScale }}
          className="absolute font-display text-[15vw] uppercase leading-none text-gold sm:text-[11vw]"
        >
          Freedom
        </motion.h2>
      </div>
    </section>
  );
}
