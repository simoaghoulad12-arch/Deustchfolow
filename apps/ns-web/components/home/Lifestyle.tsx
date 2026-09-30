import Image from 'next/image';
import Link from 'next/link';
import { ImageReveal, Reveal } from '@/components/motion/Reveal';
import { BRAND } from '@/lib/brand';
import { ImageKindTag } from '@/components/product/ProductImage';
import { kindOf } from '@/lib/images';

const TILES = [
  {
    src: '/images/photo/gym-tank-shorts.jpg',
    alt: 'Performance Tank and Training Shorts in the gym',
    href: '/product/training-shorts',
    label: 'Train',
    cls: 'col-span-2 row-span-2 lg:col-span-2 lg:row-span-2',
    pos: '50% 45%',
    sizes: '(min-width: 1024px) 40vw, 100vw',
  },
  {
    src: '/images/concept/hoodie-jogger.jpg',
    alt: 'Hoodie and Jogger, concept visual',
    href: '/product/jogger',
    label: 'Grow',
    cls: 'row-span-2',
    pos: '50% 30%',
    sizes: '(min-width: 1024px) 20vw, 50vw',
    concept: true,
  },
  {
    src: '/images/render/flatlay-apparel-tee.jpg',
    alt: 'Graphic Tee flat lay',
    href: '/product/graphic-tee',
    label: 'Wear',
    cls: '',
    pos: '50% 50%',
    sizes: '(min-width: 1024px) 20vw, 50vw',
  },
  {
    src: '/images/concept/ivory-hoodie-bag.jpg',
    alt: 'Ivory Premium Hoodie with Gym Bag, concept visual',
    href: '/product/premium-hoodie',
    label: 'Evolve',
    cls: 'row-span-2 lg:row-span-1',
    pos: '50% 30%',
    sizes: '(min-width: 1024px) 20vw, 50vw',
    concept: true,
  },
  {
    src: '/images/concept/compression-ls.jpg',
    alt: 'Compression Long Sleeve, concept visual',
    href: '/product/compression-long-sleeve',
    label: 'Repeat',
    cls: 'lg:hidden',
    pos: '50% 35%',
    sizes: '(min-width: 1024px) 20vw, 50vw',
    concept: true,
  },
];

export function Lifestyle() {
  return (
    <section
      data-world="hybrid"
      className="bg-ink py-24 sm:py-36"
      aria-labelledby="lifestyle-title"
    >
      <div className="mx-auto max-w-[1600px] px-5 sm:px-8">
        <Reveal className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="label text-mist">Lifestyle</p>
            <h2
              id="lifestyle-title"
              className="mt-5 font-display text-5xl leading-none sm:text-7xl"
            >
              {BRAND.manifesto.map((w, i) => (
                <span key={w} className={i === 1 ? 'italic text-ivory/60' : ''}>
                  {w}.{' '}
                </span>
              ))}
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-mist">
            From the first rep to the last meeting. One uniform, worn with intent — gym, street,
            everyday.
          </p>
        </Reveal>

        <div className="mt-12 grid auto-rows-[42vw] grid-cols-2 gap-2 sm:auto-rows-[30vw] lg:auto-rows-[19vw] lg:grid-cols-4">
          {TILES.map((t, i) => (
            <ImageReveal
              key={t.src}
              delay={(i % 3) * 0.1}
              className={`relative overflow-hidden bg-graphite ${t.cls}`}
            >
              <Link
                href={t.href}
                className={`group relative block h-full w-full ${t.concept ? 'grain' : ''}`}
              >
                <Image
                  src={t.src}
                  alt={t.alt}
                  fill
                  sizes={t.sizes}
                  className="object-cover brightness-[0.8] transition-transform duration-[1.6s] ease-cinematic group-hover:scale-105"
                  style={{ objectPosition: t.pos }}
                />
                <ImageKindTag kind={kindOf(t.src)} />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent" />
                <span className="label absolute bottom-4 left-4 text-ivory">{t.label}</span>
              </Link>
            </ImageReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
