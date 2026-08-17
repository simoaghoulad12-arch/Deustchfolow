import type { Metadata } from 'next';
import Link from 'next/link';
import { getSession } from '@/lib/auth/session';
import { getCourses } from '@/lib/api/learning';

export const metadata: Metadata = { title: 'Lernen – DeutschFlow' };

export default async function LearnPage() {
  const session = await getSession();
  if (!session) return null;

  const courses = await getCourses(session);

  const coursesByLevel = new Map<string, { levelName: string; courses: typeof courses }>();
  for (const course of courses) {
    const key = course.level.code;
    if (!coursesByLevel.has(key)) {
      coursesByLevel.set(key, { levelName: course.level.name, courses: [] });
    }
    coursesByLevel.get(key)!.courses.push(course);
  }

  return (
    <div className="mx-auto max-w-3xl space-y-10">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Lernen</h1>
        <p className="text-sm text-muted-foreground">Wähle einen Kurs, um weiterzumachen.</p>
      </div>

      {coursesByLevel.size === 0 && (
        <p className="text-sm text-muted-foreground">Noch keine Kurse verfügbar.</p>
      )}

      {[...coursesByLevel.entries()].map(([code, group]) => (
        <section key={code} className="space-y-4">
          <h2 className="text-lg font-semibold">
            {code} <span className="font-normal text-muted-foreground">— {group.levelName}</span>
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {group.courses.map((course) => (
              <Link
                key={course.id}
                href={`/learn/${course.slug}`}
                className="rounded-lg border border-border p-4 transition-colors hover:bg-muted/50"
              >
                <p className="font-medium">{course.title}</p>
                {course.description && (
                  <p className="mt-1 text-sm text-muted-foreground">{course.description}</p>
                )}
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
