import type { WorldId } from '@/lib/brand';
import { getProduct } from './catalog';
import type { Product } from './types';

/**
 * Curated sets. Each set has a permanent set price — it is how the looks are
 * sold, not a promotion, so it never expires and is never shown as "% off".
 * The saving is modest on purpose (≈ 9–10 %): NATYSIMO does not train
 * customers to wait for discounts.
 */
export interface ProductSet {
  slug: string;
  name: string;
  world: WorldId;
  tagline: string;
  story: string;
  items: string[];
  priceCents: number;
  image: { src: string; alt: string; kind: 'photo' | 'render' | 'concept'; position?: string };
}

export const SETS: ProductSet[] = [
  {
    slug: 'training-set',
    name: 'Training Set',
    world: 'sports',
    tagline: 'Tank + Training Shorts',
    story:
      'The uniform the brand was built in. One line, top to bottom — silver contour lines on black.',
    items: ['performance-tank', 'training-shorts'],
    priceCents: 49900,
    image: {
      src: '/images/render/flatlay-tank-shorts.jpg',
      alt: 'Performance Tank and Training Shorts laid flat',
      kind: 'render',
    },
  },
  {
    slug: 'gym-to-street',
    name: 'Gym-to-Street',
    world: 'hybrid',
    tagline: 'Tee + Shorts + Crossbody + Socks',
    story:
      'Exactly as worn on Königsallee: the Essential Tee and Shorts, the Crossbody Bag and Crew Socks. From the last set to the city.',
    items: ['essential-tee', 'essential-shorts', 'crossbody-bag', 'crew-socks'],
    priceCents: 74900,
    image: {
      src: '/images/photo/founder-duesseldorf.jpg',
      alt: 'The complete Gym-to-Street look worn in Düsseldorf',
      kind: 'photo',
      position: '50% 35%',
    },
  },
  {
    slug: 'gym-starter',
    name: 'Gym Starter',
    world: 'sports',
    tagline: 'Performance Tee + Training Shorts + Socks',
    story: 'Everything for the first session, and every session after it.',
    items: ['performance-tee', 'training-shorts', 'crew-socks'],
    priceCents: 61900,
    image: {
      src: '/images/concept/tee-shorts.jpg',
      alt: 'Performance Tee and Training Shorts, concept visual',
      kind: 'concept',
    },
  },
  {
    slug: 'full-look',
    name: 'Full Look',
    world: 'hybrid',
    tagline: 'Premium Hoodie + Jogger',
    story: 'The layer for the walk to the gym, the cold mornings and the days off.',
    items: ['premium-hoodie', 'jogger'],
    priceCents: 89900,
    image: {
      src: '/images/concept/hoodie-jogger.jpg',
      alt: 'Hoodie and Jogger worn together, concept visual',
      kind: 'concept',
    },
  },
];

export function getSet(slug: string): ProductSet | undefined {
  return SETS.find((s) => s.slug === slug);
}

export function setProducts(set: ProductSet): Product[] {
  return set.items.map((slug) => {
    const product = getProduct(slug);
    if (!product) throw new Error(`Set ${set.slug} references unknown product ${slug}`);
    return product;
  });
}

/** Sum of the items bought separately. */
export function separatePrice(set: ProductSet): number {
  return setProducts(set).reduce((sum, p) => sum + p.price.amountCents, 0);
}

export function setsContaining(productSlug: string): ProductSet[] {
  return SETS.filter((s) => s.items.includes(productSlug));
}

/** "Gym-to-Street" → "Gym-to-Street Set"; "Training Set" stays as is. */
export function setTitle(set: ProductSet): string {
  return /\bset$/i.test(set.name) ? set.name : `${set.name} Set`;
}
