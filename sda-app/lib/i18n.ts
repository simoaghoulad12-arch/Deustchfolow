import type { Bilingual } from '@/content/types';

/**
 * Sprache der Oberfläche: Deutsch (Standard) oder Arabisch/Darija (RTL).
 * Unterrichtsinhalte bleiben immer Deutsch; Arabisch nur für Oberfläche und Hinweise.
 */
export const LANGS = ['de', 'ar'] as const;
export type Lang = (typeof LANGS)[number];
export const isLang = (v: unknown): v is Lang => LANGS.includes(v as Lang);
export const dirOf = (lang: Lang) => (lang === 'ar' ? 'rtl' : 'ltr');

export const THEMES = ['system', 'light', 'dark'] as const;
export type Theme = (typeof THEMES)[number];
export const isTheme = (v: unknown): v is Theme => THEMES.includes(v as Theme);

export const LANG_COOKIE = 'sda-lang';
export const THEME_COOKIE = 'sda-theme';

/** Texte der Oberfläche. Arabisch in Darija wie in legacy/index.html. */
export const UI = {
  brand: { de: 'Smart Deutsch Akademie', ar: 'Smart Deutsch Akademie' },
  tagline: { de: 'Academy System', ar: 'نظام الأكاديمية' },
  menu: { de: 'Menü', ar: 'القائمة' },
  close: { de: 'Schließen', ar: 'سد' },
  search: { de: 'Suche', ar: 'بحث' },
  searchPlaceholder: { de: 'Stunden, Module, Lernziele …', ar: 'الحصص، الوحدات، الأهداف …' },
  signOut: { de: 'Abmelden', ar: 'خروج' },
  language: { de: 'Sprache', ar: 'اللغة' },
  theme: { de: 'Darstellung', ar: 'المظهر' },
  themeSystem: { de: 'Wie das Gerät', ar: 'بحال الجهاز' },
  themeLight: { de: 'Hell', ar: 'فاتح' },
  themeDark: { de: 'Dunkel', ar: 'غامق' },
  german: { de: 'Deutsch', ar: 'الألمانية' },
  arabic: { de: 'Arabisch (Darija)', ar: 'العربية (الدارجة)' },
  save: { de: 'Speichern', ar: 'حفظ' },
  mainNav: { de: 'Hauptnavigation', ar: 'التنقل الرئيسي' },
  skipToContent: { de: 'Zum Inhalt springen', ar: 'سير للمحتوى' },
  comingInPhase: {
    de: 'Diese Seite wird in Phase {n} gebaut.',
    ar: 'هاد الصفحة غادي تتبنى فالمرحلة {n}.',
  },
  contentNote: {
    de: 'Unterrichtsinhalte bleiben Deutsch. Arabisch nur für Oberfläche und Hinweise.',
    ar: 'محتوى الدروس كيبقى بالألمانية. العربية غير للواجهة والملاحظات.',
  },
  noResults: { de: 'Keine Treffer.', ar: 'ما كاين حتى نتيجة.' },
  results: { de: 'Treffer', ar: 'نتائج' },
  team: { de: 'Team und Zugänge', ar: 'الفريق والولوج' },
  labelsTitle: { de: 'Kennzeichnung der Inhalte', ar: 'تصنيف المحتوى' },
} satisfies Record<string, Bilingual>;

export type UIKey = keyof typeof UI;

export function t(lang: Lang, key: UIKey, vars?: Record<string, string | number>): string {
  let s: string = UI[key][lang] || UI[key].de;
  for (const [k, v] of Object.entries(vars ?? {})) s = s.replace(`{${k}}`, String(v));
  return s;
}

/** Text in der gewählten Sprache, Rückfall auf Deutsch. */
export const pick = (lang: Lang, b: Bilingual) => (lang === 'ar' && b.ar ? b.ar : b.de);
