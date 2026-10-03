import Image from 'next/image';
import Link from 'next/link';
import { ImageReveal, Reveal } from '@/components/motion/Reveal';
import { shell } from '@/lib/i18n/copy/shell';
import { getLocale } from '@/lib/i18n/server';
import { pick } from '@/lib/i18n/copy';
import { home } from '@/lib/i18n/copy/home';
import { ImageKindTag } from '@/components/product/ProductImage';
import { kindOf } from '@/lib/images';

const TILES = [
  {
    src: '/images/photo/gym-tank-shorts.jpg',
    href: '/product/training-shorts',
    cls: 'col-span-2 row-span-2 lg:col-span-2 lg:row-span-2',
    pos: '50% 45%',
    sizes: '(min-width: 1024px) 40vw, 100vw',
  },
  {
    src: '/images/concept/hoodie-jogger.jpg',
    href: '/product/jogger',
    cls: 'row-span-2',
    pos: '50% 30%',
    sizes: '(min-width: 1024px) 20vw, 50vw',
    concept: true,
  },
  {
    src: '/images/render/flatlay-apparel-tee.jpg',
    href: '/product/graphic-tee',
    cls: '',
    pos: '50% 50%',
    sizes: '(min-width: 1024px) 20vw, 50vw',
  },
  {
    src: '/images/concept/ivory-hoodie-bag.jpg',
    href: '/product/premium-hoodie',
    cls: 'row-span-2 lg:row-span-1',
    pos: '50% 30%',
    sizes: '(min-width: 1024px) 20vw, 50vw',
    concept: true,
  },
  {
    src: '/images/concept/compression-ls.jpg',
    href: '/product/compression-long-sleeve',
    cls: 'lg:hidden',
    pos: '50% 35%',
    sizes: '(min-width: 1024px) 20vw, 50vw',
    concept: true,
  },
];

export function Lifestyle() {
  const locale = getLocale();
  const t = pick(home, locale);
  const manifesto = pick(shell, locale).manifesto;
  return (
    <section
      data-world="hybrid"
      className="bg-ink py-24 sm:py-36"
      aria-labelledby="lifestyle-title"
    >
      <div className="mx-auto max-w-[1600px] px-5 sm:px-8">
        <Reveal className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="label text-mist">{t.lifestyle.eyebrow}</p>
            <h2
              id="lifestyle-title"
              className="mt-5 font-display text-5xl leading-none sm:text-7xl"
            >
              {manifesto.map((w, i) => (
                <span key={w} className={i === 1 ? 'italic text-ivory/60' : ''}>
                  {w}.{' '}
                </span>
              ))}
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-mist">{t.lifestyle.text}</p>
        </Reveal>

        <div className="mt-12 grid auto-rows-[42vw] grid-cols-2 gap-2 sm:auto-rows-[30vw] lg:auto-rows-[19vw] lg:grid-cols-4">
          {TILES.map((tile, i) => (
            <ImageReveal
              key={tile.src}
              delay={(i % 3) * 0.1}
              className={`relative overflow-hidden bg-graphite ${tile.cls}`}
            >
              <Link
                href={tile.href}
                className={`group relative block h-full w-full ${tile.concept ? 'grain' : ''}`}
              >
                <Image
                  src={tile.src}
                  alt={t.lifestyle.tiles[i]?.alt ?? ''}
                  fill
                  sizes={tile.sizes}
                  className="object-cover brightness-[0.8] transition-transform duration-[1.6s] ease-cinematic group-hover:scale-105"
                  style={{ objectPosition: tile.pos }}
                />
                <ImageKindTag kind={kindOf(tile.src)} />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent" />
                <span className="label absolute bottom-4 start-4 text-ivory">
                  {t.lifestyle.tiles[i]?.label}
                </span>
              </Link>
            </ImageReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
