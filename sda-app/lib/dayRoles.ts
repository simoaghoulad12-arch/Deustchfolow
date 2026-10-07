import type { Bilingual, ChecklistItem, Day, Lesson } from '@/content/types';

/**
 * Rollen pro Wochentag (PROPOSAL aus legacy/index.html, dayRole):
 * Lehrkraft 1 Haupt Mo und Mi, Lehrkraft 2 Di und Do, Sprechstunden Fr und Sa.
 * Die Leitung kann den Plan in den Einstellungen ändern (app_settings.day_roles).
 */

/** Wer bin ich im Team-Plan? Wird pro Gerät gewählt, wie in legacy. ALL = alle Aufgaben sehen. */
export const PERSONS = ['L1', 'L2', 'N', 'ALL'] as const;
export type Person = (typeof PERSONS)[number];
export const isPerson = (v: unknown): v is Person => PERSONS.includes(v as Person);

/** H = Hauptlehrkraft, A = Assistenz, Z = Zuhören und Fehler notieren */
export const TEACHER_DUTIES = ['H', 'A', 'Z'] as const;
export type TeacherDuty = (typeof TEACHER_DUTIES)[number];
export const isTeacherDuty = (v: unknown): v is TeacherDuty =>
  TEACHER_DUTIES.includes(v as TeacherDuty);

export type DayRoles = Record<Day, { L1: TeacherDuty; L2: TeacherDuty }>;

export const DAYS: Day[] = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

export const DEFAULT_DAY_ROLES: DayRoles = {
  Mo: { L1: 'H', L2: 'A' },
  Di: { L1: 'A', L2: 'H' },
  Mi: { L1: 'H', L2: 'A' },
  Do: { L1: 'A', L2: 'H' },
  Fr: { L1: 'A', L2: 'Z' },
  Sa: { L1: 'Z', L2: 'A' },
  So: { L1: 'H', L2: 'A' },
};

export const PERSON_LABELS: Record<Person, Bilingual> = {
  L1: { de: 'Lehrkraft 1', ar: 'الأستاذ الأول' },
  L2: { de: 'Lehrkraft 2', ar: 'الأستاذ الثاني' },
  N: { de: 'Muttersprachler/in', ar: 'الناطق الأصلي' },
  ALL: { de: 'Alle Aufgaben', ar: 'كل المهام' },
};

export const DUTY_LABELS: Record<TeacherDuty | 'N', Bilingual> = {
  H: { de: 'Hauptlehrkraft', ar: 'الأستاذ الرئيسي' },
  A: { de: 'Assistenz', ar: 'المساعد' },
  Z: { de: 'Zuhören, Fehler notieren', ar: 'الاستماع وتسجيل الأخطاء' },
  N: { de: 'Muttersprachler/in', ar: 'الناطق الأصلي' },
};

/** Gespeicherten Plan prüfen; Fehlendes oder Ungültiges mit dem Vorschlag auffüllen. */
export function normalizeDayRoles(value: unknown): DayRoles {
  const out = structuredClone(DEFAULT_DAY_ROLES);
  if (value && typeof value === 'object') {
    for (const d of DAYS) {
      const v = (value as Record<string, unknown>)[d] as Record<string, unknown> | undefined;
      if (isTeacherDuty(v?.L1)) out[d].L1 = v.L1;
      if (isTeacherDuty(v?.L2)) out[d].L2 = v.L2;
    }
  }
  return out;
}

/** Aufgabe der Person an diesem Tag; null = alle Aufgaben zeigen (legacy: dayRole). */
export function dayRole(
  person: Person,
  day: Day | undefined,
  roles: DayRoles,
): TeacherDuty | 'N' | null {
  if (person === 'N') return 'N';
  if (person === 'ALL') return null;
  return roles[day ?? 'So'][person];
}

/** Sieht die Person diese Aufgabe? (legacy: visibleFor) */
export function visibleFor(role: TeacherDuty | 'N' | null, item: ChecklistItem): boolean {
  if (role === null || item.role === 'ALL') return true;
  if (role === 'N') return item.role === 'N';
  if (role === 'Z') return item.role === 'T';
  return item.role === role || item.role === 'T';
}

/** Hauptlehrkraft an einem Grammatik-Tag laut Plan. */
export function leadOf(day: Day, roles: DayRoles): 'L1' | 'L2' | null {
  if (roles[day].L1 === 'H') return 'L1';
  if (roles[day].L2 === 'H') return 'L2';
  return null;
}

export interface Step {
  item: ChecklistItem;
  group: Bilingual;
}

/** Aufgaben einer Stunde, die die Person sieht, in Reihenfolge (legacy: steps). */
export function stepsFor(
  lesson: Lesson,
  role: TeacherDuty | 'N' | null,
  phases: Record<string, Bilingual>,
): Step[] {
  return lesson.groups.flatMap((g) => {
    const group = g.phase
      ? (phases[g.phase] ?? { de: g.phase, ar: '' })
      : (g.name ?? { de: '', ar: '' });
    return g.items.filter((x) => visibleFor(role, x)).map((item) => ({ item, group }));
  });
}
