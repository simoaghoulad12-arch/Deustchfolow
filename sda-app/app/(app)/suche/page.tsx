import Link from 'next/link';
import { Field } from '@/components/forms/Field';
import { PageHeader } from '@/components/PageHeader';
import { AREAS, LEVEL_KEYS, type Area, type LevelKey } from '@/content/types';
import { requireMember } from '@/lib/auth';
import { loadSchool } from '@/lib/data/queries';
import { t } from '@/lib/i18n';
import { getPrefs } from '@/lib/prefs';
import { search } from '@/lib/search';

export const dynamic = 'force-dynamic';

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string; level?: string; bereich?: string };
}) {
  await requireMember();
  const { lang } = getPrefs();
  const q = (searchParams.q ?? '').slice(0, 100);
  const level = LEVEL_KEYS.includes(searchParams.level as LevelKey)
    ? (searchParams.level as LevelKey)
    : null;
  const area = AREAS.includes(searchParams.bereich as Area) ? (searchParams.bereich as Area) : null;
  const hits = q ? search(q, { level, area }, await loadSchool()) : [];
  return (
    <>
      <PageHeader page="search" lang={lang} />
      <form
        action="/suche"
        role="search"
        className="card mb-5 grid gap-3 sm:grid-cols-[1fr_8rem_10rem_auto]"
      >
        <Field label={t(lang, 'search')}>
          <input
            name="q"
            type="search"
            defaultValue={q}
            className="input"
            placeholder={t(lang, 'searchPlaceholder')}
            id="seiten-suche"
          />
        </Field>
        <Field label={t(lang, 'level')}>
          <select name="level" defaultValue={level ?? ''} className="input">
            <option value="">{t(lang, 'all')}</option>
            {LEVEL_KEYS.map((k) => (
              <option key={k}>{k}</option>
            ))}
          </select>
        </Field>
        <Field label={t(lang, 'area')}>
          <select name="bereich" defaultValue={area ?? ''} className="input">
            <option value="">{t(lang, 'all')}</option>
            {AREAS.map((a) => (
              <option key={a}>{a}</option>
            ))}
          </select>
        </Field>
        <div className="flex items-end">
          <button type="submit" className="btn-primary w-full">
            {t(lang, 'search')}
          </button>
        </div>
      </form>
      {q && (
        <p className="mb-3 text-sm text-muted" role="status">
          {hits.length ? `${hits.length} ${t(lang, 'results')}` : t(lang, 'noResults')}
        </p>
      )}
      <ul className="de-content space-y-2">
        {hits.map((h, i) => (
          <li key={`${h.href}-${i}`}>
            <Link href={h.href} className="card block hover:border-red">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted">
                {h.kind}
              </span>
              <span className="block font-medium">{h.title}</span>
              <span className="block text-sm text-muted">{h.detail}</span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
