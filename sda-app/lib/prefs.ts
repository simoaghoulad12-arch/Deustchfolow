import 'server-only';
import { cookies } from 'next/headers';
import { isLang, isTheme, LANG_COOKIE, THEME_COOKIE, type Lang, type Theme } from './i18n';

/** Sprache und Darstellung aus Cookies (keine personenbezogenen Daten). */
export function getPrefs(): { lang: Lang; theme: Theme } {
  const c = cookies();
  const lang = c.get(LANG_COOKIE)?.value;
  const theme = c.get(THEME_COOKIE)?.value;
  return { lang: isLang(lang) ? lang : 'de', theme: isTheme(theme) ? theme : 'system' };
}
