import Link from 'next/link';
import { DocForm } from '@/components/school/DocForm';
import { findLesson } from '@/content';
import { requireMember } from '@/lib/auth';
import { getStore } from '@/lib/data/store';
import { getRepo } from '@/lib/data/repo';
import { docPrefill, lessonAt, teachLessons, todayISO } from '@/lib/school';

export const dynamic = 'force-dynamic';

/**
 * Schritt 1: Gruppe wählen (falls nicht übergeben). Schritt 2: Stunde wählen/ändern (GET, füllt vor).
 * Schritt 3: Formular – aus dem Skript vorausgefüllt.
 */
export default async function NewDocPage({
  searchParams,
}: {
  searchParams: { stunde?: string; gruppe?: string };
}) {
  await requireMember();
  const repo = getRepo();
  const today = todayISO();
  const groups = await repo.list('groups', { order: { column: 'name' } });
  const lessonParam = searchParams.stunde ? findLesson(searchParams.stunde) : undefined;
  const group = groups.find((g) => g.id === searchParams.gruppe);

  if (!group) {
    const fitting = lessonParam?.level
      ? groups.filter((g) => g.level === lessonParam.level)
      : groups;
    return (
      <>
        <h1 className="mb-2 text-2xl font-bold">Stunde dokumentieren</h1>
        <p className="mb-4 text-muted">Welche Gruppe?</p>
        {!fitting.length && (
          <p className="card">
            Keine passende Gruppe.{' '}
            <Link href="/fortschritt/gruppen" className="underline">
              Gruppen
            </Link>
          </p>
        )}
        <ul className="space-y-2">
          {fitting.map((g) => (
            <li key={g.id}>
              <Link
                href={`/dokumentation/neu?gruppe=${g.id}${lessonParam ? `&stunde=${lessonParam.id}` : ''}`}
                className="card flex min-h-11 items-center justify-between hover:border-red"
              >
                <b>{g.name}</b> <span className="text-sm text-muted">{g.level}</span>
              </Link>
            </li>
          ))}
        </ul>
      </>
    );
  }

  const options = teachLessons(group.level);
  const todays = group.start_date ? lessonAt(group.level, group.start_date, today) : null;
  const fallback =
    todays?.state === 'ok' && options.some((l) => l.id === todays.lesson.id)
      ? todays.lesson.id
      : options[0]?.id;
  const lessonId = lessonParam?.level === group.level ? lessonParam.id : fallback;
  if (!lessonId) return <p className="card">Keine Stunden für dieses Level.</p>;
  const [students, note] = await Promise.all([
    repo.list('students', { eq: { group_id: group.id }, order: { column: 'name' } }),
    getStore().materialNote(lessonId),
  ]);

  return (
    <>
      <h1 className="mb-4 text-2xl font-bold">Stunde dokumentieren</h1>
      <form action="/dokumentation/neu" className="card mb-4 flex flex-wrap items-end gap-2">
        <input type="hidden" name="gruppe" value={group.id} />
        <label className="block min-w-0 flex-1">
          <span className="mb-1 block font-medium">Modul / Stunde</span>
          <select name="stunde" defaultValue={lessonId} className="input">
            {options.map((l) => (
              <option key={l.id} value={l.id}>
                {l.moduleId} · {l.day} · {l.title}
              </option>
            ))}
          </select>
        </label>
        <button type="submit" className="btn-secondary">
          Stunde wählen
        </button>
      </form>
      <section className="card">
        <DocForm
          group={group}
          lessonId={lessonId}
          students={students}
          prefill={docPrefill(lessonId, note)}
          today={today}
        />
      </section>
    </>
  );
}
