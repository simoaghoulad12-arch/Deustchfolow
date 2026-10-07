import type { LevelKey } from '@/content/types';

/** Zeilen der Datenbank-Tabellen (supabase/migrations). Datumsangaben als 'YYYY-MM-DD'. */

export interface GroupRow {
  id: string;
  name: string;
  level: LevelKey;
  start_date: string | null;
  created_at: string;
}

export interface GroupStaffRow {
  group_id: string;
  profile_id: string;
}

export interface ProfileRow {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'teacher' | 'native' | 'student';
}

export const SKILLS = [
  { key: 'skill_grammar', label: 'Grammatik' },
  { key: 'skill_vocabulary', label: 'Wortschatz' },
  { key: 'skill_speaking', label: 'Sprechen' },
  { key: 'skill_listening', label: 'Hören' },
  { key: 'skill_reading', label: 'Lesen' },
  { key: 'skill_writing', label: 'Schreiben' },
] as const;
export type SkillKey = (typeof SKILLS)[number]['key'];

export interface StudentRow extends Record<SkillKey, number | null> {
  id: string;
  name: string;
  level: LevelKey;
  group_id: string | null;
  start_date: string | null;
  current_module: string | null;
  strengths: string;
  weaknesses: string;
  next_goals: string;
  /** Login des Schülers (Lern-App), null = noch nicht eingeladen */
  profile_id: string | null;
  created_at: string;
}

export interface LessonDocRow {
  id: string;
  date: string;
  teacher_id: string | null;
  group_id: string;
  lesson_id: string;
  present: string[];
  absent: string[];
  covered: string;
  can_do: string;
  errors: string;
  homework: string;
  next_lesson: string;
  material: string;
  problems: string;
  created_by: string | null;
  created_at: string;
}

export const ERROR_CATEGORIES = [
  'Grammatik',
  'Wortschatz',
  'Aussprache',
  'Satzbau',
  'Schreiben',
  'Sprechen',
  'Verständnis',
] as const;
export type ErrorCategory = (typeof ERROR_CATEGORIES)[number];
export const ERROR_STATUSES = ['offen', 'wiederholen', 'verbessert'] as const;
export type ErrorStatus = (typeof ERROR_STATUSES)[number];

export interface ErrorRow {
  id: string;
  student_id: string;
  date: string;
  error: string;
  correction: string;
  category: ErrorCategory;
  status: ErrorStatus;
  created_at: string;
}

export const HOMEWORK_STATUSES = ['Offen', 'Abgegeben', 'Korrigiert'] as const;
export type HomeworkStatus = (typeof HOMEWORK_STATUSES)[number];

export interface HomeworkRow {
  id: string;
  student_id: string;
  task: string;
  goal: string;
  deadline: string | null;
  status: HomeworkStatus;
  feedback: string;
  created_at: string;
}

export const DECISION_STATUSES = ['offen', 'entschieden'] as const;
export type DecisionStatus = (typeof DECISION_STATUSES)[number];

export interface DecisionRow {
  id: string;
  title: string;
  title_ar: string;
  status: DecisionStatus;
  decision: string;
  decided_at: string | null;
  decided_by: string | null;
  sort_order: number;
}

export interface ExerciseAttemptRow {
  id: string;
  student_id: string;
  exercise_id: string;
  answer: string;
  correct: boolean;
  created_at: string;
}

export interface TestResultRow {
  id: string;
  student_id: string;
  module_id: string;
  score: number;
  max_score: number;
  created_at: string;
}

export interface SubmissionRow {
  id: string;
  homework_id: string;
  student_id: string;
  text: string;
  created_at: string;
}

export const EXAM_PARTS = ['Lesen', 'Hören', 'Schreiben', 'Sprechen'] as const;
export type ExamPart = (typeof EXAM_PARTS)[number];
/** ASCII-Schlüssel für Formularfelder: Feldnamen mit Umlauten kommen beim Absenden nicht sicher an. */
export const EXAM_PART_KEY: Record<ExamPart, string> = {
  Lesen: 'lesen',
  Hören: 'hoeren',
  Schreiben: 'schreiben',
  Sprechen: 'sprechen',
};
export const EXAM_RESULTS = ['offen', 'bestanden', 'nicht bestanden'] as const;
export type ExamResult = (typeof EXAM_RESULTS)[number];

export interface ModelTestResultRow {
  id: string;
  student_id: string;
  level: LevelKey;
  date: string;
  part: ExamPart;
  score: number;
  max_score: number;
  created_at: string;
}

export interface ExamRegistrationRow {
  id: string;
  student_id: string;
  level: LevelKey;
  provider: string;
  exam_date: string | null;
  place: string;
  result: ExamResult;
  notes: string;
  created_at: string;
}

export interface Tables {
  groups: GroupRow;
  group_staff: GroupStaffRow;
  profiles: ProfileRow;
  students: StudentRow;
  lesson_docs: LessonDocRow;
  errors: ErrorRow;
  homework: HomeworkRow;
  decisions: DecisionRow;
  exercise_attempts: ExerciseAttemptRow;
  test_results: TestResultRow;
  submissions: SubmissionRow;
  model_test_results: ModelTestResultRow;
  exam_registrations: ExamRegistrationRow;
}
export type TableName = keyof Tables;
