import Link from 'next/link';
import { saveDayRoles, setPerson } from '@/app/actions/lesson';
import { setLanguage, setTheme } from '@/app/actions/prefs';
import { ImportForm } from '@/components/ImportForm';
import { Label, LabelLegend } from '@/components/Label';
import { content } from '@/content';
import { DAYS, DUTY_LABELS, PERSON_LABELS, PERSONS, TEACHER_DUTIES } from '@/lib/dayRoles';
import { PageHeader } from '@/components/PageHeader';
import { requireMember } from '@/lib/auth';
import { pick, t, THEMES, type UIKey } from '@/lib/i18n';
import { getPrefs } from '@/lib/prefs';
import { getDayRoles, getPerson } from '@/lib/team';

const THEME_LABEL: Record<(typeof THEMES)[number], UIKey> = {
  system: 'themeSystem',
  light: 'themeLight',
  dark: 'themeDark',
};

export default async function SettingsPage() {
  const member = await requireMember();
  const { lang, theme } = getPrefs();
  const person = getPerson();
  const roles = await getDayRoles();
  const isAdmin = member.role === 'admin';
  return (
    <>
      <PageHeader page="set" lang={lang} />
      <section className="card mb-4">
        <h2 className="mb-1 text-xl font-bold">{t(lang, 'whoAmI')}</h2>
        <p className="mb-3 text-sm text-muted">{t(lang, 'whoAmIHint')}</p>
        <form action={setPerson} className="flex flex-wrap gap-2">
          {PERSONS.map((p) => (
            <button
              key={p}
              type="submit"
              name="person"
              value={p}
              aria-pressed={person === p}
              className="btn-secondary aria-pressed:border-red aria-pressed:font-semibold"
            >
              {pick(lang, PERSON_LABELS[p])}
            </button>
          ))}
        </form>
      </section>
      <section className="card mb-4">
        <h2 className="mb-1 flex flex-wrap items-center gap-2 text-xl font-bold">
          {t(lang, 'dayPlan')} <Label kind="PROPOSAL" lang={lang} />
        </h2>
        <p className="mb-3 text-sm text-muted">{t(lang, 'dayPlanHint')}</p>
        <form action={saveDayRoles}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-start">
                  <th className="py-1 text-start" />
                  <th className="py-1 text-start">{pick(lang, PERSON_LABELS.L1)}</th>
                  <th className="py-1 text-start">{pick(lang, PERSON_LABELS.L2)}</th>
                </tr>
              </thead>
              <tbody>
                {DAYS.map((d) => (
                  <tr key={d} className="border-t border-line">
                    <th scope="row" className="py-1 pe-2 text-start font-medium">
                      {pick(lang, content.meta.days[d])}
                    </th>
                    {(['L1', 'L2'] as const).map((p) => (
                      <td key={p} className="py-1 pe-2">
                        {isAdmin ? (
                          <select
                            name={`${d}.${p}`}
                            defaultValue={roles[d][p]}
                            aria-label={`${pick(lang, content.meta.days[d])}, ${pick(lang, PERSON_LABELS[p])}`}
                            className="input"
                          >
                            {TEACHER_DUTIES.map((duty) => (
                              <option key={duty} value={duty}>
                                {pick(lang, DUTY_LABELS[duty])}
                              </option>
                            ))}
                          </select>
                        ) : (
                          pick(lang, DUTY_LABELS[roles[d][p]])
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-sm text-muted">{pick(lang, PERSON_LABELS.N)}: Fr, Sa</p>
          {isAdmin && (
            <button type="submit" className="btn-primary mt-3">
              {t(lang, 'save')}
            </button>
          )}
        </form>
      </section>
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
      <section className="card mb-4">
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
      {isAdmin && (
        <section className="card mb-4">
          <h2 className="mb-2 text-xl font-bold">{t(lang, 'team')}</h2>
          <Link href="/admin/team" className="btn-primary">
            {t(lang, 'team')}
          </Link>
        </section>
      )}
      {isAdmin && (
        <section className="card mb-4">
          <h2 className="mb-1 text-xl font-bold">Daten aus der alten Version übernehmen</h2>
          <p className="mb-3 text-sm text-muted">
            Schüler, Dokumentation, Fehler, Hausaufgaben und Lehrbuch-Notizen. Die alte Version
            kannte keine Gruppen: pro Level entsteht eine Gruppe „Übernommen …“, die danach
            umbenannt oder aufgeteilt werden kann. Erst prüfen, dann importieren.
          </p>
          <ImportForm />
        </section>
      )}
      <section className="card">
        <h2 className="mb-3 text-xl font-bold">{t(lang, 'labelsTitle')}</h2>
        <LabelLegend lang={lang} />
      </section>
    </>
  );
}
