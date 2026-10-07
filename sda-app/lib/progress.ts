import { content } from '@/content';
import type { Lesson } from '@/content/types';
import { dayRole, stepsFor, type DayRoles, type Person } from './dayRoles';
import { minuteRange } from './minutes';

export { minuteRange };

export type LessonStatus = 'Offen' | 'In Arbeit' | 'Abgeschlossen';
export const LESSON_STATUSES: LessonStatus[] = ['Offen', 'In Arbeit', 'Abgeschlossen'];

export interface Progress {
  done: number;
  total: number;
}

/** Erledigte Aufgaben einer Stunde für die Person (legacy: prog). */
export function lessonProgress(
  lesson: Lesson,
  person: Person,
  roles: DayRoles,
  done: Set<string>,
): Progress {
  const steps = stepsFor(lesson, dayRole(person, lesson.day, roles), content.meta.phases);
  return { done: steps.filter((s) => done.has(s.item.id)).length, total: steps.length };
}

export const sumProgress = (list: Progress[]): Progress =>
  list.reduce((a, p) => ({ done: a.done + p.done, total: a.total + p.total }), {
    done: 0,
    total: 0,
  });

export const percent = (p: Progress) => (p.total ? Math.round((100 * p.done) / p.total) : 0);

/** legacy: statusOf. Ohne eigene Aufgaben: null. */
export function statusOf(p: Progress): LessonStatus | null {
  if (!p.total) return null;
  if (p.done === 0) return 'Offen';
  if (p.done < p.total) return 'In Arbeit';
  return 'Abgeschlossen';
}

/** Länge der Stunde in Minuten laut Checkliste (legacy: spanOf). */
export function lessonSpan(lesson: Lesson): number {
  let max = 0;
  for (const g of lesson.groups)
    for (const x of g.items) max = Math.max(max, minuteRange(x.zeit)?.[1] ?? 0);
  return max;
}
