import Link from 'next/link';
import { SETS } from '@/lib/commerce/sets';
import { SetCard } from '@/components/sets/SetCard';
import { Reveal } from '@/components/motion/Reveal';
import { Icon } from '@/components/ui/Icon';

export function Sets() {
  return (
    <section className="bg-ink py-24 sm:py-32" aria-labelledby="sets-title">
      <div className="mx-auto max-w-[1600px] px-5 sm:px-8">
        <Reveal className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="label text-mist">Curated looks</p>
            <h2 id="sets-title" className="mt-5 font-display text-5xl leading-none sm:text-7xl">
              The Sets.
            </h2>
          </div>
          <Link
            href="/sets"
            className="label inline-flex items-center gap-3 text-ivory/80 hover:text-ivory"
          >
            All sets <Icon name="arrow" className="h-4 w-4" />
          </Link>
        </Reveal>
      </div>
      <div className="no-scrollbar mt-10 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-5 px-5 sm:scroll-px-8 sm:px-8 lg:mx-auto lg:grid lg:max-w-[1600px] lg:grid-cols-4 lg:gap-5 lg:overflow-visible">
        {SETS.map((s, i) => (
          <Reveal
            key={s.slug}
            delay={i * 0.08}
            className="w-[78vw] max-w-[340px] shrink-0 snap-start lg:w-auto lg:max-w-none"
          >
            <SetCard set={s} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}
