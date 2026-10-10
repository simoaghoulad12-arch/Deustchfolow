import { content } from '@/content';
import { LEVEL_KEYS, type Exercise, type LevelKey, type Module } from '@/content/types';

/**
 * Lern-App: Übungen, Mini-Tests und Fortschritt.
 * Inhalte nur aus content/ (A1/A2: vollständige Skripte mit Übungen; B1/B2: noch keine Übungen,
 * siehe docs/CONTENT-STATUS.md). Es werden keine Übungen erfunden.
 */

export interface LearnExercise extends Exercise {
  /** z. B. 'A1.1.Di#2' (Stunde + Nummer der Übung) */
  id: string;
  lessonId: string;
  lessonTitle: string;
}

export function moduleById(id: string): Module | undefined {
  return content.curriculum.levels.flatMap((l) => l.modules).find((m) => m.id === id);
}

/** Alle Übungen eines Moduls (aus den Vorlese-Skripten der Grammatikstunden). */
export function moduleExercises(moduleId: string): LearnExercise[] {
  const m = moduleById(moduleId);
  if (!m) return [];
  return m.grammar.flatMap((g) => {
    const sc = content.scripts.find((s) => s.lessonId === g.lessonId);
    return (sc?.exercises ?? []).map((e, i) => ({
      ...e,
      id: `${g.lessonId}#${i}`,
      lessonId: g.lessonId,
      lessonTitle: g.title,
    }));
  });
}

/** Wochen-Mini-Test: je Grammatikstunde die ersten zwei Übungen (legacy: testScript). */
export function miniTest(moduleId: string): LearnExercise[] {
  const all = moduleExercises(moduleId);
  const byLesson = new Map<string, LearnExercise[]>();
  for (const e of all) byLesson.set(e.lessonId, [...(byLesson.get(e.lessonId) ?? []), e]);
  return [...byLesson.values()].flatMap((list) => list.slice(0, 2));
}

/** Antwort vergleichen: Groß/klein, Leerzeichen, Anführungszeichen und Satzzeichen am Ende egal. */
export function normalizeAnswer(s: string): string {
  return s
    .normalize('NFC')
    .toLocaleLowerCase('de')
    .replace(/[„“”«»"']/g, '')
    .replace(/[‐‑–—]/g, '-')
    .replace(/\s+/g, ' ')
    .replace(/\s*-\s*/g, '-')
    .trim()
    .replace(/[.!?;,:]+$/, '')
    .trim();
}

export function isCorrect(answer: string, solution: string): boolean {
  const a = normalizeAnswer(answer);
  return a.length > 0 && a === normalizeAnswer(solution);
}

// ------------------------------------------------------------------ Fortschritt

/**
 * Fortschritts-Formel (PROPOSAL aus CLAUDE.md):
 *   Modul-% = gewichteter Durchschnitt aus
 *     Anwesenheit  = anwesend / dokumentierte Stunden des Moduls (zählt nur, wenn es Dokumentation gibt)
 *     Übungen      = richtig gelöste Übungen / Übungen des Moduls (zählt nur, wenn das Modul Übungen hat)
 *     Mini-Test    = bestes Ergebnis in % (zählt, wenn das Modul einen Test hat; nicht geschrieben = 0)
 *   Level-% = Durchschnitt der Module; bestandene Prüfung (Phase 9) setzt das Level auf 100 %.
 *   Gesamt (A1 → B2 = 100 %) = Durchschnitt der vier Level.
 * Gewichtung und Bestehensgrenze sind eine OFFENE ENTSCHEIDUNG und werden von der Leitung eingestellt.
 * Bis dahin: gleiche Gewichte (PROPOSAL), keine Bestehensgrenze.
 */
export interface ProgressFormula {
  wAttendance: number;
  wExercises: number;
  wTest: number;
  /** Modul gilt ab diesem Prozentwert als bestanden; null = nicht festgelegt */
  passPercent: number | null;
}

export const DEFAULT_FORMULA: ProgressFormula = {
  wAttendance: 1,
  wExercises: 1,
  wTest: 1,
  passPercent: null,
};

export function normalizeFormula(v: unknown): ProgressFormula {
  const o = (v ?? {}) as Record<string, unknown>;
  const w = (x: unknown, d: number) =>
    typeof x === 'number' && Number.isFinite(x) && x >= 0 && x <= 100 ? x : d;
  const pass =
    typeof o.passPercent === 'number' && o.passPercent >= 0 && o.passPercent <= 100
      ? o.passPercent
      : null;
  return {
    wAttendance: w(o.wAttendance, 1),
    wExercises: w(o.wExercises, 1),
    wTest: w(o.wTest, 1),
    passPercent: pass,
  };
}

export interface LearnerData {
  /** eigene Anwesenheit (Stunden-ID, anwesend?) */
  attendance: { lessonId: string; present: boolean }[];
  /** IDs der richtig gelösten Übungen */
  solved: Set<string>;
  /** bestes Test-Ergebnis pro Modul in % */
  bestTest: Map<string, number>;
  /** Level mit bestandener Prüfung (Phase 9) */
  passedLevels: Set<LevelKey>;
}

export interface ModuleProgress {
  moduleId: string;
  attendance: number | null;
  exercises: number | null;
  test: number | null;
  percent: number;
  passed: boolean;
}

export function moduleProgress(
  moduleId: string,
  d: LearnerData,
  f: ProgressFormula,
): ModuleProgress {
  const att = d.attendance.filter((a) => a.lessonId.startsWith(`${moduleId}.`));
  const attendance = att.length
    ? Math.round((100 * att.filter((a) => a.present).length) / att.length)
    : null;
  const ex = moduleExercises(moduleId);
  const exercises = ex.length
    ? Math.round((100 * ex.filter((e) => d.solved.has(e.id)).length) / ex.length)
    : null;
  const test = miniTest(moduleId).length ? (d.bestTest.get(moduleId) ?? 0) : null;
  const parts: [number | null, number][] = [
    [attendance, f.wAttendance],
    [exercises, f.wExercises],
    [test, f.wTest],
  ];
  const used = parts.filter(([v, w]) => v !== null && w > 0) as [number, number][];
  const weight = used.reduce((a, [, w]) => a + w, 0);
  const percent = weight ? Math.round(used.reduce((a, [v, w]) => a + v * w, 0) / weight) : 0;
  return {
    moduleId,
    attendance,
    exercises,
    test,
    percent,
    passed: f.passPercent !== null && weight > 0 && percent >= f.passPercent,
  };
}

export function levelProgress(
  level: LevelKey,
  d: LearnerData,
  f: ProgressFormula,
): { percent: number; modules: ModuleProgress[] } {
  const mods = content.curriculum.levels.find((l) => l.key === level)?.modules ?? [];
  const modules = mods.map((m) => moduleProgress(m.id, d, f));
  if (d.passedLevels.has(level)) return { percent: 100, modules };
  const percent = modules.length
    ? Math.round(modules.reduce((a, m) => a + m.percent, 0) / modules.length)
    : 0;
  return { percent, modules };
}

export function totalProgress(d: LearnerData, f: ProgressFormula): number {
  return Math.round(
    LEVEL_KEYS.reduce((a, k) => a + levelProgress(k, d, f).percent, 0) / LEVEL_KEYS.length,
  );
}

/** Freigeschaltete Level: das eigene und alle darunter (das nächste nach bestandener Prüfung, Phase 9). */
export function unlockedLevels(current: LevelKey): LevelKey[] {
  return LEVEL_KEYS.slice(0, LEVEL_KEYS.indexOf(current) + 1);
}
