import Link from 'next/link';
import type { Product } from '@/lib/commerce/types';
import { formatPrice } from '@/lib/commerce/provider';
import { WORLDS } from '@/lib/brand';
import { ProductImage } from './ProductImage';
import { WishButton } from './WishButton';
import { cn } from '@/lib/cn';

export function ProductCard({
  product,
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
  const [primary, secondary] = product.images;
  const world = WORLDS[product.world];
  return (
    <article data-world={product.world} className={cn('group relative', className)}>
      <Link href={`/product/${product.slug}`} className="block" aria-label={`${product.name}, ${formatPrice(product.price.amountCents)}`}>
        <div className="relative aspect-[4/5] overflow-hidden bg-graphite">
          <div className="absolute inset-0 transition-transform duration-[1.4s] ease-cinematic group-hover:scale-[1.04]">
            <ProductImage image={primary} sizes={sizes} priority={priority} />
          </div>
          {secondary && (
            <div className="absolute inset-0 opacity-0 transition-opacity duration-700 ease-cinematic group-hover:opacity-100 max-lg:hidden">
              <ProductImage image={secondary} sizes={sizes} />
            </div>
          )}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-ink/70 to-transparent" />
          <span className="label absolute bottom-3 left-3 text-accent">{world.name}</span>
          {index !== undefined && <span className="label absolute right-3 top-3 text-ivory/50 tabular-nums">NS/{String(index + 1).padStart(3, '0')}</span>}
        </div>
      </Link>
      <div className="flex items-start justify-between gap-2 pt-3.5">
        <Link href={`/product/${product.slug}`} className="min-w-0">
          <h3 className="truncate text-[13px] font-medium tracking-wide sm:text-sm">{product.name}</h3>
          <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-mist">{product.line}</p>
          <p className="mt-2 text-[13px] tabular-nums text-ivory/85">{formatPrice(product.price.amountCents)}</p>
        </Link>
        <WishButton slug={product.slug} name={product.name} className="-mr-2 -mt-2.5 shrink-0" />
      </div>
    </article>
  );
}
