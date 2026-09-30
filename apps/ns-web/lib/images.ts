import type { ProductImage } from '@/lib/commerce/types';

/**
 * Asset folders encode what an image is:
 *   /images/photo/   real photography of produced pieces
 *   /images/render/  product mock-ups (flat lays)
 *   /images/concept/ moodboard campaign concepts
 */
export function kindOf(src: string): ProductImage['kind'] {
  if (src.startsWith('/images/render/')) return 'render';
  if (src.startsWith('/images/concept/')) return 'concept';
  return 'photo';
}
