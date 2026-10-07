import 'server-only';
import { requireStudent } from '@/lib/auth';
import { passedLevelsOf } from '@/lib/exams';
import { loadLearner, myStudent, type LearnerBundle } from './learner';

/** Für jede Seite der Lern-App: angemeldeter Schüler mit seinen Daten (oder null, wenn noch nicht verknüpft). */
export async function loadMe(): Promise<{
  name: string;
  bundle: LearnerBundle | null;
  nextLevels: string[];
}> {
  const member = await requireStudent();
  const student = await myStudent(member);
  if (!student) return { name: member.fullName || member.email, bundle: null, nextLevels: [] };
  const exams = await passedLevelsOf(student.id);
  return {
    name: student.name,
    bundle: await loadLearner(student, exams.passed),
    nextLevels: exams.next,
  };
}
