import Link from 'next/link';
import { PageHeader } from '@/components/PageHeader';
import { t } from '@/lib/i18n';
import { getPrefs } from '@/lib/prefs';
import { searchContent } from '@/lib/search';

export default function SearchPage({ searchParams }: { searchParams: { q?: string } }) {
  const { lang } = getPrefs();
  const q = (searchParams.q ?? '').slice(0, 100);
  const hits = searchContent(q);
  return (
    <>
      <PageHeader page="search" lang={lang} />
      <form action="/suche" role="search" className="mb-5 flex gap-2">
        <label className="sr-only" htmlFor="seiten-suche">
          {t(lang, 'search')}
        </label>
        <input
          id="seiten-suche"
          name="q"
          type="search"
          defaultValue={q}
          className="input"
          placeholder={t(lang, 'searchPlaceholder')}
        />
        <button type="submit" className="btn-primary">
          {t(lang, 'search')}
        </button>
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
