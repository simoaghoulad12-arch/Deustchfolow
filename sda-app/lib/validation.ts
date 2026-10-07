import { LEVEL_KEYS, type LevelKey } from '@/content/types';
import {
  DECISION_STATUSES,
  type DecisionStatus,
  ERROR_CATEGORIES,
  ERROR_STATUSES,
  HOMEWORK_STATUSES,
  SKILLS,
  type ErrorCategory,
  type ErrorStatus,
  type HomeworkStatus,
  type SkillKey,
} from './data/types';

/** Prüfung der Formulare. Gibt bereinigte Werte oder eine deutsche Fehlermeldung zurück. */
export type Parsed<T> = { ok: true; data: T } | { ok: false; error: string };

type Form = { get(name: string): FormDataEntryValue | null };

const str = (f: Form, k: string, max = 2000) =>
  String(f.get(k) ?? '')
    .trim()
    .slice(0, max);
const isDate = (v: string) =>
  /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(`${v}T00:00:00Z`));
const optDate = (v: string) => (v && isDate(v) ? v : null);
const isLevel = (v: string): v is LevelKey => (LEVEL_KEYS as readonly string[]).includes(v);
const isUuid = (v: string) => /^[0-9a-f-]{36}$/i.test(v);

export interface GroupInput {
  name: string;
  level: LevelKey;
  start_date: string | null;
}

export function parseGroup(f: Form): Parsed<GroupInput> {
  const name = str(f, 'name', 80);
  const level = str(f, 'level');
  const start = str(f, 'start_date');
  if (!name) return { ok: false, error: 'Bitte einen Namen für die Gruppe eingeben.' };
  if (!isLevel(level)) return { ok: false, error: 'Bitte ein Level wählen.' };
  if (start && !isDate(start))
    return { ok: false, error: 'Bitte ein gültiges Startdatum eingeben.' };
  return { ok: true, data: { name, level, start_date: optDate(start) } };
}

export type StudentInput = {
  name: string;
  level: LevelKey;
  group_id: string | null;
  start_date: string | null;
  current_module: string | null;
  strengths: string;
  weaknesses: string;
  next_goals: string;
} & Record<SkillKey, number | null>;

export function parseStudent(f: Form): Parsed<StudentInput> {
  const name = str(f, 'name', 120);
  const level = str(f, 'level');
  const group = str(f, 'group_id');
  const start = str(f, 'start_date');
  const mod = str(f, 'current_module');
  if (!name) return { ok: false, error: 'Bitte einen Namen eingeben.' };
  if (!isLevel(level)) return { ok: false, error: 'Bitte ein Level wählen.' };
  if (group && !isUuid(group)) return { ok: false, error: 'Bitte eine Gruppe wählen.' };
  if (start && !isDate(start))
    return { ok: false, error: 'Bitte ein gültiges Startdatum eingeben.' };
  if (mod && !new RegExp(`^${level}\\.\\d{1,2}$`).test(mod))
    return { ok: false, error: 'Das Modul passt nicht zum Level.' };
  const skills = {} as Record<SkillKey, number | null>;
  for (const s of SKILLS) {
    const v = str(f, s.key);
    const n = Number(v);
    if (v && !(Number.isInteger(n) && n >= 1 && n <= 5))
      return { ok: false, error: `${s.label}: bitte 1 bis 5 wählen.` };
    skills[s.key] = v ? n : null;
  }
  return {
    ok: true,
    data: {
      name,
      level,
      group_id: group || null,
      start_date: optDate(start),
      current_module: mod || null,
      strengths: str(f, 'strengths'),
      weaknesses: str(f, 'weaknesses'),
      next_goals: str(f, 'next_goals'),
      ...skills,
    },
  };
}

export interface ErrorInput {
  student_id: string;
  date: string;
  error: string;
  correction: string;
  category: ErrorCategory;
  status: ErrorStatus;
}

export function parseError(f: Form, today: string): Parsed<ErrorInput> {
  const student = str(f, 'student_id');
  const date = str(f, 'date') || today;
  const error = str(f, 'error', 500);
  const category = str(f, 'category') as ErrorCategory;
  const status = (str(f, 'status') || 'offen') as ErrorStatus;
  if (!isUuid(student)) return { ok: false, error: 'Bitte einen Schüler wählen.' };
  if (!error) return { ok: false, error: 'Bitte den Fehler eingeben.' };
  if (!isDate(date)) return { ok: false, error: 'Bitte ein gültiges Datum eingeben.' };
  if (!ERROR_CATEGORIES.includes(category))
    return { ok: false, error: 'Bitte eine Kategorie wählen.' };
  if (!ERROR_STATUSES.includes(status)) return { ok: false, error: 'Bitte einen Status wählen.' };
  return {
    ok: true,
    data: {
      student_id: student,
      date,
      error,
      correction: str(f, 'correction', 500),
      category,
      status,
    },
  };
}

export interface HomeworkInput {
  /** eine Schüler-ID oder „group:<id>“ für alle Schüler einer Gruppe (nur beim Anlegen) */
  target: { student: string } | { group: string };
  task: string;
  goal: string;
  deadline: string | null;
  status: HomeworkStatus;
  feedback: string;
}

