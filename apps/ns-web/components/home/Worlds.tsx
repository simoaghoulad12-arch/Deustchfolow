'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { ImageKindTag } from '@/components/product/ProductImage';
import { kindOf } from '@/lib/images';
import { Mark } from '@/components/brand/Mark';
import { Reveal } from '@/components/motion/Reveal';
import { WORLD_ORDER, type WorldId } from '@/lib/brand';
import { useWorlds } from '@/lib/i18n/useWorlds';
import { useCopy } from '@/lib/i18n/copy';
import { home } from '@/lib/i18n/copy/home';
import { productsByWorld } from '@/lib/commerce/catalog';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/lib/cn';

/**
 * The three worlds. Phones: three tall stacked chapters, each with its own
 * official mark and palette. Desktop: an accordion triptych — hovering a
 * world opens it.
 */
export function Worlds({ headingLevel = 'h2' }: { headingLevel?: 'h1' | 'h2' }) {
  const Heading = headingLevel;
  const t = useCopy(home).worlds;
  const journey = useCopy(home).journey;
  const WORLDS = useWorlds();
  const [active, setActive] = useState<WorldId>('clothing');

  return (
    <section
      id="worlds"
      className="scroll-mt-16 bg-ink pb-24 pt-20 sm:pb-32 sm:pt-28"
      aria-labelledby="worlds-title"
    >
      <div className="mx-auto max-w-[1600px] px-5 sm:px-8">
        <Reveal className="flex flex-col gap-6 border-t border-white/10 pt-10 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="label text-mist">{t.eyebrow}</p>
            <Heading
              id="worlds-title"
              className="mt-5 font-display text-5xl leading-none sm:text-7xl"
            >
              {t.title}
            </Heading>
          </div>
          <div className="max-w-sm">
            <p className="font-display text-2xl leading-tight text-ivory/85">
              {journey.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </p>
            <p className="mt-4 text-sm leading-relaxed text-mist">{t.note}</p>
          </div>
        </Reveal>
      </div>

      <div className="mx-auto mt-12 flex max-w-[1600px] flex-col gap-2 px-2 sm:px-8 lg:h-[82vh] lg:max-h-[860px] lg:flex-row lg:gap-2">
        {WORLD_ORDER.map((id) => {
          const world = WORLDS[id];
          const open = active === id;
          const count = productsByWorld(id).length;
          return (
            <div
              key={id}
              data-world={id}
              onMouseEnter={() => setActive(id)}
              onFocus={() => setActive(id)}
              className={cn(
                'group relative h-[78svh] min-h-[520px] overflow-hidden bg-graphite lg:h-auto lg:min-h-0',
                'transition-[flex-grow] duration-[1.1s] ease-cinematic',
                open ? 'lg:flex-[2.4]' : 'lg:flex-1',
              )}
            >
              <Link
                href={`/worlds/${id}`}
                className="absolute inset-0 z-20"
                aria-label={t.enterAria(world.name)}
              />
              <Image
                src={world.image.src}
                alt={world.image.alt}
                fill
                sizes="(min-width: 1024px) 60vw, 100vw"
                className={cn(
                  'object-cover transition-[transform,filter] duration-[1.6s] ease-cinematic',
                  open ? 'lg:scale-100 lg:grayscale-0' : 'lg:scale-110 lg:grayscale',
                  'brightness-[0.55] contrast-[1.1]',
                  id === 'sports' && 'grayscale',
                  id === 'clothing' && 'sepia-[0.25]',
                )}
                style={{ objectPosition: world.image.position }}
              />
              <ImageKindTag
                kind={kindOf(world.image.src)}
                className="start-auto end-3 top-14 sm:end-10 sm:top-20"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-ink/10" />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_30%,rgb(var(--accent)/0.12),transparent_60%)]" />

              <div className="relative z-10 flex h-full flex-col justify-between p-6 sm:p-10">
                <div className="flex items-start justify-between">
                  <p className="label text-accent">
                    {world.index} — {world.name}
                  </p>
                  <p className="label text-ivory/50">{t.pieces(count)}</p>
                </div>

                <div>
                  <div
                    className={cn(
                      'mb-8 w-24 transition-all duration-1000 ease-cinematic sm:w-28',
                      !open && 'lg:w-16 lg:opacity-80',
                    )}
                  >
                    <Mark world={id} sizes="112px" />
                  </div>
                  <h3
                    className={cn(
                      'font-display leading-none transition-[font-size] duration-700',
                      open
                        ? 'text-5xl sm:text-6xl'
                        : 'text-5xl sm:text-6xl lg:text-4xl xl:text-5xl',
                    )}
                  >
                    <span data-latin className={cn(!open && 'lg:hidden')}>
                      NATYSIMO{' '}
                    </span>
                    <span className="metal-text italic">{world.name}</span>
                  </h3>
                  <p className={cn('label mt-4 text-ivory/70', !open && 'lg:hidden')}>
                    {world.descriptor}
                  </p>
                  <div
                    className={cn(
                      'grid transition-[grid-template-rows,opacity] duration-1000 ease-cinematic',
                      open
                        ? 'lg:grid-rows-[1fr] lg:opacity-100'
                        : 'lg:grid-rows-[0fr] lg:opacity-0',
                    )}
                  >
                    <div className="overflow-hidden">
                      <p className="mt-5 max-w-md text-sm leading-relaxed text-ivory/75">
                        {world.intro}
                      </p>
                      <div className="mt-6 flex items-center gap-4">
                        <div className="flex gap-1.5" aria-label={t.palette}>
                          {world.palette.map((c) => (
                            <span
                              key={c.name}
                              title={c.name}
                              className="h-3 w-3 rounded-full border border-white/20"
                              style={{ backgroundColor: c.hex }}
                            />
                          ))}
                        </div>
                        <span className="label inline-flex items-center gap-2 text-accent">
                          {t.enter(world.name)}{' '}
                          <Icon
                            name="arrow"
                            className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-1 rtl:group-hover:-translate-x-1"
                          />
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
