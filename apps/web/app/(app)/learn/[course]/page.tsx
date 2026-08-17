import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { getCourse } from '@/lib/api/learning';
import { ProgressBadge } from '@/components/learning/progress-badge';
import { SKILL_LABELS } from '@/lib/learning/labels';

export async function generateMetadata({
  params,
}: {
  params: { course: string };
}): Promise<Metadata> {
  return { title: `${params.course} – DeutschFlow` };
}

export default async function CoursePage({ params }: { params: { course: string } }) {
  const session = await getSession();
  if (!session) return null;

  const course = await getCourse(session, params.course);
  if (!course) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="space-y-1">
        <p className="text-sm text-muted-foreground">
          {course.level.code} · {course.level.name}
        </p>
        <h1 className="text-2xl font-semibold">{course.title}</h1>
        {course.description && <p className="text-muted-foreground">{course.description}</p>}
      </div>

      <div className="space-y-8">
        {course.modules.map((module) => (
          <section key={module.id} className="space-y-3">
            <h2 className="text-lg font-semibold">{module.title}</h2>
            {module.description && (
              <p className="text-sm text-muted-foreground">{module.description}</p>
            )}
            <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border">
              {module.lessons.map((lesson) => (
                <li key={lesson.id}>
                  <Link
                    href={`/learn/${course.slug}/${lesson.slug}`}
                    className="flex items-center justify-between gap-4 p-4 transition-colors hover:bg-muted/50"
                  >
                    <div>
                      <p className="font-medium">{lesson.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {SKILL_LABELS[lesson.skill]} · {lesson.estimatedMinutes} Min.
                      </p>
                    </div>
                    <ProgressBadge status={lesson.progress?.status} progress={lesson.progress?.progress} />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
