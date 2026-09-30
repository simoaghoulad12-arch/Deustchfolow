'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { Product } from '@/lib/commerce/types';
import { setTitle, type ProductSet } from '@/lib/commerce/sets';
import { formatPrice } from '@/lib/commerce/provider';
import { useStore } from '@/lib/commerce/store';
import { cn } from '@/lib/cn';

/** Size picker per item; the set enters the bag as one line at the set price. */
export function SetPurchase({
  set,
  items,
  separateCents,
}: {
  set: ProductSet;
  items: Product[];
  separateCents: number;
}) {
  const router = useRouter();
  const { addLine } = useStore();
  const [sizes, setSizes] = useState<Record<string, string>>(() =>
    Object.fromEntries(items.filter((p) => p.sizes.length === 1).map((p) => [p.slug, p.sizes[0]])),
  );
  const [attempted, setAttempted] = useState(false);
  const complete = items.every((p) => sizes[p.slug]);

  const add = (checkout: boolean) => {
    setAttempted(true);
    if (!complete) return;
    const sizeLabel = items
      .filter((p) => p.sizes.length > 1)
      .map((p) => sizes[p.slug])
      .join(' / ');
    addLine({
      sku: `NS01-SET-${set.slug.toUpperCase()}-${items.map((p) => (sizes[p.slug] ?? '').replace(/\W/g, '')).join('-')}`,
      slug: `sets/${set.slug}`,
      name: setTitle(set),
      world: set.world,
      color: 'Black',
      size: sizeLabel,
      unitPriceCents: set.priceCents,
      image: set.image.src,
    });
    if (checkout) router.push('/checkout');
  };

  return (
    <div data-world={set.world}>
      <div className="flex items-baseline gap-4">
        <p className="text-2xl tabular-nums">{formatPrice(set.priceCents)}</p>
        <p className="text-sm tabular-nums text-fog">
          Separately{' '}
          <span className="line-through decoration-fog/60">{formatPrice(separateCents)}</span>
        </p>
      </div>
      <p className="mt-2 text-xs text-mist">
        Permanent set price — how this look is sold, not a sale.
      </p>

      <ol className="mt-10 space-y-8">
        {items.map((p, i) => (
          <li key={p.slug}>
            <div className="flex items-baseline justify-between gap-4">
              <Link href={`/product/${p.slug}`} className="group">
                <span className="label mr-3 text-fog">0{i + 1}</span>
                <span className="text-sm underline-offset-4 group-hover:underline">{p.name}</span>
              </Link>
              <span
                className={cn('label', attempted && !sizes[p.slug] ? 'text-accent' : 'text-fog')}
              >
                {p.sizes.length === 1
                  ? 'One size'
                  : sizes[p.slug]
                    ? `Size ${sizes[p.slug]}`
                    : 'Select size'}
              </span>
            </div>
            {p.sizes.length > 1 && (
              <div
                className="mt-3 grid grid-cols-6 gap-1.5"
                role="group"
                aria-label={`${p.name} size`}
              >
                {p.sizes.map((s) => (
                  <button
                    key={s}
                    type="button"
                    aria-pressed={sizes[p.slug] === s}
                    onClick={() => setSizes((prev) => ({ ...prev, [p.slug]: s }))}
                    className={cn(
                      'h-11 border text-[11px] tracking-[0.08em] transition-colors',
                      sizes[p.slug] === s
                        ? 'border-ivory bg-ivory text-ink'
                        : 'border-white/15 hover:border-white/50',
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </li>
        ))}
      </ol>

      <div className="mt-10 grid gap-2.5">
        <button type="button" onClick={() => add(false)} className="btn-solid w-full">
          {complete || !attempted ? 'Add set to bag' : 'Select all sizes'}
        </button>
        <button type="button" onClick={() => add(true)} className="btn-line w-full">
          Buy now
        </button>
      </div>
    </div>
  );
}
