export type ProductCategory =
  | 'tanktop'
  | 'tee'
  | 'longsleeve'
  | 'hoodie'
  | 'pants'
  | 'shorts'
  | 'cap'
  | 'bag'
  | 'socks';

export interface ProductImageSet {
  /** Large hero/story image, ~4:5. */
  hero: string;
  /** Front, back, detail, editorial — order matters for the product story. */
  gallery: string[];
}

export interface Product {
  slug: string;
  name: string;
  /** Line tier, as shown on the Nattysimo product board (e.g. "Performance", "Essential"). */
  tier: string;
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
  /**
   * True once real photography exists for this product. Drives whether the
   * PDP shows a detail gallery (real photos only) or a single honest
   * "coming soon" panel — never a repeated placeholder pretending to be
   * five different detail shots. Flip this when real images land.
   */
  hasPhotography: boolean;
}

function placeholderImages(slug: string): ProductImageSet {
  return {
    hero: `/images/products/${slug}/hero.jpg`,
    gallery: [
      `/images/products/${slug}/front.jpg`,
      `/images/products/${slug}/back.jpg`,
      `/images/products/${slug}/detail-logo.jpg`,
      `/images/products/${slug}/fabric.jpg`,
      `/images/products/${slug}/editorial.jpg`,
    ],
  };
}

export const products: Product[] = [
  {
    slug: 'ns-tanktop-performance',
    name: 'NS TANKTOP',
    tier: 'Performance',
    category: 'tanktop',
    priceCents: 4500,
    colors: ['Black'],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    story: 'Built for the set no one is filming. Moves the way you do.',
    images: {
      hero: '/images/real/tanktop-front.png',
      gallery: ['/images/real/tanktop-front.png', '/images/real/tanktop-shorts-side.png'],
    },
    hasPhotography: true,
  },
  {
    slug: 'ns-tshirt-essential',
    name: 'NS T-SHIRT',
    tier: 'Essential',
    category: 'tee',
    priceCents: 4900,
    colors: ['Black', 'Off-White'],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    story: 'The foundation. Built to disappear into your discipline, not distract from it.',
    images: placeholderImages('ns-tshirt-essential'),
    hasPhotography: false,
  },
  {
    slug: 'ns-longsleeve-compression',
    name: 'NS LONGSLEEVE',
    tier: 'Compression',
    category: 'longsleeve',
    priceCents: 5900,
    colors: ['Black', 'Dark Grey'],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    story: 'A second skin. Engineered for movement, made for the work no one sees.',
    images: placeholderImages('ns-longsleeve-compression'),
    hasPhotography: false,
  },
  {
    slug: 'ns-hoodie-premium',
    name: 'NS HOODIE',
    tier: 'Premium',
    category: 'hoodie',
    priceCents: 10900,
    colors: ['Black', 'Off-White'],
    sizes: ['S', 'M', 'L', 'XL'],
    story: 'Quiet weight. Worn by people who don’t need to explain themselves.',
    images: placeholderImages('ns-hoodie-premium'),
    hasPhotography: false,
  },
  {
    slug: 'ns-zip-hoodie-essential',
    name: 'NS ZIP HOODIE',
    tier: 'Essential',
    category: 'hoodie',
    priceCents: 8900,
    colors: ['Black', 'Dark Grey'],
    sizes: ['S', 'M', 'L', 'XL'],
    story: 'Armor for the hours before anyone else is awake.',
    images: placeholderImages('ns-zip-hoodie-essential'),
    hasPhotography: false,
  },
  {
    slug: 'ns-jogger-comfort',
    name: 'NS JOGGER',
    tier: 'Comfort',
    category: 'pants',
    priceCents: 8900,
    colors: ['Black', 'Dark Grey'],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    story: 'Discipline has a silhouette. This is it.',
    images: placeholderImages('ns-jogger-comfort'),
    hasPhotography: false,
  },
  {
    slug: 'ns-shorts-training',
    name: 'NS SHORTS',
    tier: 'Training',
    category: 'shorts',
    priceCents: 5900,
    colors: ['Black'],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    story: 'Nothing extra. Only what movement requires.',
    images: {
      hero: '/images/real/tanktop-shorts-side.png',
      gallery: ['/images/real/tanktop-shorts-side.png', '/images/real/tanktop-front.png'],
    },
    hasPhotography: true,
  },
  {
    slug: 'ns-cap-signature',
    name: 'NS CAP',
    tier: 'Signature',
    category: 'cap',
    priceCents: 3500,
    colors: ['Black'],
    sizes: ['One Size'],
    story: 'The mark, forward and center. For the walk to the gym, not just the work in it.',
    images: placeholderImages('ns-cap-signature'),
    hasPhotography: false,
  },
  {
    slug: 'ns-gym-bag-elite',
    name: 'NS GYM BAG',
    tier: 'Elite',
    category: 'bag',
    priceCents: 7900,
    colors: ['Black'],
    sizes: ['One Size'],
    story: 'Everything you need for the session. Nothing you don’t.',
    images: placeholderImages('ns-gym-bag-elite'),
    hasPhotography: false,
  },
  {
    slug: 'ns-socks-performance',
    name: 'NS SOCKS',
    tier: 'Performance',
    category: 'socks',
    priceCents: 1900,
    colors: ['Black'],
    sizes: ['S/M', 'L/XL'],
    story: 'The last detail. Built with the same discipline as everything above it.',
    images: placeholderImages('ns-socks-performance'),
    hasPhotography: false,
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