export function parseHomework(f: Form): Parsed<HomeworkInput> {
  const target = str(f, 'student_id');
  const task = str(f, 'task', 500);
  const deadline = str(f, 'deadline');
  const status = (str(f, 'status') || 'Offen') as HomeworkStatus;
  const group = target.startsWith('group:') ? target.slice(6) : null;
  if (!(group ? isUuid(group) : isUuid(target)))
    return { ok: false, error: 'Bitte einen Schüler oder eine Gruppe wählen.' };
  if (!task) return { ok: false, error: 'Bitte die Aufgabe eingeben.' };
  if (deadline && !isDate(deadline))
    return { ok: false, error: 'Bitte eine gültige Deadline eingeben.' };
  if (!HOMEWORK_STATUSES.includes(status))
    return { ok: false, error: 'Bitte einen Status wählen.' };
  return {
    ok: true,
    data: {
      target: group ? { group } : { student: target },
      task,
      goal: str(f, 'goal', 500),
      deadline: optDate(deadline),
      status,
      feedback: str(f, 'feedback'),
    },
  };
}

export interface DocInput {
  date: string;
  group_id: string;
  lesson_id: string;
  present: string[];
  covered: string;
  can_do: string;
  errors: string;
  homework: string;
  next_lesson: string;
  material: string;
  problems: string;
  homeworkForPresent: boolean;
}

export function parseDoc(
  f: Form & { getAll(name: string): FormDataEntryValue[] },
  today: string,
): Parsed<DocInput> {
  const date = str(f, 'date') || today;
  const group = str(f, 'group_id');
  const lesson = str(f, 'lesson_id');
  if (!isDate(date)) return { ok: false, error: 'Bitte ein gültiges Datum eingeben.' };
  if (!isUuid(group)) return { ok: false, error: 'Bitte eine Gruppe wählen.' };
  if (!/^(A1|A2|B1|B2)\.\d{1,2}\.(Mo|Di|Mi|Do|Fr|Sa|So)$/.test(lesson))
    return { ok: false, error: 'Bitte eine Stunde wählen.' };
  const present = f.getAll('present').map(String).filter(isUuid);
  return {
    ok: true,
    data: {
      date,
      group_id: group,
      lesson_id: lesson,
      present,
      covered: str(f, 'covered'),
      can_do: str(f, 'can_do'),
      errors: str(f, 'errors'),
      homework: str(f, 'homework', 500),
      next_lesson: str(f, 'next_lesson', 300),
      material: str(f, 'material', 200),
      problems: str(f, 'problems'),
      homeworkForPresent: f.get('homework_for_present') === 'on',
    },
  };
}

export interface DecisionInput {
  status: DecisionStatus;
  decision: string;
  decided_at: string | null;
}

/** Entscheidung eintragen: „entschieden“ braucht einen Text; Datum standardmäßig heute. */
export function parseDecision(f: Form, today: string): Parsed<DecisionInput> {
  const status = str(f, 'status') as DecisionStatus;
  const decision = str(f, 'decision', 2000);
  const date = str(f, 'decided_at');
  if (!DECISION_STATUSES.includes(status))
    return { ok: false, error: 'Bitte einen Status wählen.' };
  if (status === 'entschieden' && !decision)
    return { ok: false, error: 'Bitte die Entscheidung eintragen.' };
  if (date && !isDate(date)) return { ok: false, error: 'Bitte ein gültiges Datum eingeben.' };
  return {
    ok: true,
    data: { status, decision, decided_at: status === 'entschieden' ? date || today : null },
  };
}

export interface QcThresholds {
  /** Mindest-Anwesenheit in Prozent */
  attendanceMin: number | null;
  /** Mindestanteil erledigter Hausaufgaben in Prozent */
  homeworkDoneMin: number | null;
  /** Höchstens so viele Tage ohne Dokumentation */
  daysWithoutDocMax: number | null;
}

const optInt = (v: string, max: number): number | null | 'bad' => {
  if (!v) return null;
  const n = Number(v);
  return Number.isInteger(n) && n >= 0 && n <= max ? n : 'bad';
};

/** Warnschwellen der Qualitätskontrolle (OFFENE ENTSCHEIDUNG, nur Leitung). Leer = keine Schwelle. */
export function parseThresholds(f: Form): Parsed<QcThresholds> {
  const a = optInt(str(f, 'attendanceMin'), 100);
  const h = optInt(str(f, 'homeworkDoneMin'), 100);
  const d = optInt(str(f, 'daysWithoutDocMax'), 365);
  if (a === 'bad' || h === 'bad')
    return { ok: false, error: 'Prozentwerte bitte als ganze Zahl von 0 bis 100.' };
  if (d === 'bad') return { ok: false, error: 'Tage bitte als ganze Zahl von 0 bis 365.' };
  return { ok: true, data: { attendanceMin: a, homeworkDoneMin: h, daysWithoutDocMax: d } };
}

export function normalizeThresholds(v: unknown): QcThresholds {
  const o = (v ?? {}) as Record<string, unknown>;
  const num = (x: unknown) => (typeof x === 'number' && Number.isFinite(x) ? x : null);
  return {
    attendanceMin: num(o.attendanceMin),
    homeworkDoneMin: num(o.homeworkDoneMin),
    daysWithoutDocMax: num(o.daysWithoutDocMax),
  };
}
