'use client';

import Link from 'next/link';
import { useStore } from '@/lib/commerce/store';
import { getProduct } from '@/lib/commerce/catalog';
import { ProductCard } from '@/components/product/ProductCard';
import type { Product } from '@/lib/commerce/types';

export function WishlistView() {
  const { wishlist } = useStore();
  const items = wishlist.map(getProduct).filter((p): p is Product => Boolean(p));

  if (items.length === 0) {
    return (
      <div className="mt-16 max-w-md">
        <p className="text-sm leading-relaxed text-mist">
          Nothing saved yet. Tap the heart on any piece to keep it here.
        </p>
        <Link href="/shop" className="btn-solid mt-8">
          Shop Collection 01
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-12 grid grid-cols-2 gap-x-3 gap-y-12 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-5">
      {items.map((p) => (
        <ProductCard key={p.slug} product={p} />
      ))}
    </div>
  );
}
