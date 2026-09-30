import type { Metadata } from 'next';
import { ShopView } from '@/components/shop/ShopView';
import { TextReveal } from '@/components/motion/Reveal';

export const metadata: Metadata = {
  title: 'Collection 01',
  description: 'NATYSIMO Collection 01 — performance, streetwear and hybrid pieces across the Sports, Clothing and Hybrid worlds.',
  alternates: { canonical: '/shop' },
};

export default function ShopPage() {
  return (
    <div className="mx-auto max-w-[1600px] px-5 pb-28 pt-28 sm:px-8 sm:pt-36">
      <p className="label text-gold">Chapter one</p>
      <h1 className="mt-4 font-display text-[3.4rem] leading-[0.95] sm:text-8xl">
        <TextReveal lines={['Collection 01']} />
      </h1>
      <div className="mt-10">
        <ShopView />
      </div>
    </div>
  );
}
