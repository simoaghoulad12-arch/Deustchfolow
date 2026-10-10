import Link from 'next/link';
import { Label } from '@/components/Label';
import { PageHeader } from '@/components/PageHeader';
import { content, findLesson } from '@/content';
import type { Lesson } from '@/content/types';
import { requireMember } from '@/lib/auth';
import { loadSchool, nameOf } from '@/lib/data/queries';
import { getStore } from '@/lib/data/store';
import { getPrefs } from '@/lib/prefs';
import { lessonProgress } from '@/lib/progress';
import { lessonAt, openErrors, teachLessons, todayISO } from '@/lib/school';
import { statementsOf } from '@/lib/statements';
import { getDayRoles, getPerson } from '@/lib/team';

export const dynamic = 'force-dynamic';

/** Teacher Playbook „Heute“ (legacy: pagePlay) – pro Gruppe die Stunde laut Startdatum. */
export default async function PlaybookPage() {
  const member = await requireMember();
  const { lang } = getPrefs();
  const today = todayISO();
  const [data, roles, done] = await Promise.all([
    loadSchool(),
    getDayRoles(),
    getStore().doneItems(member.id),
  ]);
  const person = getPerson();
  const during = statementsOf('play').filter((s) => s.section === 'Während der Stunde');
  const dateLabel = new Intl.DateTimeFormat('de-DE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone: 'Europe/Berlin',
  }).format(new Date());

  /** Ohne Stunde heute: nächste Stunde mit offenen eigenen Aufgaben (legacy). */
  const nextOpen = (level: Lesson['level']): Lesson | undefined => {
    if (!level) return undefined;
    const list = teachLessons(level);
    return (
      list.find((l) => {
        const p = lessonProgress(l, person, roles, done);
        return p.total > 0 && p.done < p.total;
      }) ?? list[0]
    );
  };

  return (
    <>
      <PageHeader page="play" lang={lang} intro={dateLabel} />
      {!data.groups.length && (
        <p className="card mb-4">
          Noch keine Gruppen.{' '}
          <Link href="/fortschritt/gruppen" className="underline">
            Gruppe anlegen
          </Link>{' '}
          und Startdatum eintragen – dann zeigt diese Seite automatisch die Stunde von heute.
        </p>
      )}
      <div className="space-y-4">
        {data.groups.map((g) => {
          const at = g.start_date ? lessonAt(g.level, g.start_date, today) : null;
          const lesson = at?.state === 'ok' ? at.lesson : nextOpen(g.level);
          const students = data.students.filter((s) => s.group_id === g.id);
          const ids = new Set(students.map((s) => s.id));
          const lastDoc = data.docs.find((d) => d.group_id === g.id);
          const hw = data.homework.filter(
            (h) => ids.has(h.student_id) && h.status !== 'Korrigiert',
          );
          const errs = openErrors(data.errors.filter((e) => ids.has(e.student_id)));
          const goals = lesson?.moduleId ? (content.objectives[lesson.moduleId] ?? []) : [];
          const canDocument = lesson && (lesson.type === 'g' || lesson.type === 's');
          return (
            <section key={g.id} className="card" aria-labelledby={`gruppe-${g.id}`}>
              <h2 id={`gruppe-${g.id}`} className="mb-1 text-xl font-bold">
                {g.name} <span className="text-base font-normal text-muted">{g.level}</span>
              </h2>
              <p className="mb-3 text-sm text-muted">
                {!g.start_date && (
                  <>
                    Kein Startdatum –{' '}
                    <Link href={`/fortschritt/gruppen/${g.id}`} className="underline">
                      eintragen
                    </Link>
                    . Nächste offene Stunde:
                  </>
                )}
                {at?.state === 'ok' && `Heute: Woche ${at.week}, ${content.meta.days[at.day].de}`}
                {at?.state === 'before' && `Start am ${g.start_date}. Nächste offene Stunde:`}
                {at?.state === 'after' &&
                  'Alle Wochen des Levels sind vorbei. Nächste offene Stunde:'}
              </p>
              {lesson && (
                <div className="mb-3 rounded-lg bg-anth p-3 text-anth-ink">
                  <p className="text-sm opacity-70">
                    {lesson.moduleId} · {lesson.dauer}
                  </p>
                  <p className="de-content text-lg font-semibold">{lesson.title}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Link href={`/stunde/${lesson.id}`} className="btn-primary">
                      Stunde öffnen
                    </Link>
                    {canDocument && (
                      <Link
                        href={`/dokumentation/neu?gruppe=${g.id}&stunde=${lesson.id}`}
                        className="inline-flex min-h-11 items-center rounded-lg border border-white/30 px-4"
                      >
                        Stunde dokumentieren
                      </Link>
                    )}
                  </div>
                </div>
              )}
              <dl className="grid gap-x-3 gap-y-2 text-sm sm:grid-cols-[11rem_1fr]">
                <dt className="font-semibold">Welche Schüler?</dt>
                <dd>
                  {students.map((s) => s.name).join(', ') || (
                    <span className="text-muted">Noch keine Schüler in der Gruppe.</span>
                  )}
                </dd>
                <dt className="font-semibold">Zuletzt gemacht</dt>
                <dd className="de-content">
                  {lastDoc ? (
                    `${lastDoc.date} · ${findLesson(lastDoc.lesson_id)?.title ?? ''}${lastDoc.covered ? ` – ${lastDoc.covered}` : ''}`
                  ) : (
                    <span className="text-muted">Noch keine Dokumentation.</span>
                  )}
                </dd>
                <dt className="font-semibold">Offene Hausaufgaben</dt>
                <dd>
                  {hw.length ? (
                    <ul>
                      {hw.slice(0, 5).map((h) => (
                        <li key={h.id}>
                          {nameOf(data.students, h.student_id)}: {h.task} ({h.status})
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-muted">keine</span>
                  )}
                </dd>
                <dt className="font-semibold">Probleme / offene Fehler</dt>
                <dd>
                  {lastDoc?.problems && <p>{lastDoc.problems}</p>}
                  {errs.length ? (
                    <ul className="de-content">
                      {errs.slice(0, 5).map((e) => (
                        <li key={e.id}>
                          {nameOf(data.students, e.student_id)}: {e.error} → {e.correction}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-muted">keine offenen Fehler</span>
                  )}
                </dd>
                <dt className="font-semibold">Lernziel heute</dt>
                <dd>
                  {goals.length ? (
                    <ul className="de-content list-disc ps-5">
                      {goals.map((x) => (
                        <li key={x}>{x}</li>
                      ))}
                    </ul>
                  ) : (
                    '–'
                  )}
                </dd>
              </dl>
            </section>
          );
        })}
      </div>
      <section className="card mt-4">
        <h2 className="mb-2 text-lg font-bold">Während der Stunde</h2>
        <ul className="space-y-2">
          {during.map((s) => (
            <li key={s.text} className="flex flex-wrap items-baseline gap-2">
              <Label kind={s.label} lang={lang} />
              <span className="min-w-0 flex-1">{s.text}</span>
            </li>
          ))}
        </ul>
      </section>
      <section className="card mt-4">
        <h2 className="mb-2 flex flex-wrap items-center gap-2 text-lg font-bold">
          Nach der Stunde <Label kind="IMPROVEMENT" lang={lang} />
        </h2>
        <p className="mb-3">
          Dokumentiert werden: Thema, behandelte Inhalte, Lernfortschritt, wichtige Fehler,
          Hausaufgabe, nächstes Lernziel, besondere Probleme.
        </p>
        <Link href="/dokumentation/neu" className="btn-primary">
          Stunde dokumentieren
        </Link>
      </section>
    </>
  );
}
