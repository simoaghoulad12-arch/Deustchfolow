export type ProductCategory = 'tee' | 'hoodie' | 'shorts' | 'pants';

export interface ProductImageSet {
  /** Large hero/story image, ~4:5. */
  hero: string;
  /** Front, back, detail, editorial — order matters for the product story. */
  gallery: string[];
}

export interface Product {
  slug: string;
  name: string;
  category: ProductCategory;
  /** Price in EUR cents. Single source of truth — change here only. */
  priceCents: number;
  colors: string[];
  sizes: string[];
  story: string;
  /** Only populated when real, verified data exists. Never invented. */
  material?: string;
  care?: string;
  fit?: string;
  images: ProductImageSet;
}

export const products: Product[] = [
  {
    slug: 'ns-essential-tee',
    name: 'NS ESSENTIAL TEE',
    category: 'tee',
    priceCents: 4900,
    colors: ['Black', 'Off-White'],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    story: 'The foundation. Built to disappear into your discipline, not distract from it.',
    images: {
      hero: '/images/products/ns-essential-tee/hero.jpg',
      gallery: [
        '/images/products/ns-essential-tee/front.jpg',
        '/images/products/ns-essential-tee/back.jpg',
        '/images/products/ns-essential-tee/detail-logo.jpg',
        '/images/products/ns-essential-tee/fabric.jpg',
        '/images/products/ns-essential-tee/editorial.jpg',
      ],
    },
  },
  {
    slug: 'ns-performance-tee',
    name: 'NS PERFORMANCE TEE',
    category: 'tee',
    priceCents: 5900,
    colors: ['Black', 'Dark Grey'],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    story: 'Engineered for movement. Made for the work no one sees.',
    images: {
      hero: '/images/products/ns-performance-tee/hero.jpg',
      gallery: [
        '/images/products/ns-performance-tee/front.jpg',
        '/images/products/ns-performance-tee/back.jpg',
        '/images/products/ns-performance-tee/detail-logo.jpg',
        '/images/products/ns-performance-tee/fabric.jpg',
        '/images/products/ns-performance-tee/editorial.jpg',
      ],
    },
  },
  {
    slug: 'ns-training-hoodie',
    name: 'NS TRAINING HOODIE',
    category: 'hoodie',
    priceCents: 8900,
    colors: ['Black', 'Dark Grey'],
    sizes: ['S', 'M', 'L', 'XL'],
    story: 'Armor for the hours before anyone else is awake.',
    images: {
      hero: '/images/products/ns-training-hoodie/hero.jpg',
      gallery: [
        '/images/products/ns-training-hoodie/front.jpg',
        '/images/products/ns-training-hoodie/back.jpg',
        '/images/products/ns-training-hoodie/detail-logo.jpg',
        '/images/products/ns-training-hoodie/fabric.jpg',
        '/images/products/ns-training-hoodie/editorial.jpg',
      ],
    },
  },
  {
    slug: 'ns-essential-hoodie',
    name: 'NS ESSENTIAL HOODIE',
    category: 'hoodie',
    priceCents: 9900,
    colors: ['Black', 'Off-White'],
    sizes: ['S', 'M', 'L', 'XL'],
    story: 'Quiet weight. Worn by people who don’t need to explain themselves.',
    images: {
      hero: '/images/products/ns-essential-hoodie/hero.jpg',
      gallery: [
        '/images/products/ns-essential-hoodie/front.jpg',
        '/images/products/ns-essential-hoodie/back.jpg',
        '/images/products/ns-essential-hoodie/detail-logo.jpg',
        '/images/products/ns-essential-hoodie/fabric.jpg',
        '/images/products/ns-essential-hoodie/editorial.jpg',
      ],
    },
  },
  {
    slug: 'ns-performance-shorts',
    name: 'NS PERFORMANCE SHORTS',
    category: 'shorts',
    priceCents: 5900,
    colors: ['Black'],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    story: 'Nothing extra. Only what movement requires.',
    images: {
      hero: '/images/products/ns-performance-shorts/hero.jpg',
      gallery: [
        '/images/products/ns-performance-shorts/front.jpg',
        '/images/products/ns-performance-shorts/back.jpg',
        '/images/products/ns-performance-shorts/detail-logo.jpg',
        '/images/products/ns-performance-shorts/fabric.jpg',
        '/images/products/ns-performance-shorts/editorial.jpg',
      ],
    },
  },
  {
    slug: 'ns-training-pants',
    name: 'NS TRAINING PANTS',
    category: 'pants',
    priceCents: 8900,
    colors: ['Black', 'Dark Grey'],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    story: 'Discipline has a silhouette. This is it.',
    images: {
      hero: '/images/products/ns-training-pants/hero.jpg',
      gallery: [
        '/images/products/ns-training-pants/front.jpg',
        '/images/products/ns-training-pants/back.jpg',
        '/images/products/ns-training-pants/detail-logo.jpg',
        '/images/products/ns-training-pants/fabric.jpg',
        '/images/products/ns-training-pants/editorial.jpg',
      ],
    },
  },
];

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((product) => product.slug === slug);
}

export function formatPrice(cents: number): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
  }).format(cents / 100);
}
