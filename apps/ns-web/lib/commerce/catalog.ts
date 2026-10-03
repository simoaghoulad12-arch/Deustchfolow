import type { WorldId } from '@/lib/brand';
import type { NonEmpty, Product, ProductColor, ProductImage, Variant } from './types';

/**
 * COLLECTION 01 catalog.
 *
 * - Prices are in Moroccan dirham, stored in centimes (24900 = 249 DH). They
 *   follow the pricing architecture in docs/PRICING.md and are the only
 *   source of truth for the storefront.
 * - `specs` is intentionally empty on every product: no fabric, weight or
 *   technical claims until the brand confirms them.
 * - `details` lists only what is visible in the supplied imagery.
 * - Inventory is `null` (untracked) until an inventory backend is connected.
 */

const BLACK: ProductColor = { name: 'Black', hex: '#0b0b0b' };
const IVORY: ProductColor = { name: 'Ivory', hex: '#ece5d6' };

const TOPS: NonEmpty<string> = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const BOTTOMS: NonEmpty<string> = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

const IMG = {
  gymMirror: { src: '/images/photo/gym-tank-mirror.jpg', width: 1086, height: 1448, kind: 'photo' },
  gymSide: { src: '/images/photo/gym-tank-shorts.jpg', width: 1086, height: 1448, kind: 'photo' },
  flatTank: {
    src: '/images/render/flatlay-tank-shorts.jpg',
    width: 896,
    height: 1195,
    kind: 'render',
  },
  flatEssential: {
    src: '/images/render/flatlay-essential-tee.jpg',
    width: 896,
    height: 1195,
    kind: 'render',
  },
  flatApparel: {
    src: '/images/render/flatlay-apparel-tee.jpg',
    width: 896,
    height: 1195,
    kind: 'render',
  },
  founder: {
    src: '/images/photo/founder-duesseldorf.jpg',
    width: 1086,
    height: 1358,
    kind: 'photo',
  },
  compression: {
    src: '/images/concept/compression-ls.jpg',
    width: 237,
    height: 442,
    kind: 'concept',
  },
  teeShorts: { src: '/images/concept/tee-shorts.jpg', width: 242, height: 442, kind: 'concept' },
  hoodieJogger: {
    src: '/images/concept/hoodie-jogger.jpg',
    width: 256,
    height: 442,
    kind: 'concept',
  },
  ivoryHoodie: {
    src: '/images/concept/ivory-hoodie-bag.jpg',
    width: 250,
    height: 442,
    kind: 'concept',
  },
  cap: { src: '/images/concept/web-cap.jpg', width: 174, height: 170, kind: 'concept' },
  bag: { src: '/images/concept/web-bag.jpg', width: 125, height: 170, kind: 'concept' },
  drawcord: {
    src: '/images/concept/detail-drawcord.jpg',
    width: 160,
    height: 142,
    kind: 'concept',
  },
} as const satisfies Record<string, Omit<ProductImage, 'alt' | 'role'>>;

function img(
  key: keyof typeof IMG,
  role: ProductImage['role'],
  alt: string,
  position?: string,
): ProductImage {
  return { ...IMG[key], role, alt, position };
}

function variants(slug: string, colors: ProductColor[], sizes: string[]): Variant[] {
  const prefix = slug.toUpperCase();
  return colors.flatMap((color) =>
    sizes.map((size) => ({
      sku: `NS01-${prefix}-${color.name.slice(0, 3).toUpperCase()}-${size.replace(/\W/g, '')}`,
      color: color.name,
      size,
      inventory: null,
    })),
  );
}

function product(input: Omit<Product, 'variants' | 'price'> & { priceCents: number }): Product {
  const { priceCents, ...rest } = input;
  return {
    ...rest,
    price: { amountCents: priceCents, currency: 'MAD' },
    variants: variants(input.slug, input.colors, input.sizes),
  };
}

