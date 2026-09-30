import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Mark } from '@/components/brand/Mark';
import { Icon } from '@/components/ui/Icon';
import { BRAND, SOCIAL, WORLDS, WORLD_ORDER } from '@/lib/brand';
import { featuredProducts } from '@/lib/commerce/catalog';
import { getSet } from '@/lib/commerce/sets';
import { formatPrice } from '@/lib/commerce/provider';
import { ImageKindTag } from '@/components/product/ProductImage';

/**
 * Link-in-bio landing (put natysimo.com/ig in the Instagram bio).
 * The Instagram export shows 113,541 profile visits but only 548 link taps
 * in 90 days — this page exists to turn that attention into store visits:
 * one screen, thumb-sized targets, the brand first, zero reading required.
 */
export const metadata: Metadata = {
  title: 'NATYSIMO — from @natty.simo',
  description:
    'Shop NATYSIMO Collection 01, the sets and the three worlds — straight from Instagram.',
  alternates: { canonical: '/ig' },
};

export default function InstagramLanding() {
  const look = getSet('gym-to-street');
  const picks = featuredProducts().slice(0, 4);

  return (
    <div className="mx-auto max-w-md px-4 pb-32 pt-24">
      <div className="flex flex-col items-center text-center">
        <div className="w-16">
          <Mark priority sizes="64px" />
        </div>
        <h1 className="mt-6 font-display text-4xl tracking-[0.2em]">{BRAND.name}</h1>
        <p className="mt-2 font-display text-lg italic text-gold">{BRAND.tagline}</p>
        <p className="label mt-4 text-mist">
          From {SOCIAL.instagramHandle} · {BRAND.roots}
        </p>
      </div>

      <nav aria-label="Quick links" className="mt-10 grid gap-2.5">
        <Link href="/shop" className="btn-solid w-full justify-between">
          Shop Collection 01 <Icon name="arrow" className="h-4 w-4" />
        </Link>
        {look && (
          <Link
            href={`/sets/${look.slug}`}
            className="group relative flex h-28 items-end overflow-hidden border border-white/10 p-4"
          >
            <Image
              src={look.image.src}
              alt=""
              fill
              sizes="448px"
              className="object-cover object-[50%_35%] brightness-[0.5] saturate-[0.7] transition-transform duration-700 group-hover:scale-105"
            />
            <span className="relative flex w-full items-end justify-between">
              <span>
                <span className="label block text-gold">The founder’s look</span>
                <span className="mt-1 block font-display text-2xl">{look.name}</span>
              </span>
              <span className="text-sm tabular-nums">{formatPrice(look.priceCents)}</span>
            </span>
          </Link>
        )}
        <Link href="/sets" className="btn-line w-full justify-between">
          The Sets <Icon name="arrow" className="h-4 w-4" />
        </Link>
        {SOCIAL.planUrl && (
          <a
            href={SOCIAL.planUrl}
            target="_blank"
            rel="noreferrer"
            className="btn-line w-full justify-between"
          >
            The Training Plan <Icon name="arrow" className="h-4 w-4" />
          </a>
        )}
      </nav>

      <div className="mt-8 grid grid-cols-3 gap-2">
        {WORLD_ORDER.map((id) => (
          <Link
            key={id}
            href={`/worlds/${id}`}
            data-world={id}
            className="flex flex-col items-center gap-3 border border-white/10 px-2 py-5 transition-colors hover:border-accent/50"
          >
            <span className="w-10">
              <Mark world={id} sizes="40px" alt="" />
            </span>
            <span className="label text-accent">{WORLDS[id].name}</span>
          </Link>
        ))}
      </div>

      <section className="mt-10" aria-labelledby="ig-picks">
        <h2 id="ig-picks" className="label text-mist">
          Most wanted
        </h2>
        <ul className="mt-4 grid grid-cols-2 gap-2">
          {picks.map((p) => (
            <li key={p.slug}>
              <Link href={`/product/${p.slug}`} className="block">
                <span className="relative block aspect-[4/5] overflow-hidden bg-graphite">
                  <Image
                    src={p.images[0].src}
                    alt={p.images[0].alt}
                    fill
                    sizes="50vw"
                    className="object-cover saturate-[0.7]"
                    style={{ objectPosition: p.images[0].position ?? '50% 50%' }}
                  />
                  <ImageKindTag kind={p.images[0].kind} className="left-2 top-2" />
                </span>
                <span className="mt-2 block truncate text-xs">{p.name}</span>
                <span className="block text-xs tabular-nums text-mist">
                  {formatPrice(p.price.amountCents)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <a
        href={SOCIAL.instagram}
        target="_blank"
        rel="noreferrer"
        className="label mt-10 flex items-center justify-center gap-2 py-4 text-ivory/70"
      >
        <Icon name="instagram" className="h-4 w-4" /> Questions? DM {SOCIAL.instagramHandle}
      </a>
    </div>
  );
}
