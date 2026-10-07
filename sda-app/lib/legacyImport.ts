import { findLesson } from '@/content';
import { LEVEL_KEYS, type LevelKey } from '@/content/types';
import {
  ERROR_CATEGORIES,
  ERROR_STATUSES,
  HOMEWORK_STATUSES,
  type ErrorCategory,
  type ErrorStatus,
  type HomeworkStatus,
  type SkillKey,
} from './data/types';

/**
 * Übernahme der Daten aus der alten Version (legacy/index.html → Einstellungen & Daten → Export).
 * Der Export ist JSON.stringify(DATA) mit den Sammlungen students, docs, errors, homework, materials.
 *
 * Die alte Version kannte keine Gruppen, nur Level. Darum entsteht pro Level mit Schülern eine Gruppe
 * „Übernommen A1“ usw. (ohne Startdatum) – danach in „Gruppen“ umbenennen oder aufteilen.
 */

const LEGACY_SKILLS: Record<string, SkillKey> = {
  gr: 'skill_grammar',
  wo: 'skill_vocabulary',
  sp: 'skill_speaking',
  ho: 'skill_listening',
  le: 'skill_reading',
  sc: 'skill_writing',
};

export interface ImportPlan {
  groups: { key: LevelKey; name: string }[];
  students: { legacyId: string; level: LevelKey; row: Record<string, unknown> }[];
  docs: { level: LevelKey; row: Record<string, unknown>; present: string[]; absent: string[] }[];
  errors: { legacyStudent: string; row: Record<string, unknown> }[];
  homework: { legacyStudent: string; row: Record<string, unknown> }[];
  notes: { lessonId: string; note: string }[];
  warnings: string[];
}

const s = (v: unknown, max = 2000) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const date = (v: unknown) => {
  const x = s(v);
  return /^\d{4}-\d{2}-\d{2}$/.test(x) && !Number.isNaN(Date.parse(`${x}T00:00:00Z`)) ? x : null;
};
const arr = (v: unknown): Record<string, unknown>[] =>
  Array.isArray(v) ? v.filter((x) => x && typeof x === 'object') : [];
const level = (v: unknown): LevelKey | null =>
  LEVEL_KEYS.includes(v as LevelKey) ? (v as LevelKey) : null;

export function importGroupName(k: LevelKey) {
  return `Übernommen ${k}`;
}

