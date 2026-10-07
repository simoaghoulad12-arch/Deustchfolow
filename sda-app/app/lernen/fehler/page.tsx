import { ErrorRepeat } from '@/components/learn/ErrorRepeat';
import { NotLinked } from '@/components/learn/NotLinked';
import { loadMe } from '@/lib/data/learnerPage';
import { t } from '@/lib/i18n';
import { getPrefs } from '@/lib/prefs';

/** Persönliche Fehlerliste (nur eigene) mit Wiederholungsübung. Den Status setzt die Lehrkraft. */
export default async function MyErrorsPage() {
  const { lang } = getPrefs();
  const { bundle } = await loadMe();
  if (!bundle) return <NotLinked />;
  const order = { offen: 0, wiederholen: 1, verbessert: 2 } as const;
  const list = [...bundle.errors].sort((a, b) => order[a.status] - order[b.status]);
  return (
    <>
      <h1 className="mb-1 text-2xl font-bold">{t(lang, 'myErrors')}</h1>
      <p className="mb-4 text-sm text-muted">
        Fehler, die deine Lehrkraft notiert hat. Übe die richtige Form, bis sie sitzt.
      </p>
      {!list.length && <p className="card text-muted">Keine Fehler notiert.</p>}
      <ul className="space-y-3">
        {list.map((e) => (
          <li key={e.id} className={`card ${e.status === 'verbessert' ? 'opacity-70' : ''}`}>
            <p className="text-sm text-muted">
              {e.date} · {e.category} ·{' '}
              <span
                className={e.status === 'verbessert' ? 'font-semibold text-ok' : 'font-semibold'}
              >
                {e.status}
              </span>
            </p>
            <p className="de-content mt-1">
              <span className="line-through decoration-red">{e.error}</span>
            </p>
            {e.status !== 'verbessert' && e.correction && <ErrorRepeat errorId={e.id} />}
            {e.status === 'verbessert' && (
              <p className="de-content text-sm">Richtig: {e.correction}</p>
            )}
          </li>
        ))}
      </ul>
    </>
  );
}
