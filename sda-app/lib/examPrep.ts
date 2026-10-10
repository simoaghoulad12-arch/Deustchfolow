import { content } from '@/content';
import { LEVEL_KEYS, type Lesson, type LevelKey } from '@/content/types';
import {
  EXAM_PARTS,
  type ExamPart,
  type ExamRegistrationRow,
  type ModelTestResultRow,
} from './data/types';

/**
 * Prüfungsvorbereitung (Phase 9). Termine, Gebühren und Formate der Prüfungen stehen hier bewusst nicht:
 * Sie ändern sich und sind beim Prüfungsanbieter zu prüfen. Eigene Modelltests gibt es noch nicht
 * (docs/CONTENT-STATUS.md); Ergebnisse von Modelltests trägt das Team pro Prüfungsteil ein.
 */

/** Bereich der Stunden, der zu einem Prüfungsteil passt (für die Wiederholungs-Empfehlung). */
const AREA_OF_PART: Record<ExamPart, Lesson['areas'][number]> = {
  Lesen: 'Lesen',
  Hören: 'Hören',
  Schreiben: 'Schreiben',
  Sprechen: 'Sprechen',
};

/** Stunden des Kurses zur Prüfungsvorbereitung (Titel mit „Prüfung“ oder „Modelltest“). */
export function examLessons(level: LevelKey): Lesson[] {
  return content.lessonsByLevel[level].filter(
    (l) => l.type !== 'x' && /prüfung|modelltest/i.test(l.title),
  );
}

export interface PartResult {
  part: ExamPart;
  percent: number | null;
  date: string | null;
}

export interface Readiness {
  /** Datum des letzten Modelltests in diesem Level */
  lastDate: string | null;
  parts: PartResult[];
  /** schwächster Teil (niedrigster Prozentwert); null ohne Ergebnisse */
  weakest: ExamPart | null;
  /** Stunden zum Wiederholen für den schwächsten Teil */
  repeat: Lesson[];
}

/** „Bereit für die Prüfung?“: letztes Ergebnis pro Teil, schwächster Teil, Empfehlung zum Wiederholen. */
export function readiness(level: LevelKey, results: ModelTestResultRow[]): Readiness {
  const own = results
    .filter((r) => r.level === level)
    .sort((a, b) => b.date.localeCompare(a.date) || b.created_at.localeCompare(a.created_at));
  const parts = EXAM_PARTS.map((part) => {
    const r = own.find((x) => x.part === part);
    return {
      part,
      percent: r ? Math.round((100 * Number(r.score)) / Number(r.max_score)) : null,
      date: r?.date ?? null,
    };
  });
  const measured = parts.filter((p) => p.percent !== null) as (PartResult & { percent: number })[];
  const weakest = measured.length
    ? measured.reduce((a, b) => (b.percent < a.percent ? b : a)).part
    : null;
  const repeat = weakest
    ? content.lessonsByLevel[level].filter(
        (l) => l.type !== 'x' && l.type !== 't' && l.areas.includes(AREA_OF_PART[weakest]),
      )
    : [];
  return { lastDate: own[0]?.date ?? null, parts, weakest, repeat };
}

/** Bestandene Level und das jeweils nächste Level (freigeschaltet). */
export function passedFromRegistrations(regs: ExamRegistrationRow[]): {
  passed: Set<LevelKey>;
  next: LevelKey[];
} {
  const passed = new Set(regs.filter((r) => r.result === 'bestanden').map((r) => r.level));
  const next = [...passed]
    .map((k) => LEVEL_KEYS[LEVEL_KEYS.indexOf(k) + 1])
    .filter((k): k is LevelKey => !!k);
  return { passed, next };
}
