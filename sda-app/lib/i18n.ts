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
  modeScript: { de: 'Skript', ar: 'النص' },
  modeSteps: { de: 'Schritte', ar: 'خطوات' },
  modeList: { de: 'Liste', ar: 'قائمة' },
  timerStart: { de: 'Stunden-Timer starten', ar: 'ابدأ مؤقت الحصة' },
  timerStop: { de: 'Timer stoppen', ar: 'أوقف المؤقت' },
  minute: { de: 'Minute', ar: 'الدقيقة' },
  fromMinute: { de: 'Ab Minute', ar: 'من الدقيقة' },
  lessonOver: {
    de: 'Die Stunde ist vorbei. Weiter mit dem Nachher-Teil.',
    ar: 'الحصة سالات. شوف الخطوات اللي من بعد.',
  },
  done: { de: 'Erledigt', ar: 'تم' },
  undo: { de: 'Rückgängig', ar: 'تراجع' },
  back: { de: 'Zurück', ar: 'رجوع' },
  prev: { de: 'Vorheriger Schritt', ar: 'الخطوة السابقة' },
  next: { de: 'Nächster Schritt', ar: 'الخطوة التالية' },
  step: { de: 'Schritt', ar: 'الخطوة' },
  after: { de: 'Danach:', ar: 'من بعد:' },
  lessonComplete: { de: 'Stunde abgeschlossen', ar: 'الحصة سالات' },
  allDone: { de: 'Alle deine Aufgaben sind erledigt.', ar: 'كل المهام ديالك تمات.' },
  nextLesson: { de: 'Nächste Stunde', ar: 'الحصة الجاية' },
  reset: { de: 'Diese Stunde zurücksetzen', ar: 'أعد ضبط هاد الحصة' },
  resetConfirm: {
    de: 'Alle Häkchen dieser Stunde entfernen?',
    ar: 'نحيدو كل العلامات ديال هاد الحصة؟',
  },
  roleToday: { de: 'Deine Rolle heute', ar: 'الدور ديالك اليوم' },
  nothingForYou: {
    de: 'In dieser Stunde gibt es keine Aufgaben für deine Rolle.',
    ar: 'ما كاين حتى مهمة ليك فهاد الحصة.',
  },
  solution: { de: 'Lösung', ar: 'الحل' },
  textbook: { de: 'Im Lehrbuch (Seite / Lektion)', ar: 'فالكتاب (الصفحة / الدرس)' },
  saved: { de: 'Gespeichert', ar: 'تحفظ' },
  saving: { de: 'Wird gespeichert …', ar: 'كيتحفظ …' },
  saveFailed: { de: 'Speichern fehlgeschlagen', ar: 'ما تحفظش' },
  leadToday: { de: 'Hauptlehrkraft heute', ar: 'الأستاذ الرئيسي اليوم' },
  vocabulary: { de: 'Wortschatz', ar: 'المفردات' },
  moduleGoal: { de: 'Lernziel der Einheit', ar: 'هدف الوحدة' },
  canDo: { de: 'Am Ende dieser Einheit kann der Schüler:', ar: 'فآخر هاد الوحدة الطالب كيقدر:' },
  whoAmI: { de: 'Meine Rolle im Team-Plan', ar: 'الدور ديالي فخطة الفريق' },
  whoAmIHint: {
    de: 'Bestimmt, welche Aufgaben du in jeder Stunde siehst. Gilt für dieses Gerät.',
    ar: 'كيحدد شنو المهام اللي كتشوف فكل حصة. خاص بهاد الجهاز.',
  },
  dayPlan: { de: 'Rollen pro Wochentag', ar: 'الأدوار حسب أيام الأسبوع' },
  dayPlanHint: {
    de: 'Vorschlag aus der bestehenden Version. Nur die Leitung kann ihn ändern.',
    ar: 'اقتراح من النسخة القديمة. غير الإدارة تقدر تبدلو.',
  },
  level: { de: 'Level', ar: 'المستوى' },
  area: { de: 'Bereich', ar: 'المجال' },
  status: { de: 'Status', ar: 'الحالة' },
  all: { de: 'Alle', ar: 'الكل' },
  showLessons: { de: 'Stunden anzeigen', ar: 'شوف الحصص' },
  noLessonsForFilter: {
    de: 'Keine Stunden für diesen Filter.',
    ar: 'ما كاين حتى حصة لهاد الاختيار.',
  },
  beforeModule1: { de: 'Vor Modul 1', ar: 'قبل الوحدة 1' },
  module: { de: 'Modul', ar: 'الوحدة' },
  myPath: { de: 'Mein Weg', ar: 'طريقي' },
  myHomework: { de: 'Hausaufgaben', ar: 'الواجبات' },
  myErrors: { de: 'Meine Fehler', ar: 'أخطائي' },
  germany: { de: 'Deutschland', ar: 'ألمانيا' },
  settings: { de: 'Einstellungen', ar: 'الإعدادات' },
  learnApp: { de: 'Lern-App', ar: 'تطبيق التعلم' },
  check: { de: 'Prüfen', ar: 'تحقق' },
  correct: { de: 'Richtig!', ar: 'صحيح!' },
  wrong: { de: 'Noch nicht richtig.', ar: 'ماشي صحيح.' },
  examPassed: { de: 'Prüfung bestanden', ar: 'نجحت فالامتحان' },
  locked: { de: 'Noch nicht freigeschaltet', ar: 'مازال ما تفتحش' },
  total: { de: 'Gesamt A1 → B2', ar: 'المجموع A1 → B2' },
} satisfies Record<string, Bilingual>;

export type UIKey = keyof typeof UI;

export function t(lang: Lang, key: UIKey, vars?: Record<string, string | number>): string {
  let s: string = UI[key][lang] || UI[key].de;
  for (const [k, v] of Object.entries(vars ?? {})) s = s.replace(`{${k}}`, String(v));
  return s;
}

/** Text in der gewählten Sprache, Rückfall auf Deutsch. */
export const pick = (lang: Lang, b: Bilingual) => (lang === 'ar' && b.ar ? b.ar : b.de);