export const products: Product[] = [
  // ─── SPORTS ────────────────────────────────────────────────────────────
  product({
    slug: 'performance-tank',
    name: 'Performance Tank',
    world: 'sports',
    category: 'tank',
    line: 'Performance',
    priceCents: 24900,
    colors: [BLACK],
    sizes: TOPS,
    sizeGuide: 'tops',
    featured: true,
    story:
      'The piece the brand was built in. Deep armholes, silver contour lines running the length of the body and the crown monogram at the chest — made for the set nobody is filming.',
    details: [
      'Crown monogram, left chest',
      'Silver contour lines, front and sides',
      'Racer-cut armholes',
    ],
    images: [
      img('gymMirror', 'model', 'Performance Tank worn in the gym, front view', '50% 45%'),
      img(
        'flatTank',
        'flatlay',
        'Performance Tank laid flat with the crown monogram and silver contour lines',
      ),
      img('gymSide', 'model', 'Performance Tank and Training Shorts worn together', '50% 45%'),
    ],
  }),
  product({
    slug: 'training-shorts',
    name: 'Training Shorts',
    world: 'sports',
    category: 'shorts',
    line: 'Training',
    priceCents: 29900,
    colors: [BLACK],
    sizes: BOTTOMS,
    sizeGuide: 'bottoms',
    featured: true,
    story:
      'Nothing extra. Only what movement requires — silver contour print and the crown monogram at the leg. Pairs with the Performance Tank as one line.',
    details: ['Crown monogram at the leg', 'Silver contour print', 'Above-knee length'],
    images: [
      img('gymSide', 'model', 'Training Shorts worn in the gym', '50% 70%'),
      img(
        'flatTank',
        'flatlay',
        'Training Shorts laid flat beside the Performance Tank',
        '80% 80%',
      ),
      img(
        'gymMirror',
        'model',
        'Training Shorts with the Performance Tank, mirror view',
        '50% 70%',
      ),
    ],
  }),
  product({
    slug: 'compression-long-sleeve',
    name: 'Compression Long Sleeve',
    world: 'sports',
    category: 'long-sleeve',
    line: 'Compression',
    priceCents: 34900,
    colors: [BLACK],
    sizes: TOPS,
    sizeGuide: 'tops',
    story:
      'A second skin for cold mornings and heavy sessions. Close to the body, monogram at the chest, nothing to catch on.',
    details: ['Close, body-contoured cut', 'Crown monogram at the chest', 'Full-length sleeves'],
    images: [img('compression', 'model', 'Compression Long Sleeve, concept visual')],
  }),
  product({
    slug: 'performance-tee',
    name: 'Performance Tee',
    world: 'sports',
    category: 'tee',
    line: 'Performance',
    priceCents: 29900,
    colors: [BLACK],
    sizes: TOPS,
    sizeGuide: 'tops',
    story:
      'The training tee, cut athletic through the shoulders. Monogram at the chest — the standard, repeated daily.',
    details: ['Athletic cut through the shoulders', 'Crown monogram at the chest', 'Crew neck'],
    images: [img('teeShorts', 'model', 'Performance Tee, concept visual')],
  }),

  // ─── CLOTHING ──────────────────────────────────────────────────────────
  product({
    slug: 'essential-tee',
    name: 'Essential Tee',
    world: 'clothing',
    category: 'tee',
    line: 'Essential',
    priceCents: 24900,
    colors: [BLACK],
    sizes: TOPS,
    sizeGuide: 'tops',
    featured: true,
    story:
      'The foundation of the wardrobe. A clean black tee carrying the NS crown mark and NATYSIMO wordmark at the chest — worn on Königsallee, built for every day after.',
    details: ['NS crown mark with NATYSIMO wordmark, left chest', 'Crew neck'],
    images: [
      img('founder', 'lifestyle', 'Essential Tee worn in Düsseldorf', '50% 30%'),
      img(
        'flatEssential',
        'flatlay',
        'Essential Tee folded, monogram at the chest, beside the NATYSIMO box',
      ),
    ],
  }),
  product({
    slug: 'graphic-tee',
    name: 'Graphic Tee',
    world: 'clothing',
    category: 'tee',
    line: 'Oversized',
    priceCents: 32900,
    colors: [BLACK],
    sizes: TOPS,
    sizeGuide: 'tops',
    featured: true,
    story:
      'Oversized statement tee. A wire-mesh wave graphic over the NATYSIMO APPAREL wordmark — the brand said out loud.',
    details: [
      'Wire-mesh wave graphic, front',
      'NATYSIMO APPAREL wordmark',
      'Relaxed, oversized cut',
    ],
    images: [
      img(
        'flatApparel',
        'flatlay',
        'Apparel Graphic Tee folded, showing the wave graphic and NATYSIMO APPAREL wordmark',
      ),
    ],
  }),
  product({
    slug: 'premium-hoodie',
    name: 'Premium Hoodie',
    world: 'clothing',
    category: 'hoodie',
    line: 'Premium',
    priceCents: 54900,
    colors: [IVORY, BLACK],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    sizeGuide: 'tops',
    featured: true,
    story:
      'Quiet weight. The monogram in tone at the chest, a kangaroo pocket and a hood that frames without shouting.',
    details: [
      'Crown monogram at the chest',
      'Kangaroo pocket',
      'Drawcord hood',
      'Ribbed cuffs and hem',
    ],
    images: [img('ivoryHoodie', 'model', 'Premium Hoodie in ivory, concept visual')],
  }),
  product({
    slug: 'signature-cap',
    name: 'Signature Cap',
    world: 'clothing',
    category: 'cap',
    line: 'Signature',
    priceCents: 19900,
    colors: [BLACK],
    sizes: ['One Size'],
    sizeGuide: 'one-size',
    story:
      'The mark, forward and centre. Black on black with the crown monogram at the front panel.',
    details: ['Crown monogram, front panel', 'Curved peak'],
    images: [img('cap', 'model', 'Signature Cap, concept visual')],
  }),

  // ─── HYBRID ────────────────────────────────────────────────────────────
  product({
    slug: 'jogger',
    name: 'Jogger',
    world: 'hybrid',
    category: 'jogger',
    line: 'Comfort',
    priceCents: 44900,
    colors: [BLACK],
    sizes: BOTTOMS,
    sizeGuide: 'bottoms',
    featured: true,
    story:
      'Discipline has a silhouette. Tapered to the ankle, cuffed, monogram at the thigh — from warm-up to the walk home.',
    details: [
      'Tapered leg, cuffed ankle',
      'Drawcord waist with monogram aglets',
      'Monogram at the thigh',
    ],
    images: [
      img('hoodieJogger', 'model', 'Jogger worn with the hoodie, concept visual'),
      img('drawcord', 'detail', 'Drawcord with monogram aglets, concept detail'),
    ],
  }),
  product({
    slug: 'gym-bag',
    name: 'Gym Bag',
    world: 'hybrid',
    category: 'bag',
    line: 'Elite',
    priceCents: 39900,
    colors: [BLACK],
    sizes: ['One Size'],
    sizeGuide: 'one-size',
    story: 'Everything the session needs, nothing it doesn’t. The crown monogram front and centre.',
    details: ['Crown monogram, front', 'Carry handles'],
    images: [
      img('bag', 'front', 'Gym Bag, concept visual'),
      img(
        'ivoryHoodie',
        'lifestyle',
        'Gym Bag carried with the Premium Hoodie, concept visual',
        '50% 80%',
      ),
    ],
  }),
  product({
    slug: 'crossbody-bag',
    name: 'Crossbody Bag',
    world: 'hybrid',
    category: 'bag',
    line: 'Signature',
    priceCents: 24900,
    colors: [BLACK],
    sizes: ['One Size'],
    sizeGuide: 'one-size',
    story:
      'Phone, keys, card — worn across the body from the gym to the city. NS crown mark and wordmark on the front.',
    details: ['NS crown mark with NATYSIMO wordmark, front', 'Crossbody strap'],
    images: [
      img('founder', 'lifestyle', 'Crossbody Bag worn across the body in Düsseldorf', '45% 55%'),
    ],
  }),
  product({
    slug: 'essential-shorts',
    name: 'Essential Shorts',
    world: 'hybrid',
    category: 'shorts',
    line: 'Essential',
    priceCents: 24900,
    colors: [BLACK],
    sizes: BOTTOMS,
    sizeGuide: 'bottoms',
    story:
      'The off-duty short. Clean black, NS mark and wordmark at the leg — matches the Essential Tee as a set.',
    details: ['NS crown mark with NATYSIMO wordmark, leg'],
    images: [
      img('founder', 'lifestyle', 'Essential Shorts worn with the Essential Tee', '50% 70%'),
    ],
  }),
  product({
    slug: 'crew-socks',
    name: 'Crew Socks',
    world: 'hybrid',
    category: 'socks',
    line: 'Performance',
    priceCents: 7900,
    colors: [BLACK],
    sizes: ['39–42', '43–46'],
    sizeGuide: 'socks',
    story:
      'The last detail, built to the same standard as everything above it. NS crown mark at the ankle.',
    details: ['NS crown mark at the ankle', 'Crew height'],
    images: [img('founder', 'lifestyle', 'Crew Socks worn with black trainers', '50% 92%')],
  }),
];

