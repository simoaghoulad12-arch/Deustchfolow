'use client';

import { useState } from 'react';
import Image from 'next/image';
import { PlaceholderArt } from '@/components/ui/PlaceholderArt';
import { cn } from '@/lib/cn';
import type { ProductCategory } from '@/data/products';

interface ProductVisualProps {
  src: string;
  alt: string;
  category: ProductCategory;
  className?: string;
  priority?: boolean;
  sizes?: string;
}

/**
 * Renders real product photography once it exists at `src`; falls back to
 * the ghost-mannequin placeholder if the asset hasn't been supplied yet.
 * No code change is needed when photography arrives — only the file.
 */
export function ProductVisual({ src, alt, category, className, priority, sizes }: ProductVisualProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return <PlaceholderArt category={category} className={cn('h-full w-full', className)} />;
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      priority={priority}
      sizes={sizes ?? '100vw'}
      className={cn('object-cover', className)}
      onError={() => setFailed(true)}
    />
  );
}
