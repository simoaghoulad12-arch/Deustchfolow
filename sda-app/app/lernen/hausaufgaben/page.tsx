import { HomeworkSubmit } from '@/components/learn/HomeworkSubmit';
import { NotLinked } from '@/components/learn/NotLinked';
import { loadMe } from '@/lib/data/learnerPage';
import { t } from '@/lib/i18n';
import { getPrefs } from '@/lib/prefs';

/** Eigene Hausaufgaben: Abgabe als Text, Status und Feedback der Lehrkraft. */
export default async function MyHomeworkPage() {
  const { lang } = getPrefs();
  const { bundle } = await loadMe();
  if (!bundle) return <NotLinked />;
  return (
    <>
      <h1 className="mb-4 text-2xl font-bold">{t(lang, 'myHomework')}</h1>
      {!bundle.homework.length && <p className="card text-muted">Keine Hausaufgaben.</p>}
      <ul className="space-y-3">
        {bundle.homework.map((h) => {
          const subs = bundle.submissions.filter((s) => s.homework_id === h.id);
          return (
            <li key={h.id} className="card">
              <h2 className="de-content font-bold">{h.task}</h2>
              <dl className="mt-1 grid grid-cols-[6rem_1fr] gap-x-3 text-sm">
                <dt className="text-muted">Ziel</dt>
                <dd className="de-content">{h.goal || '–'}</dd>
                <dt className="text-muted">Deadline</dt>
                <dd>{h.deadline ?? '–'}</dd>
                <dt className="text-muted">Status</dt>
                <dd className={h.status === 'Korrigiert' ? 'font-semibold text-ok' : ''}>
                  {h.status}
                </dd>
                <dt className="text-muted">Feedback</dt>
                <dd>{h.feedback || '–'}</dd>
              </dl>
              {subs.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm font-medium">
                    Meine Abgabe ({subs[0]!.created_at.slice(0, 10)})
                  </p>
                  <p className="de-content whitespace-pre-wrap rounded bg-bg p-2 text-sm">
                    {subs[0]!.text}
                  </p>
                </div>
              )}
              {h.status !== 'Korrigiert' && <HomeworkSubmit homeworkId={h.id} />}
            </li>
          );
        })}
      </ul>
    </>
  );
}