/** Prüft den Export und baut einen Plan. Wirft nur bei völlig ungültigem Text. */
export function planLegacyImport(text: string): ImportPlan {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    throw new Error('Der Text ist kein gültiger Export (kein JSON).');
  }
  if (!raw || typeof raw !== 'object' || Array.isArray(raw))
    throw new Error('Der Text ist kein gültiger Export.');
  const o = raw as Record<string, unknown>;
  if (!['students', 'docs', 'errors', 'homework', 'materials'].some((k) => Array.isArray(o[k]))) {
    throw new Error(
      'Im Text fehlen die Sammlungen des Exports (students, docs, errors, homework, materials).',
    );
  }
  const plan: ImportPlan = {
    groups: [],
    students: [],
    docs: [],
    errors: [],
    homework: [],
    notes: [],
    warnings: [],
  };
  const studentLevel = new Map<string, LevelKey>();

  for (const r of arr(o.students)) {
    const id = s(r.id);
    const name = s(r.name, 120);
    const lv = level(r.level) ?? 'A1';
    if (!id || !name) {
      plan.warnings.push('Ein Schüler ohne Name oder ID wurde übersprungen.');
      continue;
    }
    if (!level(r.level)) plan.warnings.push(`${name}: Level fehlte, A1 gesetzt.`);
    const skills = (r.skills ?? {}) as Record<string, unknown>;
    const row: Record<string, unknown> = {
      name,
      level: lv,
      start_date: date(r.start),
      current_module:
        /^\d{1,2}$/.test(s(r.module)) && findLesson(`${lv}.${s(r.module)}.Mo`)
          ? `${lv}.${s(r.module)}`
          : null,
      strengths: s(r.strengths),
      weaknesses: s(r.weaknesses),
      next_goals: s(r.goals),
    };
    for (const [k, col] of Object.entries(LEGACY_SKILLS)) {
      const n = Number(skills[k]);
      row[col] = Number.isInteger(n) && n >= 1 && n <= 5 ? n : null;
    }
    plan.students.push({ legacyId: id, level: lv, row });
    studentLevel.set(id, lv);
  }

  for (const r of arr(o.docs)) {
    const lessonId = s(r.lessonId);
    const lesson = findLesson(lessonId);
    const lv = level(r.level) ?? lesson?.level ?? null;
    const d = date(r.date);
    if (!lesson || lesson.type === 'x' || !lv || !d) {
      plan.warnings.push(
        `Dokumentation vom ${s(r.date) || '?'} ohne gültige Stunde oder Datum übersprungen.`,
      );
      continue;
    }
    const teacher = s(r.teacher, 120);
    const problems = s(r.problems);
    plan.docs.push({
      level: lv,
      present: (Array.isArray(r.present) ? r.present : [])
        .map(String)
        .filter((x) => studentLevel.has(x)),
      absent: (Array.isArray(r.absent) ? r.absent : [])
        .map(String)
        .filter((x) => studentLevel.has(x)),
      row: {
        date: d,
        lesson_id: lessonId,
        covered: s(r.covered),
        can_do: s(r.canNow),
        errors: s(r.errors),
        homework: s(r.homework, 500),
        next_lesson: s(r.next, 300),
        material: s(r.material, 200),
        // Die alte Version speicherte die Lehrkraft als freien Text; hier bleibt er im Feld „Probleme“ erhalten.
        problems: teacher
          ? `${problems}${problems ? '\n' : ''}Lehrkraft (alte Version): ${teacher}`
          : problems,
      },
    });
  }

  for (const r of arr(o.errors)) {
    const st = s(r.student);
    const category = s(r.category) as ErrorCategory;
    const status = (s(r.status) || 'offen') as ErrorStatus;
    if (!studentLevel.has(st) || !s(r.error)) {
      plan.warnings.push('Ein Fehler ohne bekannten Schüler oder ohne Text wurde übersprungen.');
      continue;
    }
    if (!ERROR_CATEGORIES.includes(category) || !ERROR_STATUSES.includes(status)) {
      plan.warnings.push(
        `Fehler „${s(r.error, 60)}“: unbekannte Kategorie oder Status, übersprungen.`,
      );
      continue;
    }
    plan.errors.push({
      legacyStudent: st,
      row: {
        date: date(r.date) ?? undefined,
        error: s(r.error, 500),
        correction: s(r.correction, 500),
        category,
        status,
      },
    });
  }

  for (const r of arr(o.homework)) {
    const st = s(r.student);
    const status = (s(r.status) || 'Offen') as HomeworkStatus;
    if (!studentLevel.has(st) || !s(r.task)) {
      plan.warnings.push(
        'Eine Hausaufgabe ohne bekannten Schüler oder ohne Aufgabe wurde übersprungen.',
      );
      continue;
    }
    if (!HOMEWORK_STATUSES.includes(status)) {
      plan.warnings.push(`Hausaufgabe „${s(r.task, 60)}“: unbekannter Status, übersprungen.`);
      continue;
    }
    plan.homework.push({
      legacyStudent: st,
      row: {
        task: s(r.task, 500),
        goal: s(r.goal, 500),
        deadline: date(r.deadline),
        status,
        feedback: s(r.feedback),
      },
    });
  }

  for (const r of arr(o.materials)) {
    const lessonId = s(r.id);
    const note = s(r.note, 200);
    if (findLesson(lessonId) && note) plan.notes.push({ lessonId, note });
  }

  const levels = new Set<LevelKey>([
    ...plan.students.map((x) => x.level),
    ...plan.docs.map((x) => x.level),
  ]);
  plan.groups = LEVEL_KEYS.filter((k) => levels.has(k)).map((k) => ({
    key: k,
    name: importGroupName(k),
  }));
  return plan;
}

export function planSummary(p: ImportPlan): string {
  return [
    `${p.groups.length} Gruppen`,
    `${p.students.length} Schüler`,
    `${p.docs.length} Dokumentationen`,
    `${p.errors.length} Fehler`,
    `${p.homework.length} Hausaufgaben`,
    `${p.notes.length} Lehrbuch-Notizen`,
  ].join(', ');
}
