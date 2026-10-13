import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { liveGet, type Me, type PathLesson } from '@/lib/api/live';
import { Badge, ButtonLink, Card, PageHeader } from '@/components/live/ui';
import { ListenButton, LessonPractice } from './lesson-practice';

export const metadata = { title: 'Lesson · DeutschFlow' };

export default async function LessonPage({ params }: { params: { slug: string } }) {
  const session = await getSession();
  if (!session) redirect('/login');
  const [lesson, me] = await Promise.all([liveGet<PathLesson>(session, `/path/lessons/${encodeURIComponent(params.slug)}`), liveGet<Me>(session, '/me')]);
  if (!lesson) notFound();
  const lang = me?.targetLanguage?.code ?? 'de';
  const c = lesson.content ?? {};

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <Link href="/path" className="text-sm text-indigo-600 hover:underline">
        ← Learning path
      </Link>
      <PageHeader
        eyebrow={`${lesson.level} · ${lesson.module.title} · lesson ${lesson.module.position}`}
        title={lesson.title}
        description={c.goal ?? lesson.description ?? undefined}
        action={lesson.completed ? <Badge tone="green">✓ Completed</Badge> : <Badge tone="neutral">{lesson.estimatedMinutes} min</Badge>}
      />

      {lesson.objectives.length > 0 && (
        <Card>
          <h2 className="mb-2 font-semibold">Learning objective</h2>
          <ul className="list-inside list-disc space-y-1 text-sm">
            {lesson.objectives.map((o) => (
              <li key={o}>{o}</li>
            ))}
          </ul>
        </Card>
      )}

      {c.vocabulary && c.vocabulary.length > 0 && (
        <Card>
          <h2 className="mb-3 font-semibold">Vocabulary</h2>
          <ul className="grid gap-2 sm:grid-cols-2">
            {c.vocabulary.map((v) => (
              <li key={v.word} className="flex min-w-0 items-start gap-2 rounded-xl bg-slate-50 p-3">
                <ListenButton text={v.word} languageCode={lang} label={`Listen to ${v.word}`} />
                <div className="min-w-0">
                  <p className="font-semibold" lang={lang}>
                    {v.word}
                  </p>
                  <p className="text-sm text-muted-foreground">{v.translation}</p>
                  {v.example && (
                    <p className="mt-1 text-xs italic text-slate-600" lang={lang}>
                      {v.example}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {lesson.grammarTopic && (
        <Card>
          <h2 className="mb-1 font-semibold">Grammar · {lesson.grammarTopic.title}</h2>
          <p className="text-sm text-muted-foreground">{lesson.grammarTopic.summary}</p>
          <Link href={`/grammar/${lesson.grammarTopic.slug}`} className="mt-2 inline-block text-sm font-semibold text-indigo-600 hover:underline">
            Full explanation and examples →
          </Link>
        </Card>
      )}

      {c.reading && (
        <Card>
          <div className="mb-2 flex items-center justify-between gap-3">
            <h2 className="font-semibold">Reading & listening</h2>
            <ListenButton text={c.reading.text} languageCode={lang} label="Listen to the text" withLabel />
          </div>
          <p className="leading-relaxed" lang={lang}>
            {c.reading.text}
          </p>
          {c.reading.gloss && (
            <details className="mt-3 text-sm text-muted-foreground">
              <summary className="cursor-pointer font-medium text-slate-700">Show translation</summary>
              <p className="mt-1">{c.reading.gloss}</p>
            </details>
          )}
        </Card>
      )}

      <LessonPractice lesson={lesson} languageCode={lang} />

      {c.missionSlug && (
        <Card className="bg-indigo-50/60">
          <h2 className="mb-1 font-semibold">AI practice in the world</h2>
          <p className="mb-3 text-sm text-muted-foreground">Use what you learned in a real conversation with an AI character.</p>
          <ButtonLink href={`/missions/${c.missionSlug}`} variant="secondary">
            Start the mission →
          </ButtonLink>
        </Card>
      )}

      <nav className="flex justify-between gap-3 pt-2 text-sm" aria-label="Lesson navigation">
        {lesson.previous ? (
          <Link href={`/path/${lesson.previous}`} className="text-indigo-600 hover:underline">
            ← Previous lesson
          </Link>
        ) : (
          <span />
        )}
        {lesson.next && (
          <Link href={`/path/${lesson.next}`} className="text-indigo-600 hover:underline">
            Next lesson →
          </Link>
        )}
      </nav>
    </div>
  );
}
