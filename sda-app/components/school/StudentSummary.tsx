import Link from 'next/link';
import { findLesson } from '@/content';
import type { SchoolData } from '@/lib/data/queries';
import { SKILLS, type StudentRow } from '@/lib/data/types';
import { attendance, homeworkStats, lastDocFor, openErrors } from '@/lib/school';
import { content } from '@/content';

/** Fortschritt eines Schülers (legacy: pageProg): Anwesenheit, Hausaufgaben, Fehler, Fertigkeiten, letzte/nächste Stunde. */
export function StudentSummary({
  s,
  data,
  compact,
}: {
  s: StudentRow;
  data: SchoolData;
  compact?: boolean;
}) {
  const at = attendance(s.id, data.docs);
  const hw = homeworkStats(data.homework.filter((h) => h.student_id === s.id));
  const errs = openErrors(data.errors.filter((e) => e.student_id === s.id)).length;
  const last = lastDocFor(s.id, data.docs);
  const mod = content.curriculum.levels
    .flatMap((l) => l.modules)
    .find((m) => m.id === s.current_module);
  const group = data.groups.find((g) => g.id === s.group_id);
  return (
    <div>
      <dl className="grid grid-cols-[9rem_1fr] gap-x-3 gap-y-1 text-sm">
        <dt className="text-muted">Gruppe</dt>
        <dd>{group ? `${group.name} (${group.level})` : '–'}</dd>
        <dt className="text-muted">Modul</dt>
        <dd className="de-content">{mod ? `${mod.id}: ${mod.title}` : '–'}</dd>
        <dt className="text-muted">Anwesenheit</dt>
        <dd>
          {at.rate === null ? '–' : `${at.rate} % (${at.present} von ${at.present + at.absent})`}
        </dd>
        <dt className="text-muted">Hausaufgaben</dt>
        <dd>
          {hw.total} gesamt · {hw.Offen} offen · {hw.Abgegeben} abgegeben · {hw.Korrigiert}{' '}
          korrigiert
        </dd>
        <dt className="text-muted">Offene Fehler</dt>
        <dd>{errs}</dd>
        <dt className="text-muted">Letzte Stunde</dt>
        <dd className="de-content">
          {last ? (
            <Link href={`/stunde/${last.lesson_id}`} className="underline">
              {last.date} · {findLesson(last.lesson_id)?.title}
            </Link>
          ) : (
            '–'
          )}
        </dd>
        <dt className="text-muted">Nächste Stunde</dt>
        <dd className="de-content">{last?.next_lesson || '–'}</dd>
        {!compact && (
          <>
            <dt className="text-muted">Stärken</dt>
            <dd>{s.strengths || '–'}</dd>
            <dt className="text-muted">Schwächen</dt>
            <dd>{s.weaknesses || '–'}</dd>
            <dt className="text-muted">Nächste Lernziele</dt>
            <dd>{s.next_goals || '–'}</dd>
          </>
        )}
      </dl>
      <ul
        className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3"
        aria-label="Fertigkeiten"
      >
        {SKILLS.map((k) => {
          const v = s[k.key] ?? 0;
          return (
            <li key={k.key} className="text-sm">
              <span className="flex justify-between">
                <span>{k.label}</span>
                <span className="text-muted">{v ? `${v}/5` : '–'}</span>
              </span>
              <span
                className="mt-1 block h-2 overflow-hidden rounded-full bg-line"
                role="meter"
                aria-label={k.label}
                aria-valuemin={0}
                aria-valuemax={5}
                aria-valuenow={v}
              >
                <span
                  className="block h-full rounded-full bg-red"
                  style={{ width: `${(v / 5) * 100}%` }}
                />
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
