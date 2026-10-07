import { content, findLesson } from '@/content';
import type { Day, Lesson, LevelKey } from '@/content/types';
import type { ErrorRow, HomeworkRow, LessonDocRow } from './data/types';

/**
 * Zeitzone für „heute“. Die Stunden laufen für Teilnehmer in Marokko und ein Team in Deutschland;
 * welche Uhrzeiten gelten, ist eine OFFENE ENTSCHEIDUNG. Für das Datum reicht Europe/Berlin
 * (unterscheidet sich von Marokko höchstens um eine Stunde, nur kurz vor Mitternacht relevant).
 */
export const APP_TIME_ZONE = 'Europe/Berlin';

export function todayISO(now: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: APP_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
}

const DAYS: Day[] = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

/** Tage zwischen zwei Daten 'YYYY-MM-DD' (b − a). */
export function daysBetween(a: string, b: string): number {
  return Math.round((Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / 86_400_000);
}

/** Montag der Woche eines Datums (legacy: mondayOf). */
export function mondayOf(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7));
  return d.toISOString().slice(0, 10);
}

export type LessonAt =
  | { state: 'before' }
  | { state: 'after' }
  | { state: 'ok'; week: number; day: Day; lesson: Lesson };

/** Welche Stunde ist an einem Datum dran, wenn das Level am Startdatum begonnen hat? (legacy: lessonAt) */
export function lessonAt(level: LevelKey, startDate: string, date: string): LessonAt {
  const days = daysBetween(mondayOf(startDate), date);
  if (days < 0) return { state: 'before' };
  const weeks = content.curriculum.levels.find((l) => l.key === level)?.modules.length ?? 0;
  const wi = Math.floor(days / 7);
  if (wi >= weeks) return { state: 'after' };
  const day = DAYS[days % 7]!;
  const lesson = findLesson(`${level}.${wi + 1}.${day}`);
  return lesson ? { state: 'ok', week: wi + 1, day, lesson } : { state: 'after' };
}

/** Unterrichtsstunden eines Levels in Reihenfolge, Mo–Sa ohne Mini-Test (legacy: teachLessons). */
export function teachLessons(level: LevelKey): Lesson[] {
  return content.lessonsByLevel[level].filter((l) => l.type === 'g' || l.type === 's');
}

export function nextLessonAfter(lessonId: string): Lesson | undefined {
  const l = findLesson(lessonId);
  if (!l?.level) return undefined;
  const list = teachLessons(l.level);
  const i = list.findIndex((x) => x.id === lessonId);
  return i >= 0 ? list[i + 1] : undefined;
}

export interface DocPrefill {
  covered: string;
  canDo: string;
  homework: string;
  nextLesson: string;
  material: string;
}

/** Vorausgefüllte Felder für „Stunde dokumentieren“ aus dem Skript (legacy: docPrefill). */
export function docPrefill(lessonId: string, materialNote = ''): DocPrefill {
  const out: DocPrefill = {
    covered: '',
    canDo: '',
    homework: '',
    nextLesson: '',
    material: materialNote,
  };
  const l = findLesson(lessonId);
  if (!l?.level || !l.moduleId) return out;
  const mod = content.curriculum.levels.flatMap((x) => x.modules).find((m) => m.id === l.moduleId);
  if (l.type === 'g') {
    const topic = mod?.grammar.find((g) => g.lessonId === lessonId);
    if (topic) out.covered = `${topic.title}: ${topic.kern.join('; ')}`;
    out.homework = content.scripts.find((s) => s.lessonId === lessonId)?.hausaufgabe ?? '';
  } else if (l.type === 's' && mod) {
    out.covered = `Sprechen: ${mod.speaking.thema} – ${mod.speaking.situation}`;
    out.homework = `Sprachnachricht (30 Sek.) zum Thema ${mod.speaking.thema}`;
  } else {
    out.covered = l.title;
  }
  out.canDo = (content.objectives[l.moduleId] ?? []).join('; ');
  out.nextLesson = nextLessonAfter(lessonId)?.title ?? '';
  return out;
}

export interface Attendance {
  present: number;
  absent: number;
  /** Prozent, null ohne Dokumentation */
  rate: number | null;
}

/** Anwesenheit eines Schülers laut Dokumentation (legacy: attendance). */
export function attendance(studentId: string, docs: LessonDocRow[]): Attendance {
  let present = 0;
  let absent = 0;
  for (const d of docs) {
    if (d.present.includes(studentId)) present++;
    else if (d.absent.includes(studentId)) absent++;
  }
  const total = present + absent;
  return { present, absent, rate: total ? Math.round((100 * present) / total) : null };
}

export interface HomeworkStats {
  total: number;
  Offen: number;
  Abgegeben: number;
  Korrigiert: number;
}

export function homeworkStats(list: HomeworkRow[]): HomeworkStats {
  const s: HomeworkStats = { total: list.length, Offen: 0, Abgegeben: 0, Korrigiert: 0 };
  for (const h of list) s[h.status]++;
  return s;
}

export const openErrors = (list: ErrorRow[]) => list.filter((e) => e.status !== 'verbessert');

/** Letzte Dokumentation, in der der Schüler anwesend oder abwesend war. */
export function lastDocFor(studentId: string, docs: LessonDocRow[]): LessonDocRow | undefined {
  return docs
    .filter((d) => d.present.includes(studentId) || d.absent.includes(studentId))
    .sort((a, b) => b.date.localeCompare(a.date) || b.created_at.localeCompare(a.created_at))[0];
}
