'use server';

import { revalidatePath } from 'next/cache';
import type { LevelKey } from '@/content/types';
import { requireStudent } from '@/lib/auth';
import { myStudent, recordAttempts, recordTest, submitHomework } from '@/lib/data/learner';
import { getRepo } from '@/lib/data/repo';
import { isCorrect, miniTest, moduleExercises, unlockedLevels } from '@/lib/learn';
import { passedLevelsOf } from '@/lib/exams';

async function me() {
  const member = await requireStudent();
  const student = await myStudent(member);
  if (!student) throw new Error('Kein Schüler-Datensatz verknüpft');
  return student;
}

/** Freigeschaltet: eigenes Level und darunter (und das nächste nach bestandener Prüfung, Phase 9). */
async function canOpen(level: LevelKey, moduleId: string, studentId: string) {
  const passed = await passedLevelsOf(studentId);
  const unlocked = new Set([...unlockedLevels(level), ...passed.next]);
  return unlocked.has(moduleId.split('.')[0] as LevelKey);
}

export interface CheckState {
  status: 'idle' | 'done' | 'error';
  correct: boolean;
  solution: string;
  message: string;
}

/** Eine Übung prüfen und das Ergebnis speichern. */
export async function checkExercise(_prev: CheckState, fd: FormData): Promise<CheckState> {
  const student = await me();
  const exerciseId = String(fd.get('exercise') ?? '');
  const answer = String(fd.get('answer') ?? '').trim();
  const moduleId = exerciseId.split('.').slice(0, 2).join('.');
  const ex = moduleExercises(moduleId).find((e) => e.id === exerciseId);
  if (!ex || !(await canOpen(student.level, moduleId, student.id))) {
    return {
      status: 'error',
      correct: false,
      solution: '',
      message: 'Diese Übung ist nicht freigeschaltet.',
    };
  }
  if (!answer)
    return {
      status: 'error',
      correct: false,
      solution: '',
      message: 'Bitte eine Antwort eingeben.',
    };
  const correct = isCorrect(answer, ex.loesung);
  try {
    await recordAttempts(student.id, [{ exerciseId, answer, correct }]);
  } catch {
    return {
      status: 'error',
      correct,
      solution: ex.loesung,
      message: 'Ergebnis konnte nicht gespeichert werden.',
    };
  }
  revalidatePath('/lernen');
  return { status: 'done', correct, solution: ex.loesung, message: '' };
}

export interface TestState {
  status: 'idle' | 'done' | 'error';
  score: number;
  max: number;
  results: { id: string; answer: string; correct: boolean; solution: string }[];
  message: string;
}

/** Wochen-Mini-Test abgeben: alle Fragen auswerten, Punktzahl speichern. */
export async function submitMiniTest(_prev: TestState, fd: FormData): Promise<TestState> {
  const student = await me();
  const moduleId = String(fd.get('module') ?? '');
  const questions = miniTest(moduleId);
  const empty: TestState = { status: 'error', score: 0, max: 0, results: [], message: '' };
  if (!questions.length || !(await canOpen(student.level, moduleId, student.id))) {
    return { ...empty, message: 'Dieser Test ist nicht freigeschaltet.' };
  }
  const results = questions.map((q) => {
    const answer = String(fd.get(`q-${q.id}`) ?? '').trim();
    return { id: q.id, answer, correct: isCorrect(answer, q.loesung), solution: q.loesung };
  });
  const score = results.filter((r) => r.correct).length;
  try {
    await recordTest(student.id, moduleId, score, questions.length);
  } catch {
    return { ...empty, message: 'Ergebnis konnte nicht gespeichert werden.' };
  }
  revalidatePath('/lernen');
  return { status: 'done', score, max: questions.length, results, message: '' };
}

export interface SimpleState {
  status: 'idle' | 'done' | 'error';
  message: string;
}

/** Hausaufgabe als Text abgeben. */
export async function handInHomework(_prev: SimpleState, fd: FormData): Promise<SimpleState> {
  const student = await me();
  const text = String(fd.get('text') ?? '').trim();
  if (!text) return { status: 'error', message: 'Bitte deine Antwort eingeben.' };
  if (text.length > 5000)
    return { status: 'error', message: 'Der Text ist zu lang (max. 5000 Zeichen).' };
  try {
    await submitHomework(student.id, String(fd.get('homework') ?? ''), text);
  } catch {
    return { status: 'error', message: 'Abgabe fehlgeschlagen. Bitte erneut versuchen.' };
  }
  revalidatePath('/lernen/hausaufgaben');
  return { status: 'done', message: 'Abgegeben. Deine Lehrkraft gibt dir Feedback.' };
}

/** Wiederholungsübung zu einem eigenen Fehler: richtige Form eingeben. Status setzt weiterhin die Lehrkraft. */
export async function repeatError(_prev: CheckState, fd: FormData): Promise<CheckState> {
  const student = await me();
  const id = String(fd.get('error') ?? '');
  const answer = String(fd.get('answer') ?? '').trim();
  const entry = await getRepo().get('errors', id); // RLS: nur eigene
  if (!entry || entry.student_id !== student.id || !entry.correction) {
    return { status: 'error', correct: false, solution: '', message: 'Diese Übung gibt es nicht.' };
  }
  if (!answer)
    return {
      status: 'error',
      correct: false,
      solution: '',
      message: 'Bitte die richtige Form eingeben.',
    };
  const correct = isCorrect(answer, entry.correction);
  try {
    await recordAttempts(student.id, [{ exerciseId: `error:${id}`, answer, correct }]);
  } catch {
    /* Wiederholung wird trotzdem angezeigt */
  }
  return { status: 'done', correct, solution: entry.correction, message: '' };
}
