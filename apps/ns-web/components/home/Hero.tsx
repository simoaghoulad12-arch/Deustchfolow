'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { Mark } from '@/components/brand/Mark';
import { BRAND } from '@/lib/brand';
import { useCopy } from '@/lib/i18n/copy';
import { home } from '@/lib/i18n/copy/home';
import { Icon } from '@/components/ui/Icon';

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * First five seconds: black → the photograph breathes in → the gold crown
 * monogram rises with a light sweep → NATYSIMO → the promise. Everything is
 * in the first viewport on an iPhone; nothing waits on a splash screen.
 */
export function Hero() {
  const t = useCopy(home);
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const imgY = useTransform(scrollYProgress, [0, 1], ['0%', '18%']);
  const contentY = useTransform(scrollYProgress, [0, 1], ['0%', '-30%']);
  const fade = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  const rise = (delay: number) => ({
    initial: reduce ? false : { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 1.3, delay, ease: EASE },
  });

  return (
    <section
      ref={ref}
      className="relative h-[100svh] min-h-[640px] overflow-hidden bg-ink"
      aria-label={t.hero.label}
    >
      <motion.div className="absolute inset-0" style={reduce ? undefined : { y: imgY }}>
        <motion.div
          className="absolute inset-0"
          initial={reduce ? false : { opacity: 0, scale: 1.12 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 2.6, ease: EASE }}
        >
          <Image
            src="/images/photo/gym-tank-mirror.jpg"
            alt={t.hero.alt}
            fill
            priority
            sizes="100vw"
            className="object-cover object-[50%_35%] grayscale-[0.55] brightness-[0.62] contrast-[1.12] lg:object-[50%_30%]"
          />
        </motion.div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_75%_55%_at_50%_58%,transparent_0%,rgba(6,6,6,0.55)_60%,#060606_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-ink via-ink/80 to-transparent" />
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-ink/80 to-transparent" />
      </motion.div>

      <motion.div
        style={reduce ? undefined : { y: contentY, opacity: fade }}
        className="relative z-10 flex h-full flex-col items-center justify-end px-5 pb-[calc(6.5rem+env(safe-area-inset-bottom))] text-center sm:pb-24 lg:pb-20"
      >
        <motion.div
          className="relative w-[84px] overflow-hidden sm:w-[104px]"
          initial={reduce ? false : { opacity: 0, y: 30, filter: 'blur(8px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 1.6, delay: 0.5, ease: EASE }}
        >
          <Mark priority sizes="104px" alt={t.hero.markAlt} />
          <span
            aria-hidden
            className="pointer-events-none absolute inset-y-0 left-0 w-1/2 animate-sheen bg-gradient-to-r from-transparent via-white/25 to-transparent mix-blend-overlay [animation-delay:1.4s]"
          />
        </motion.div>

        <h1 className="mt-7 overflow-hidden">
          <motion.span
            data-latin
            className="block font-display text-[2.9rem] font-medium leading-none tracking-[0.22em] text-ivory sm:text-7xl lg:text-8xl"
            initial={reduce ? false : { y: '110%' }}
            animate={{ y: '0%' }}
            transition={{ duration: 1.4, delay: 0.9, ease: EASE }}
          >
            {BRAND.name}
          </motion.span>
        </h1>

        <motion.p
          {...rise(1.25)}
          className="mt-5 font-display text-xl italic text-gold sm:text-2xl"
        >
          {t.tagline}
        </motion.p>

        <motion.ul
          {...rise(1.45)}
          className="label mt-6 flex items-center gap-3 text-ivory/70 sm:gap-5"
          aria-label={t.hero.pillars}
        >
          {t.pillars.map((p, i) => (
            <li key={p} className="flex items-center gap-3 sm:gap-5">
              {i > 0 && <span className="h-px w-4 bg-ivory/30" aria-hidden />}
              {p}
            </li>
          ))}
        </motion.ul>

        <motion.div
          {...rise(1.65)}
          className="mt-9 flex w-full max-w-[420px] flex-col gap-2.5 sm:w-auto sm:max-w-none sm:flex-row sm:gap-3"
        >
          <Link href="/shop" className="btn-solid">
            {t.hero.shop} <Icon name="arrow" className="h-4 w-4" />
          </Link>
          <Link href="#worlds" className="btn-line">
            {t.hero.worlds}
          </Link>
        </motion.div>
      </motion.div>

      <motion.div
        className="label pointer-events-none absolute bottom-8 end-8 z-10 hidden items-center gap-3 text-ivory/40 lg:flex"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.2, duration: 1 }}
      >
        <span className="block h-8 w-px animate-drift bg-ivory/40" /> {t.hero.scroll}
      </motion.div>
      <motion.p
        className="label pointer-events-none absolute bottom-8 start-8 z-10 hidden text-ivory/40 lg:block"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.2, duration: 1 }}
      >
        {t.hero.footer}
      </motion.p>
    </section>
  );
}
