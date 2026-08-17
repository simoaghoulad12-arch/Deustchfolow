import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { getLesson, getLessonExercises } from '@/lib/api/learning';
import { ProgressBadge } from '@/components/learning/progress-badge';
import { SKILL_LABELS } from '@/lib/learning/labels';
import { ExerciseWidget } from './exercise-widget';

export async function generateMetadata({
  params,
}: {
  params: { lesson: string };
}): Promise<Metadata> {
  return { title: `${params.lesson} – DeutschFlow` };
}

export default async function LessonPage({
  params,
}: {
  params: { course: string; lesson: string };
}) {
  const session = await getSession();
  if (!session) return null;

  const lesson = await getLesson(session, params.lesson);
  if (!lesson) notFound();

  const exercises = await getLessonExercises(session, params.lesson);

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">
          <Link href={`/learn/${lesson.module.course.slug}`} className="hover:underline">
            {lesson.module.course.title}
          </Link>{' '}
          · {lesson.module.title}
        </p>
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-2xl font-semibold">{lesson.title}</h1>
          <ProgressBadge status={lesson.progress?.status} progress={lesson.progress?.progress} />
        </div>
        {lesson.description && <p className="text-muted-foreground">{lesson.description}</p>}
        <p className="text-sm text-muted-foreground">
          {SKILL_LABELS[lesson.skill]} · {lesson.estimatedMinutes} Min.
        </p>
      </div>

      {lesson.objectives.length > 0 && (
        <section className="space-y-2 rounded-lg border border-border p-4">
          <h2 className="text-sm font-semibold">Lernziele</h2>
          <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
            {lesson.objectives.map((objective) => (
              <li key={objective}>{objective}</li>
            ))}
          </ul>
        </section>
      )}

      {lesson.prerequisites.length > 0 && (
        <p className="text-sm text-muted-foreground">
          Voraussetzung:{' '}
          {lesson.prerequisites.map((prerequisite, i) => (
            <span key={prerequisite.id}>
              {i > 0 && ', '}
              <Link href={`/learn/${params.course}/${prerequisite.slug}`} className="underline">
                {prerequisite.title}
              </Link>
            </span>
          ))}
        </p>
      )}

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Übungen</h2>
        {exercises.length === 0 ? (
          <p className="text-sm text-muted-foreground">Für diese Lektion sind noch keine Übungen hinterlegt.</p>
        ) : (
          <div className="space-y-4">
            {exercises.map((exercise, index) => (
              <ExerciseWidget key={exercise.id} exercise={exercise} index={index} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
