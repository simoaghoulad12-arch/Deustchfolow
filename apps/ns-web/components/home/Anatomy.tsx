'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Reveal } from '@/components/motion/Reveal';
import { cn } from '@/lib/cn';
import { useCopy } from '@/lib/i18n/copy';
import { home } from '@/lib/i18n/copy/home';

/**
 * Product anatomy of the Training Set, on real photography of the produced
 * Performance Tank and Training Shorts. Only visible design details are
 * annotated — no fabric or tech claims. Coordinates are % of the photo.
 */
const COORDS = [
  { x: 37, y: 50 },
  { x: 22, y: 53 },
  { x: 28, y: 41 },
  { x: 20, y: 70 },
  { x: 43, y: 76.5 },
];

export function Anatomy() {
  const t = useCopy(home).anatomy;
  const POINTS = t.points.map((p, i) => ({ ...p, ...COORDS[i]! }));
  const [active, setActive] = useState(0);

  return (
    <section
      data-world="sports"
      className="relative bg-ink py-24 sm:py-36"
      aria-labelledby="anatomy-title"
    >
      <div className="mx-auto grid max-w-[1600px] gap-12 px-5 sm:px-8 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:gap-20">
        <Reveal className="relative">
          <div className="relative aspect-[1086/1448] overflow-hidden bg-graphite">
            <Image
              src="/images/photo/gym-tank-mirror.jpg"
              alt={t.alt}
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover grayscale-[0.5] brightness-[0.85]"
            />
            <div className="absolute inset-0 bg-ink/10" />
            {POINTS.map((p, i) => (
              <button
                key={p.title}
                type="button"
                onClick={() => setActive(i)}
                onMouseEnter={() => setActive(i)}
                aria-label={`${i + 1}. ${p.title}`}
                aria-pressed={active === i}
                className="absolute flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center"
                style={{ left: `${p.x}%`, top: `${p.y}%` }}
              >
                <span
                  className={cn(
                    'absolute h-7 w-7 rounded-full border transition-all duration-500',
                    active === i
                      ? 'scale-125 border-accent bg-ink/70'
                      : 'border-white/60 bg-ink/40',
                  )}
                />
                {active === i && (
                  <span className="absolute h-7 w-7 animate-ping rounded-full border border-accent/60" />
                )}
                <span className="relative text-[10px] font-medium tabular-nums">{i + 1}</span>
              </button>
            ))}
          </div>
        </Reveal>

        <div>
          <Reveal>
            <p className="label text-accent">{t.eyebrow}</p>
            <h2 id="anatomy-title" className="mt-5 font-display text-5xl leading-[1] sm:text-7xl">
              {t.title}
            </h2>
            <p className="mt-6 max-w-md text-sm leading-relaxed text-mist">{t.intro}</p>
          </Reveal>

          <ol className="mt-10 border-t border-white/10">
            {POINTS.map((p, i) => (
              <li key={p.title} className="border-b border-white/10">
                <button
                  type="button"
                  onClick={() => setActive(i)}
                  className="flex w-full items-baseline gap-5 py-5 text-start"
                  aria-expanded={active === i}
                >
                  <span
                    className={cn(
                      'label tabular-nums transition-colors',
                      active === i ? 'text-accent' : 'text-fog',
                    )}
                  >
                    0{i + 1}
                  </span>
                  <span className="flex-1">
                    <span
                      className={cn(
                        'block font-display text-2xl transition-colors sm:text-3xl',
                        active === i ? 'text-ivory' : 'text-ivory/50',
                      )}
                    >
                      {p.title}
                    </span>
                    <motion.span
                      initial={false}
                      animate={{ height: active === i ? 'auto' : 0, opacity: active === i ? 1 : 0 }}
                      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                      className="block overflow-hidden"
                    >
                      <span className="block pt-3 text-sm leading-relaxed text-mist">{p.body}</span>
                    </motion.span>
                  </span>
                </button>
              </li>
            ))}
          </ol>

          <Reveal className="mt-10">
            <Link href="/sets/training-set" className="btn-solid">
              {t.cta}
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
