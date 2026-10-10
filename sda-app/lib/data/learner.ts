import 'server-only';
import type { LevelKey } from '@/content/types';
import { devMember, type StudentMember } from '@/lib/auth';
import { normalizeFormula, type LearnerData, type ProgressFormula } from '@/lib/learn';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { getRepo } from './repo';
import { getStore } from './store';
import type { ErrorRow, HomeworkRow, StudentRow, SubmissionRow, TestResultRow } from './types';

/**
 * Datenzugriff der Lern-App. Lesen läuft mit der Sitzung des Schülers (RLS: nur eigene Daten).
 * Ergebnisse von Übungen und Tests schreibt nur der Server nach der Auswertung (Service-Role),
 * Hausaufgaben werden über die Datenbankfunktion submit_homework abgegeben.
 */

/** Eigener Schüler-Datensatz. Testzugang (Entwicklung): legt bei Bedarf einen markierten Testschüler an. */
export async function myStudent(member: StudentMember): Promise<StudentRow | null> {
  const repo = getRepo();
  const own = (await repo.list('students', { eq: { profile_id: member.id } }))[0];
  if (own || !devMember()) return own ?? null;
  const [created] = await repo.insert('students', [
    {
      name: 'Testschüler (Entwicklung)',
      level: 'A1',
      profile_id: member.id,
      group_id: null,
      strengths: '',
      weaknesses: '',
      next_goals: '',
    } as never,
  ]);
  return created ?? null;
}

/** Eigene Anwesenheit (ohne Einblick in die Dokumentation). */
export async function myAttendance(
  studentId: string,
): Promise<{ lessonId: string; present: boolean }[]> {
  if (devMember()) {
    const docs = await getRepo().list('lesson_docs');
    return docs
      .filter((d) => d.present.includes(studentId) || d.absent.includes(studentId))
      .map((d) => ({ lessonId: d.lesson_id, present: d.present.includes(studentId) }));
  }
  const { data, error } = await createClient().rpc('my_attendance');
  if (error) throw new Error('Anwesenheit laden fehlgeschlagen');
  return ((data ?? []) as { lesson_id: string; present: boolean }[]).map((r) => ({
    lessonId: r.lesson_id,
    present: r.present,
  }));
}

export interface LearnerBundle {
  student: StudentRow;
  data: LearnerData;
  formula: ProgressFormula;
  tests: TestResultRow[];
  homework: HomeworkRow[];
  submissions: SubmissionRow[];
  errors: ErrorRow[];
}

/** Alles, was die Lern-App für einen Schüler braucht. */
export async function loadLearner(
  student: StudentRow,
  passedLevels: Set<LevelKey> = new Set(),
): Promise<LearnerBundle> {
  const repo = getRepo();
  const eq = { eq: { student_id: student.id } };
  const [attendance, attempts, tests, homework, submissions, errors, formula] = await Promise.all([
    myAttendance(student.id),
    repo.list('exercise_attempts', eq),
    repo.list('test_results', { ...eq, order: { column: 'created_at', ascending: false } }),
    repo.list('homework', { ...eq, order: { column: 'created_at', ascending: false } }),
    repo.list('submissions', { ...eq, order: { column: 'created_at', ascending: false } }),
    repo.list('errors', { ...eq, order: { column: 'date', ascending: false } }),
    getStore().setting('progress_formula'),
  ]);
  const bestTest = new Map<string, number>();
  for (const t of tests) {
    const pct = Math.round((100 * t.score) / t.max_score);
    bestTest.set(t.module_id, Math.max(bestTest.get(t.module_id) ?? 0, pct));
  }
  return {
    student,
    data: {
      attendance,
      solved: new Set(attempts.filter((a) => a.correct).map((a) => a.exercise_id)),
      bestTest,
      passedLevels,
    },
    formula: normalizeFormula(formula),
    tests,
    homework,
    submissions,
    errors,
  };
}

/** Ergebnis schreiben – nur nach Auswertung auf dem Server. */
async function serverInsert(
  table: 'exercise_attempts' | 'test_results',
  rows: Record<string, unknown>[],
) {
  if (devMember()) {
    await getRepo().insert(table, rows as never);
    return;
  }
  const { error } = await createAdminClient().from(table).insert(rows);
  if (error) throw new Error('Speichern fehlgeschlagen');
}

export async function recordAttempts(
  studentId: string,
  attempts: { exerciseId: string; answer: string; correct: boolean }[],
) {
  await serverInsert(
    'exercise_attempts',
    attempts.map((a) => ({
      student_id: studentId,
      exercise_id: a.exerciseId,
      answer: a.answer.slice(0, 500),
      correct: a.correct,
    })),
  );
}

export async function recordTest(studentId: string, moduleId: string, score: number, max: number) {
  await serverInsert('test_results', [
    { student_id: studentId, module_id: moduleId, score, max_score: max },
  ]);
}

export async function submitHomework(studentId: string, homeworkId: string, text: string) {
  if (devMember()) {
    const repo = getRepo();
    const hw = await repo.get('homework', homeworkId);
    if (!hw || hw.student_id !== studentId) throw new Error('keine eigene Hausaufgabe');
    await repo.insert('submissions', [
      { homework_id: homeworkId, student_id: studentId, text: text.trim().slice(0, 5000) },
    ]);
    if (hw.status === 'Offen') await repo.update('homework', homeworkId, { status: 'Abgegeben' });
    return;
  }
  const { error } = await createClient().rpc('submit_homework', { hw: homeworkId, body: text });
  if (error) throw new Error('Abgabe fehlgeschlagen');
}
