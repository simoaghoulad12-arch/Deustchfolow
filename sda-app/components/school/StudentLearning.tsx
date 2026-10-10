import { inviteStudent } from '@/app/actions/school';
import { ActionForm } from '@/components/forms/ActionForm';
import { Field } from '@/components/forms/Field';
import { moduleById } from '@/lib/learn';
import type {
  ExerciseAttemptRow,
  StudentRow,
  SubmissionRow,
  TestResultRow,
} from '@/lib/data/types';

/** Lern-App eines Schülers aus Sicht des Teams: Zugang, Mini-Tests, Übungen, Abgaben. */
export function StudentLearning({
  student,
  tests,
  attempts,
  submissions,
}: {
  student: StudentRow;
  tests: TestResultRow[];
  attempts: ExerciseAttemptRow[];
  submissions: SubmissionRow[];
}) {
  const solved = new Set(
    attempts
      .filter((a) => a.correct && !a.exercise_id.startsWith('error:'))
      .map((a) => a.exercise_id),
  ).size;
  return (
    <section className="card mb-4">
      <h2 className="mb-2 text-xl font-bold">Lern-App</h2>
      {student.profile_id ? (
        <>
          <p className="mb-2 text-sm font-semibold text-ok">Zugang ist eingerichtet.</p>
          <p className="text-sm">
            Richtig gelöste Übungen: {solved} · Abgaben: {submissions.length}
          </p>
          {tests.length > 0 && (
            <>
              <h3 className="mt-3 font-semibold">Mini-Tests</h3>
              <ul className="text-sm">
                {tests.map((t) => (
                  <li key={t.id}>
                    {t.created_at.slice(0, 10)} · {t.module_id} {moduleById(t.module_id)?.title}:{' '}
                    {t.score} von {t.max_score}
                  </li>
                ))}
              </ul>
            </>
          )}
        </>
      ) : (
        <>
          <p className="mb-3 text-sm text-muted">
            Noch kein Zugang. Mit der Einladung bekommt der Schüler einen Anmeldelink per E-Mail und
            sieht danach nur die eigenen Daten und die Lerninhalte seines Levels.
          </p>
          <ActionForm action={inviteStudent} submitLabel="Zur Lern-App einladen">
            <input type="hidden" name="id" value={student.id} />
            <Field label="E-Mail des Schülers">
              <input
                name="email"
                type="email"
                required
                autoComplete="off"
                inputMode="email"
                className="input"
              />
            </Field>
          </ActionForm>
        </>
      )}
    </section>
  );
}
