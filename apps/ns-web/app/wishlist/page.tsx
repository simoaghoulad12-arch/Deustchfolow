import type { Metadata } from 'next';
import { WishlistView } from '@/components/commerce/WishlistView';

export const metadata: Metadata = { title: 'Wishlist', robots: { index: false } };

export default function WishlistPage() {
  return (
    <div className="mx-auto min-h-[80svh] max-w-[1600px] px-5 pb-28 pt-28 sm:px-8 sm:pt-36">
      <p className="label text-mist">Saved on this device</p>
      <h1 className="mt-4 font-display text-6xl leading-none sm:text-8xl">Wishlist</h1>
      <WishlistView />
    </div>
  );
}
