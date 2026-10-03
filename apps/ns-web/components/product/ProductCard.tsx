'use client';

import Link from 'next/link';
import type { Product } from '@/lib/commerce/types';
import { formatPrice } from '@/lib/commerce/provider';
import { useLocale } from '@/lib/i18n/context';
import { useCopy } from '@/lib/i18n/copy';
import { catalogUi } from '@/lib/i18n/copy/catalog';
import { colorName, localizeProduct } from '@/lib/i18n/products';
import { localizeWorld } from '@/lib/i18n/worlds';
import { ProductImage } from './ProductImage';
import { WishButton } from './WishButton';
import { cn } from '@/lib/cn';

export function ProductCard({
  product: source,
  index,
  sizes = '(min-width: 1024px) 25vw, 50vw',
  priority,
  className,
}: {
  product: Product;
  index?: number;
  sizes?: string;
  priority?: boolean;
  className?: string;
}) {
  const locale = useLocale();
  const t = useCopy(catalogUi);
  const product = localizeProduct(source, locale);
  const [primary, secondary] = product.images;
  const world = localizeWorld(product.world, locale);
  return (
    <article data-world={product.world} className={cn('group relative', className)}>
      <Link
        href={`/product/${product.slug}`}
        className="block"
        aria-label={`${product.name}, ${formatPrice(product.price.amountCents, locale)}`}
      >
        <div className="relative aspect-[4/5] overflow-hidden bg-graphite">
          <div className="absolute inset-0 transition-transform duration-[1.4s] ease-cinematic group-hover:scale-[1.04]">
            <ProductImage image={primary} sizes={sizes} priority={priority} showTag />
          </div>
          {secondary && (
            <div className="absolute inset-0 opacity-0 transition-opacity duration-700 ease-cinematic group-hover:opacity-100 max-lg:hidden">
              <ProductImage image={secondary} sizes={sizes} />
            </div>
          )}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-ink/70 to-transparent" />
          <span className="label absolute bottom-3 start-3 text-accent">{world.name}</span>
          {index !== undefined && (
            <span dir="ltr" className="tech absolute end-3 top-3 text-ivory/50">
              NS/{String(index + 1).padStart(3, '0')}
            </span>
          )}
        </div>
      </Link>
      <div className="flex items-start justify-between gap-2 pt-3.5">
        <Link href={`/product/${product.slug}`} className="min-w-0">
          <h3 className="truncate text-[13px] font-medium tracking-wide sm:text-sm">
            {product.name}
          </h3>
          <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-mist">{product.line}</p>
          <p className="mt-2 flex items-center gap-2.5 text-[13px] tabular-nums text-ivory/85">
            {formatPrice(product.price.amountCents, locale)}
            <span
              className="flex gap-1"
              aria-label={t.colours(
                product.colors
                  .map((c) => colorName(c.name, locale))
                  .join(locale === 'ar' ? '، ' : ', '),
              )}
            >
              {product.colors.map((c) => (
                <span
                  key={c.name}
                  className="h-2 w-2 rounded-full border border-white/25"
                  style={{ backgroundColor: c.hex }}
                />
              ))}
            </span>
          </p>
        </Link>
        <WishButton slug={product.slug} name={product.name} className="-me-2 -mt-2.5 shrink-0" />
      </div>
    </article>
  );
}
