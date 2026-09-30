import Image from 'next/image';
import Link from 'next/link';
import type { ProductSet } from '@/lib/commerce/sets';
import { separatePrice } from '@/lib/commerce/sets';
import { formatPrice } from '@/lib/commerce/provider';
import { WORLDS } from '@/lib/brand';
import { cn } from '@/lib/cn';
import { ImageKindTag } from '@/components/product/ProductImage';

export function SetCard({
  set,
  sizes = '(min-width: 1024px) 25vw, 80vw',
}: {
  set: ProductSet;
  sizes?: string;
}) {
  return (
    <Link href={`/sets/${set.slug}`} data-world={set.world} className="group block">
      <div
        className={cn(
          'relative aspect-[4/5] overflow-hidden bg-graphite',
          set.image.kind === 'concept' && 'grain',
        )}
      >
        <Image
          src={set.image.src}
          alt={set.image.alt}
          fill
          sizes={sizes}
          className="object-cover saturate-[0.75] transition-transform duration-[1.4s] ease-cinematic group-hover:scale-[1.04]"
          style={{ objectPosition: set.image.position ?? '50% 50%' }}
        />
        <ImageKindTag kind={set.image.kind} />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-5">
          <p className="label text-accent">
            {WORLDS[set.world].name} · {set.items.length} pieces
          </p>
          <p className="mt-2 font-display text-3xl leading-none">{set.name}</p>
          <p className="mt-2 text-xs text-ivory/70">{set.tagline}</p>
        </div>
      </div>
      <p className="mt-3 flex items-baseline gap-3 text-sm tabular-nums">
        {formatPrice(set.priceCents)}
        <span className="text-xs text-fog">separately {formatPrice(separatePrice(set))}</span>
      </p>
    </Link>
  );
}
