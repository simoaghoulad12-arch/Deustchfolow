import { findLesson, content } from '@/content';
import { t } from '@/lib/i18n';
import { getPrefs } from '@/lib/prefs';
import { requireStudent } from '@/lib/auth';

/** Deutschland-Bereich: Alltag, Behörden, Arzt, Wohnen, Bewerbung – Themen aus content/germany mit Lernzielen. */
export default async function LearnGermanyPage() {
  await requireStudent();
  const { lang } = getPrefs();
  return (
    <>
      <h1 className="mb-1 text-2xl font-bold">{t(lang, 'germany')}</h1>
      <p className="mb-4 text-sm text-muted">
        Themen aus dem Kurs mit direktem Bezug zum Leben in Deutschland.
      </p>
      <div className="space-y-3">
        {content.germany.map((g) => {
          const lessons = g.lessonIds.map((id) => findLesson(id)).filter((l) => !!l);
          const modules = [...new Set(lessons.map((l) => l!.moduleId!))];
          return (
            <details key={g.thema} className="card">
              <summary className="flex min-h-11 cursor-pointer items-center font-bold">
                {g.thema}
              </summary>
              <div className="de-content mt-2 space-y-2">
                <ul className="list-disc ps-5">
                  {lessons.map((l) => (
                    <li key={l!.id}>
                      {l!.level} · {l!.title}
                    </li>
                  ))}
                </ul>
                <p className="text-sm font-medium">Das lernst du dabei:</p>
                <ul className="list-disc ps-5 text-sm">
                  {modules.flatMap((m) =>
                    (content.objectives[m] ?? []).map((o) => <li key={`${m}-${o}`}>{o}</li>),
                  )}
                </ul>
              </div>
            </details>
          );
        })}
      </div>
    </>
  );
}
