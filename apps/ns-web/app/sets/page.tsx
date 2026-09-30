import type { Metadata } from 'next';
import { SETS } from '@/lib/commerce/sets';
import { SetCard } from '@/components/sets/SetCard';

export const metadata: Metadata = {
  title: 'The Sets',
  description:
    'Curated NATYSIMO looks — Training Set, Gym-to-Street, Gym Starter and Full Look — at a permanent set price.',
  alternates: { canonical: '/sets' },
};

export default function SetsPage() {
  return (
    <div className="mx-auto max-w-[1600px] px-5 pb-28 pt-28 sm:px-8 sm:pt-36">
      <p className="label text-mist">Curated looks</p>
      <h1 className="mt-4 font-display text-[3.4rem] leading-[0.95] sm:text-8xl">The Sets</h1>
      <p className="mt-6 max-w-md text-sm leading-relaxed text-mist">
        Complete looks, built to be worn together. One permanent set price — no countdowns, no
        sales.
      </p>
      <div className="mt-12 grid gap-x-3 gap-y-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-x-5">
        {SETS.map((s) => (
          <SetCard key={s.slug} set={s} />
        ))}
      </div>
    </div>
  );
}
