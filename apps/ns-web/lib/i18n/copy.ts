import { useLocale } from './context';
import type { Locale } from './locale';

/**
 * Copy for both languages lives next to each other, grouped by area in
 * lib/i18n/copy/*. Both sides share one type, so a missing Arabic string
 * fails the typecheck. Arabic is Modern Standard Arabic. Kept in Latin on
 * purpose: NATYSIMO, Natty Simo, @natty.simo, "Collection 01" is translated,
 * legal terms like Widerruf / Impressum / AGB stay as the German terms.
 */
export type Copy<T> = { en: T; ar: T };

/** Client components: const t = useCopy(shell). */
export function useCopy<T>(copy: Copy<T>): T {
  return copy[useLocale()];
}

/** Server components: const t = pick(shell, getLocale()). */
export function pick<T>(copy: Copy<T>, locale: Locale): T {
  return copy[locale];
}
