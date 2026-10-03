/**
 * Two languages: English (default) and Modern Standard Arabic (right-to-left).
 * The choice lives in a cookie so no route has to move: server components read
 * it with getLocale() (lib/i18n/server.ts), client components with useLocale().
 */
export type Locale = 'en' | 'ar';

export const LOCALES: Locale[] = ['en', 'ar'];
export const DEFAULT_LOCALE: Locale = 'en';
export const LOCALE_COOKIE = 'ns-lang';

export function isLocale(value: unknown): value is Locale {
  return value === 'en' || value === 'ar';
}

export function dirOf(locale: Locale): 'ltr' | 'rtl' {
  return locale === 'ar' ? 'rtl' : 'ltr';
}

export function htmlLang(locale: Locale): string {
  return locale === 'ar' ? 'ar' : 'en';
}
