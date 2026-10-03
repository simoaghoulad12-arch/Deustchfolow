import { getSet } from '@/lib/commerce/sets';
import { getProduct } from '@/lib/commerce/catalog';
import type { CartLine } from '@/lib/commerce/types';
import type { Locale } from './locale';
import { colorName, localizeProduct, sizeName } from './products';
import { localizeSet, setTitleFor } from './sets';

/**
 * Cart lines are stored in English (name, colour, size) so a basket survives a
 * language switch. These helpers translate them for display.
 */
export function lineName(line: CartLine, locale: Locale): string {
  if (locale === 'en') return line.name;
  if (line.slug.startsWith('sets/')) {
    const set = getSet(line.slug.slice('sets/'.length));
    return set ? setTitleFor(localizeSet(set, locale), locale) : line.name;
  }
  const product = getProduct(line.slug);
  return product ? localizeProduct(product, locale).name : line.name;
}

export function lineVariant(line: CartLine, locale: Locale): string {
  return `${colorName(line.color, locale)} · ${sizeName(line.size, locale)}`;
}
