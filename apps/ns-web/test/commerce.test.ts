import { availability, products, getProduct, SIZE_GUIDES } from '@/lib/commerce/catalog';
import { SETS, separatePrice, setProducts } from '@/lib/commerce/sets';
import {
  DEFAULT_SHIPPING,
  SHIPPING_METHODS,
  formatPrice,
  getCommerceProvider,
  shippingFor,
} from '@/lib/commerce/provider';
import { WORLDS } from '@/lib/brand';
import { kindOf } from '@/lib/images';

/** Pricing architecture (docs/PRICING.md). Changing a price means changing it here too, on purpose. */
const PRICE_ARCHITECTURE_DH: Record<string, number> = {
  'crew-socks': 79,
  'signature-cap': 199,
  'performance-tank': 249,
  'essential-tee': 249,
  'essential-shorts': 249,
  'crossbody-bag': 249,
  'training-shorts': 299,
  'performance-tee': 299,
  'graphic-tee': 329,
  'compression-long-sleeve': 349,
  'gym-bag': 399,
  jogger: 449,
  'premium-hoodie': 549,
};

describe('catalog', () => {
  it('has unique slugs and unique SKUs', () => {
    const slugs = products.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    const skus = products.flatMap((p) => p.variants.map((v) => v.sku));
    expect(new Set(skus).size).toBe(skus.length);
  });

  it('prices every product in MAD according to the architecture', () => {
    expect(products.map((p) => p.slug).sort()).toEqual(Object.keys(PRICE_ARCHITECTURE_DH).sort());
    for (const p of products) {
      expect(p.price.currency).toBe('MAD');
      expect(p.price.amountCents).toBe(PRICE_ARCHITECTURE_DH[p.slug]! * 100);
    }
  });

  it('gives every product a world, images and a variant for every colour × size', () => {
    for (const p of products) {
      expect(WORLDS[p.world]).toBeDefined();
      expect(p.images.length).toBeGreaterThan(0);
      expect(p.variants).toHaveLength(p.colors.length * p.sizes.length);
      if (p.sizeGuide !== 'one-size') expect(SIZE_GUIDES[p.sizeGuide]).not.toBeNull();
    }
  });

  it('makes no unverified material/fit claims', () => {
    for (const p of products) expect(p.specs).toBeUndefined();
  });

  it('labels every image by what it really is (folder = kind)', () => {
    for (const p of products) {
      for (const img of p.images) expect(img.kind).toBe(kindOf(img.src));
    }
    for (const s of SETS) expect(s.image.kind).toBe(kindOf(s.image.src));
  });

  it('leads with real photography whenever a product has any', () => {
    for (const p of products) {
      if (p.images.some((i) => i.kind === 'photo')) expect(p.images[0].kind).toBe('photo');
    }
  });

  it('never reports untracked stock as "In stock"', () => {
    const tank = getProduct('performance-tank')!;
    expect(availability(tank, 'Black', 'M').tone).toBe('unknown');
    const tracked = {
      ...tank,
      variants: tank.variants.map((v) => ({
        ...v,
        inventory: v.size === 'M' ? 0 : v.size === 'L' ? 3 : 20,
      })),
    };
    expect(availability(tracked, 'Black', 'M').tone).toBe('out');
    expect(availability(tracked, 'Black', 'L')).toEqual({ label: 'Only 3 left', tone: 'low' });
    expect(availability(tracked, 'Black', 'XL').tone).toBe('ok');
  });
});

describe('sets', () => {
  it('reference existing products and cost less than buying separately — modestly', () => {
    for (const set of SETS) {
      expect(setProducts(set).length).toBe(set.items.length);
      const separate = separatePrice(set);
      expect(set.priceCents).toBeLessThan(separate);
      const saving = 1 - set.priceCents / separate;
      expect(saving).toBeGreaterThan(0.05);
      expect(saving).toBeLessThanOrEqual(0.12);
    }
  });
});

describe('money & delivery', () => {
  it('formats dirham prices', () => {
    expect(formatPrice(24900)).toBe('249 DH');
    expect(formatPrice(7900)).toBe('79 DH');
    expect(formatPrice(149950)).toMatch(/^1.499,50 DH$/);
  });

  it('does not invent shipping rates', () => {
    expect(SHIPPING_METHODS[0]).toBe(DEFAULT_SHIPPING);
    for (const m of SHIPPING_METHODS) expect(shippingFor(m, 100000)).toBeNull();
  });

  it('refuses checkout honestly while no backend is connected', async () => {
    const res = await getCommerceProvider().createCheckout({
      lines: [],
      shippingId: DEFAULT_SHIPPING.id,
    });
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.reason).toBe('not_configured');
  });
});
