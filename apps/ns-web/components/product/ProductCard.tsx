'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ProductVisual } from '@/components/product/ProductVisual';
import { formatPrice, type Product } from '@/data/products';
import { useCart } from '@/lib/cart-context';

export function ProductCard({ product }: { product: Product }) {
  const cart = useCart();
  const [color] = useState(product.colors[0]!);
  const [size] = useState(product.sizes[Math.floor(product.sizes.length / 2)]!);

  return (
    <div className="group flex flex-col">
      <Link
        href={`/product/${product.slug}`}
        className="relative block aspect-[4/5] overflow-hidden bg-ink"
      >
        <ProductVisual
          src={product.images.hero}
          alt={product.name}
          category={product.category}
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 45vw, 90vw"
          className="transition duration-700 group-hover:scale-105"
        />
      </Link>
      <div className="mt-3 flex items-start justify-between gap-3">
        <div>
          <Link href={`/product/${product.slug}`} className="text-sm transition hover:text-gold">
            {product.name}
          </Link>
          <p className="mt-1 text-xs text-smoke">{formatPrice(product.priceCents)}</p>
        </div>
        <button
          onClick={() =>
            cart.addLine({
              slug: product.slug,
              name: product.name,
              priceCents: product.priceCents,
              color,
              size,
              image: product.images.hero,
            })
          }
          className="whitespace-nowrap border border-bone/30 px-3 py-2 text-[10px] uppercase tracking-widest2 transition hover:border-gold hover:text-gold"
        >
          Add
        </button>
      </div>
    </div>
  );
}
