'use client';

import { useRef, useState } from 'react';
import type { Product } from '@/lib/commerce/types';
import { ProductImage } from './ProductImage';
import { useLocale } from '@/lib/i18n/context';
import { useCopy } from '@/lib/i18n/copy';
import { catalogUi } from '@/lib/i18n/copy/catalog';
import { localizeProduct } from '@/lib/i18n/products';

/**
 * Mobile: full-bleed swipe gallery with scroll-snap and a position counter.
 * Desktop: editorial grid — first image large, the rest in pairs.
 */
export function ProductGallery({ product: source }: { product: Product }) {
  const locale = useLocale();
  const t = useCopy(catalogUi);
  const ROLE_LABEL = t.roles;
  const product = localizeProduct(source, locale);
  const [active, setActive] = useState(0);
  const track = useRef<HTMLDivElement>(null);
  const images = product.images;

  const onScroll = () => {
    const el = track.current;
    if (!el) return;
    // scrollLeft is negative in right-to-left layouts.
    setActive(Math.round(Math.abs(el.scrollLeft) / el.clientWidth));
  };

  return (
    <div>
      {/* Mobile */}
      <div className="relative lg:hidden">
        <div
          ref={track}
          onScroll={onScroll}
          className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto"
          aria-label={t.galleryImages(product.name)}
          role="region"
        >
          {images.map((image, i) => (
            <div key={image.src + i} className="relative aspect-[4/5] w-full shrink-0 snap-center">
              <ProductImage image={image} sizes="100vw" priority={i === 0} showTag />
            </div>
          ))}
        </div>
        {images.length > 1 && (
          <div className="pointer-events-none absolute inset-x-0 bottom-4 flex items-center justify-center gap-2">
            {images.map((_, i) => (
              <span
                key={i}
                className={`h-px transition-all duration-500 ${i === active ? 'w-8 bg-ivory' : 'w-4 bg-ivory/35'}`}
              />
            ))}
          </div>
        )}
        <span className="label absolute bottom-4 end-4 text-ivory/70">
          {ROLE_LABEL[images[active]?.role ?? 'model']}
        </span>
      </div>

      {/* Desktop */}
      <div className="hidden gap-2 lg:grid lg:grid-cols-2">
        {images.map((image, i) => (
          <figure
            key={image.src + i}
            className={`relative ${i === 0 ? 'col-span-2 aspect-[4/5] xl:aspect-[5/6]' : 'aspect-[4/5]'} ${images.length === 2 && i === 1 ? 'col-span-2' : ''}`}
          >
            <ProductImage
              image={image}
              sizes={i === 0 ? '60vw' : '30vw'}
              priority={i === 0}
              showTag
            />
            <figcaption className="label absolute bottom-4 start-4 text-ivory/70">
              {ROLE_LABEL[image.role]}
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}
