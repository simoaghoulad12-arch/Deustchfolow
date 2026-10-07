import { setLanguage, setTheme } from '@/app/actions/prefs';
import { requireStudent } from '@/lib/auth';
import { t, THEMES, type UIKey } from '@/lib/i18n';
import { getPrefs } from '@/lib/prefs';

const THEME_LABEL: Record<(typeof THEMES)[number], UIKey> = {
  system: 'themeSystem',
  light: 'themeLight',
  dark: 'themeDark',
};

export default async function LearnSettingsPage() {
  await requireStudent();
  const { lang, theme } = getPrefs();
  return (
    <>
      <h1 className="mb-4 text-2xl font-bold">{t(lang, 'settings')}</h1>
      <section className="card mb-4">
        <h2 className="mb-1 text-xl font-bold">{t(lang, 'language')}</h2>
        <p className="mb-3 text-sm text-muted">{t(lang, 'contentNote')}</p>
        <form action={setLanguage} className="flex flex-wrap gap-2">
          {(['de', 'ar'] as const).map((l) => (
            <button
              key={l}
              type="submit"
              name="lang"
              value={l}
              aria-pressed={lang === l}
              className="btn-secondary aria-pressed:border-red aria-pressed:font-semibold"
            >
              {t(lang, l === 'de' ? 'german' : 'arabic')}
            </button>
          ))}
        </form>
      </section>
      <section className="card">
        <h2 className="mb-3 text-xl font-bold">{t(lang, 'theme')}</h2>
        <form action={setTheme} className="flex flex-wrap gap-2">
          {THEMES.map((th) => (
            <button
              key={th}
              type="submit"
              name="theme"
              value={th}
              aria-pressed={theme === th}
              className="btn-secondary aria-pressed:border-red aria-pressed:font-semibold"
            >
              {t(lang, THEME_LABEL[th])}
            </button>
          ))}
        </form>
      </section>
    </>
  );
}
