import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { WORLDS, WORLD_ORDER, isWorldId } from '@/lib/brand';
import { productsByWorld, products } from '@/lib/commerce/catalog';
import { Mark } from '@/components/brand/Mark';
import { ProductCard } from '@/components/product/ProductCard';
import { Reveal, TextReveal } from '@/components/motion/Reveal';
import { Icon } from '@/components/ui/Icon';

interface Props {
  params: { world: string };
}

export function generateStaticParams() {
  return WORLD_ORDER.map((world) => ({ world }));
}

export function generateMetadata({ params }: Props): Metadata {
  if (!isWorldId(params.world)) return {};
  const w = WORLDS[params.world];
  return {
    title: `${w.name} — ${w.descriptor}`,
    description: w.intro,
    alternates: { canonical: `/worlds/${w.id}` },
    openGraph: { images: [{ url: w.image.src }] },
  };
}

export default function WorldPage({ params }: Props) {
  if (!isWorldId(params.world)) notFound();
  const world = WORLDS[params.world];
  const list = productsByWorld(world.id);
  const others = WORLD_ORDER.filter((id) => id !== world.id);

  return (
    <div data-world={world.id}>
      <section className="relative flex min-h-[100svh] items-end overflow-hidden">
        <Image
          src={world.image.src}
          alt={world.image.alt}
          fill
          priority
          sizes="100vw"
          className={`object-cover brightness-[0.5] contrast-[1.1] ${world.id === 'sports' ? 'grayscale' : 'saturate-[0.7]'}`}
          style={{ objectPosition: world.image.position }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/50 to-ink/30" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_40%,rgb(var(--accent)/0.14),transparent_70%)]" />

        <div className="relative z-10 mx-auto flex w-full max-w-[1600px] flex-col items-center px-5 pb-28 text-center sm:px-8 lg:pb-24">
          <Reveal className="w-28 sm:w-36" y={30}>
            <Mark world={world.id} priority sizes="144px" />
          </Reveal>
          <p className="label mt-8 text-accent">
            World {world.index}
          </p>
          <h1 className="mt-5 font-display text-6xl leading-none sm:text-8xl lg:text-9xl">
            <TextReveal lines={[<span key="n" className="metal-text">{world.name}</span>]} />
          </h1>
          <Reveal delay={0.2}>
            <p className="mt-6 font-display text-2xl italic text-ivory/85 sm:text-3xl">{world.headline}</p>
            <p className="label mt-5 text-ivory/60">{world.descriptor}</p>
            <p className="mx-auto mt-6 max-w-lg text-sm leading-relaxed text-ivory/70">{world.intro}</p>
            <div className="mt-8 flex justify-center gap-2" aria-label={`${world.name} palette`}>
              {world.palette.map((c) => (
                <span key={c.name} className="label flex items-center gap-2 border border-white/10 px-3 py-2 text-ivory/70">
                  <span className="h-2.5 w-2.5 rounded-full border border-white/20" style={{ backgroundColor: c.hex }} />
                  {c.name}
                </span>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-[1600px] px-5 py-20 sm:px-8 sm:py-28" aria-labelledby="world-pieces">
        <div className="flex items-end justify-between border-b border-white/10 pb-6">
          <h2 id="world-pieces" className="font-display text-4xl sm:text-5xl">
            The pieces
          </h2>
          <p className="label text-fog">{list.length} in Collection 01</p>
        </div>
        <div className="mt-10 grid grid-cols-2 gap-x-3 gap-y-12 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-5">
          {list.map((p, i) => (
            <Reveal key={p.slug} delay={(i % 4) * 0.08}>
              <ProductCard product={p} index={products.indexOf(p)} priority={i < 2} />
            </Reveal>
          ))}
        </div>
      </section>

      <section className="border-t border-white/[0.07] bg-coal" aria-label="Other worlds">
        <div className="mx-auto grid max-w-[1600px] sm:grid-cols-2">
          {others.map((id) => (
            <Link
              key={id}
              href={`/worlds/${id}`}
              data-world={id}
              className="group flex items-center justify-between gap-6 border-b border-white/[0.07] px-5 py-10 transition-colors hover:bg-graphite sm:border-b-0 sm:px-10 sm:py-14 sm:first:border-r"
            >
              <div>
                <p className="label text-accent">World {WORLDS[id].index}</p>
                <p className="mt-3 font-display text-4xl sm:text-5xl">{WORLDS[id].name}</p>
                <p className="label mt-3 inline-flex items-center gap-2 text-ivory/60">
                  Enter <Icon name="arrow" className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </p>
              </div>
              <span className="w-16 sm:w-20">
                <Mark world={id} sizes="80px" />
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
