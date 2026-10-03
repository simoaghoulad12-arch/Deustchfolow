import { SETS } from '@/lib/commerce/sets';
import { products } from '@/lib/commerce/catalog';
import { formatPrice } from '@/lib/commerce/provider';
import { availability } from '@/lib/commerce/catalog';
import { localizeProduct, localizedProducts, colorName, sizeGuide } from '@/lib/i18n/products';
import { localizeSet, setTitleFor } from '@/lib/i18n/sets';
import { localizedWorlds } from '@/lib/i18n/worlds';
import { lineName, lineVariant } from '@/lib/i18n/cart';
import { dirOf, htmlLang, isLocale } from '@/lib/i18n/locale';
import { shell } from '@/lib/i18n/copy/shell';

const ARABIC = /[؀-ۿ]/;
const LATIN_WORD = /[A-Za-z]{3,}/g;

/** Latin words that are allowed inside Arabic copy: brand names, keywords, legal terms. */
const ALLOWED = new Set([
  'NATYSIMO',
  'AGB',
  'Natty',
  'Simo',
  'Squad',
  'NS',
  'APPAREL',
  'EU',
  'GDPR',
  'Widerruf',
  'Impressum',
  'Datenschutz',
  'SQUAD',
]);

function latinLeftovers(text: string): string[] {
  return (text.match(LATIN_WORD) ?? []).filter((w) => !ALLOWED.has(w));
}

describe('locale helpers', () => {
  it('knows two locales and the writing direction', () => {
    expect(isLocale('ar')).toBe(true);
    expect(isLocale('de')).toBe(false);
    expect(dirOf('ar')).toBe('rtl');
    expect(dirOf('en')).toBe('ltr');
    expect(htmlLang('ar')).toBe('ar');
  });
});

describe('Arabic catalog', () => {
  it('translates every product (name, line, story, details, image alts)', () => {
    for (const p of products) {
      const a = localizeProduct(p, 'ar');
      expect(a.name).toMatch(ARABIC);
      expect(a.line).toMatch(ARABIC);
      expect(a.story).toMatch(ARABIC);
      expect(a.details).toHaveLength(p.details.length);
      expect(a.images).toHaveLength(p.images.length);
      for (const image of a.images) expect(image.alt).toMatch(ARABIC);
      for (const field of [a.name, a.line, a.story, ...a.details, ...a.images.map((i) => i.alt)])
        expect(latinLeftovers(field)).toEqual([]);
    }
  });

  it('never changes prices, SKUs, sizes or images', () => {
    products.forEach((p, i) => {
      const a = localizedProducts('ar')[i]!;
      expect(a.price).toEqual(p.price);
      expect(a.variants).toEqual(p.variants);
      expect(a.sizes).toEqual(p.sizes);
      expect(a.images.map((x) => x.src)).toEqual(p.images.map((x) => x.src));
      expect(a.specs).toEqual(p.specs);
    });
  });

  it('translates every set and keeps its price and items', () => {
    for (const set of SETS) {
      const a = localizeSet(set, 'ar');
      expect(a.name).toMatch(ARABIC);
      expect(a.priceCents).toBe(set.priceCents);
      expect(a.items).toEqual(set.items);
      expect(setTitleFor(a, 'ar').startsWith('طقم')).toBe(true);
    }
  });

  it('translates the three worlds', () => {
    const worlds = localizedWorlds('ar');
    for (const w of Object.values(worlds)) {
      expect(w.name).toMatch(ARABIC);
      expect(w.intro).toMatch(ARABIC);
      expect(w.palette.every((c) => ARABIC.test(c.name))).toBe(true);
    }
  });

  it('keeps English as it is', () => {
    expect(localizeProduct(products[0]!, 'en')).toBe(products[0]);
    expect(colorName('Black', 'en')).toBe('Black');
    expect(colorName('Black', 'ar')).toBe('أسود');
  });

  it('translates size guides and availability, keeping the honesty rule', () => {
    expect(sizeGuide('tops', 'ar')?.title).toMatch(ARABIC);
    expect(sizeGuide('one-size', 'ar')).toBeNull();
    const a = availability(products[0]!, 'Black', null, 'ar');
    expect(a.tone).toBe('unknown');
    expect(a.label).toMatch(ARABIC);
    expect(a.label).not.toBe('متوفر');
  });
});

describe('money and cart in Arabic', () => {
  it('formats prices in dirham for both languages', () => {
    expect(formatPrice(24900)).toBe('249 DH');
    expect(formatPrice(24900, 'ar')).toBe('249 د.م');
  });

  it('translates stored (English) cart lines for display only', () => {
    const line = {
      sku: 'NS01-PERFORMANCE-TANK-BLA-M',
      slug: 'performance-tank',
      name: 'Performance Tank',
      world: 'sports' as const,
      color: 'Black',
      size: 'M',
      unitPriceCents: 24900,
      quantity: 1,
      image: '/x.jpg',
    };
    expect(lineName(line, 'en')).toBe('Performance Tank');
    expect(lineName(line, 'ar')).toMatch(ARABIC);
    expect(lineVariant(line, 'ar')).toBe('أسود · M');
    expect(lineName({ ...line, slug: 'sets/training-set', name: 'Training Set' }, 'ar')).toBe(
      'طقم التدريب',
    );
  });
});

describe('shell copy', () => {
  it('has Arabic for navigation, footer and cart with no leftover English words', () => {
    const ar = shell.ar;
    const strings = [
      ...Object.values(ar.nav),
      ar.header.menu,
      ar.header.search,
      ...Object.values(ar.footer).flat(),
      ...Object.values(ar.dock),
      ar.cart.empty,
      ar.cart.checkout,
      ar.toast.saved,
      ar.roots,
    ];
    for (const text of strings) {
      expect(text).toMatch(ARABIC);
      expect(latinLeftovers(text)).toEqual([]);
    }
  });
});
