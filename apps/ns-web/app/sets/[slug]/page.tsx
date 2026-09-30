import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SETS, getSet, separatePrice, setProducts, setTitle } from '@/lib/commerce/sets';
import { WORLDS } from '@/lib/brand';
import { SetPurchase } from '@/components/sets/SetPurchase';
import { ProductCard } from '@/components/product/ProductCard';
import { cn } from '@/lib/cn';
import { ImageKindTag } from '@/components/product/ProductImage';

interface Props {
  params: { slug: string };
}

export function generateStaticParams() {
  return SETS.map((s) => ({ slug: s.slug }));
}

export function generateMetadata({ params }: Props): Metadata {
  const set = getSet(params.slug);
  if (!set) return {};
  return {
    title: setTitle(set),
    description: `${set.tagline}. ${set.story}`,
    alternates: { canonical: `/sets/${set.slug}` },
    openGraph: { images: [{ url: set.image.src }] },
  };
}

export default function SetPage({ params }: Props) {
  const set = getSet(params.slug);
  if (!set) notFound();
  const items = setProducts(set);
  const world = WORLDS[set.world];

  return (
    <div data-world={set.world} className="pb-16 pt-16 sm:pt-[72px]">
      <div className="mx-auto grid max-w-[1600px] lg:grid-cols-[1.2fr_1fr] lg:gap-14 lg:px-8 lg:pt-8">
        <div
          className={cn(
            'relative aspect-[4/5] overflow-hidden bg-graphite',
            set.image.kind === 'concept' && 'grain',
          )}
        >
          <Image
            src={set.image.src}
            alt={set.image.alt}
            fill
            priority
            sizes="(min-width: 1024px) 55vw, 100vw"
            className="object-cover saturate-[0.75]"
            style={{ objectPosition: set.image.position ?? '50% 50%' }}
          />
          <ImageKindTag kind={set.image.kind} />
        </div>
        <div className="px-5 pt-8 lg:px-0 lg:pt-0">
          <div className="lg:sticky lg:top-28">
            <p className="label text-accent">{world.name} · The set</p>
            <h1 className="mt-3 font-display text-5xl leading-none sm:text-6xl">{set.name}</h1>
            <p className="label mt-4 text-mist">{set.tagline}</p>
            <p className="mt-6 max-w-md text-[15px] leading-relaxed text-ivory/80">{set.story}</p>
            <div className="mt-8">
              <SetPurchase set={set} items={items} separateCents={separatePrice(set)} />
            </div>
          </div>
        </div>
      </div>

      <section className="mx-auto mt-24 max-w-[1600px] px-5 sm:px-8" aria-labelledby="in-set">
        <h2 id="in-set" className="label text-mist">
          In this set
        </h2>
        <div className="mt-8 grid grid-cols-2 gap-x-3 gap-y-10 lg:grid-cols-4 lg:gap-x-5">
          {items.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
        <Link href="/sets" className="btn-line mt-14">
          All sets
        </Link>
      </section>
    </div>
  );
}