export function getProduct(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function productsByWorld(world: WorldId): Product[] {
  return products.filter((p) => p.world === world);
}

export function featuredProducts(): Product[] {
  return products.filter((p) => p.featured);
}

export function findVariant(product: Product, color: string, size: string) {
  return product.variants.find((v) => v.color === color && v.size === size);
}

export function relatedProducts(product: Product, limit = 4): Product[] {
  const same = products.filter((p) => p.world === product.world && p.slug !== product.slug);
  const others = products.filter((p) => p.world !== product.world);
  return [...same, ...others].slice(0, limit);
}

export const SIZE_GUIDES = {
  tops: {
    title: 'Tops — body measurements (cm)',
    columns: ['Size', 'Chest', 'Waist'],
    rows: [
      ['XS', '84–88', '70–74'],
      ['S', '88–96', '74–82'],
      ['M', '96–104', '82–90'],
      ['L', '104–112', '90–98'],
      ['XL', '112–120', '98–106'],
      ['XXL', '120–128', '106–114'],
    ],
  },
  bottoms: {
    title: 'Bottoms — body measurements (cm)',
    columns: ['Size', 'Waist', 'Hip'],
    rows: [
      ['XS', '70–74', '86–90'],
      ['S', '74–82', '90–98'],
      ['M', '82–90', '98–106'],
      ['L', '90–98', '106–114'],
      ['XL', '98–106', '114–122'],
      ['XXL', '106–114', '122–130'],
    ],
  },
  socks: {
    title: 'Socks — EU shoe size',
    columns: ['Size', 'EU'],
    rows: [
      ['39–42', '39 – 42'],
      ['43–46', '43 – 46'],
    ],
  },
  'one-size': null,
} as const;

export type Availability = { label: string; tone: 'ok' | 'low' | 'out' | 'unknown' };

const AVAILABILITY = {
  en: {
    unknown: 'Collection 01 · availability confirmed at launch',
    soldOutSize: 'Sold out in this size',
    soldOut: 'Sold out',
    low: (units: number) => `Only ${units} left`,
    ok: 'In stock',
  },
  ar: {
    unknown: 'المجموعة 01 · يُؤكَّد التوفر عند الإطلاق',
    soldOutSize: 'نفدت الكمية في هذا المقاس',
    soldOut: 'نفدت الكمية',
    low: (units: number) => `متبقٍ ${units} فقط`,
    ok: 'متوفر',
  },
} as const;

/**
 * Stock status for the selected variant (or the product when no size is
 * chosen). Untracked inventory (`null`) never pretends to be "in stock".
 */
export function availability(
  product: Product,
  color: string,
  size: string | null,
  locale: 'en' | 'ar' = 'en',
): Availability {
  const t = AVAILABILITY[locale];
  const pool = product.variants.filter(
    (v) => v.color === color && (size === null || v.size === size),
  );
  if (pool.length === 0 || pool.every((v) => v.inventory === null)) {
    return { label: t.unknown, tone: 'unknown' };
  }
  const units = pool.reduce((n, v) => n + (v.inventory ?? 0), 0);
  if (units === 0) return { label: size ? t.soldOutSize : t.soldOut, tone: 'out' };
  if (units <= 5) return { label: t.low(units), tone: 'low' };
  return { label: t.ok, tone: 'ok' };
}
