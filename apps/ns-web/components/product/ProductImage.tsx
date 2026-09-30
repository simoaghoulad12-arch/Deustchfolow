import Image from 'next/image';
import type { ProductImage as TProductImage } from '@/lib/commerce/types';
import { cn } from '@/lib/cn';

/**
 * One product image. Concept visuals (from the brand moodboards) are small
 * source files, so they get a grain + contrast treatment that keeps them
 * cinematic at larger sizes, plus an honest "Concept" tag where requested.
 */
const KIND_LABEL = { render: 'Product render', concept: 'Concept visual' } as const;

/** Honest label for anything that is not real photography of the produced piece. */
export function ImageKindTag({
  kind,
  className,
}: {
  kind: TProductImage['kind'];
  className?: string;
}) {
  if (kind === 'photo') return null;
  return (
    <span
      className={cn(
        'absolute left-3 top-3 z-10 border border-white/15 bg-ink/60 px-2 py-1 text-[9px] uppercase tracking-[0.22em] text-ivory/80 backdrop-blur',
        className,
      )}
    >
      {KIND_LABEL[kind]}
    </span>
  );
}

export function ProductImage({
  image,
  sizes,
  priority,
  className,
  showTag = false,
}: {
  image: TProductImage;
  sizes: string;
  priority?: boolean;
  className?: string;
  showTag?: boolean;
}) {
  const concept = image.kind === 'concept';
  return (
    <div
      className={cn(
        'relative h-full w-full overflow-hidden bg-graphite',
        concept && 'grain',
        className,
      )}
    >
      <Image
        src={image.src}
        alt={image.alt}
        fill
        sizes={sizes}
        priority={priority}
        className={cn(
          'object-cover',
          concept ? 'contrast-[1.08] saturate-[0.85]' : 'saturate-[0.7]',
        )}
        style={{ objectPosition: image.position ?? '50% 50%' }}
      />
      {showTag && <ImageKindTag kind={image.kind} />}
    </div>
  );
}
