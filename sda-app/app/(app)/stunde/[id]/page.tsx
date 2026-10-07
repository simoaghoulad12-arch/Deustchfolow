import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Label } from '@/components/Label';
import { LessonView, type Mode } from '@/components/lesson/LessonView';
import { MaterialNote } from '@/components/lesson/MaterialNote';
import { Readout } from '@/components/lesson/Readout';
import { allLessons, content, findLesson } from '@/content';
import type { Lesson } from '@/content/types';
import { requireMember } from '@/lib/auth';
import { getStore } from '@/lib/data/store';
import { dayRole, DUTY_LABELS, leadOf, PERSON_LABELS, stepsFor } from '@/lib/dayRoles';
import { pick, t } from '@/lib/i18n';
import { getPrefs } from '@/lib/prefs';
import { lessonSpan } from '@/lib/progress';
import { getDayRoles, getPerson } from '@/lib/team';

const MODES: Mode[] = ['skript', 'schritte', 'liste'];

export function generateMetadata({ params }: { params: { id: string } }) {
  const lesson = findLesson(decodeURIComponent(params.id));
  return { title: lesson ? `${lesson.title} · Smart Deutsch Akademie` : 'Stunde' };
}

/** legacy: lessonMeta */
function metaLine(l: Lesson): string {
  const parts: string[] = [];
  if (l.level) parts.push(l.level);
  if (l.moduleId) parts.push(`Woche ${l.moduleId.split('.')[1]}`);
  if (l.day) parts.push(content.meta.days[l.day].de);
  parts.push(l.dauer);
  return parts.join(' · ');
}

export default async function LessonPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { modus?: string };
}) {
  const id = decodeURIComponent(params.id);
  const lesson = findLesson(id);
  if (!lesson) notFound();
  const member = await requireMember();
  const { lang } = getPrefs();
  const person = getPerson();
  const store = getStore();
  const [roles, done, note] = await Promise.all([
    getDayRoles(),
    store.doneItems(member.id),
    store.materialNote(id),
  ]);

  const role = dayRole(person, lesson.day, roles);
  const steps = stepsFor(lesson, role, content.meta.phases).map((s) => ({
    id: s.item.id,
    zeit: s.item.zeit,
    role: s.item.role,
    text: s.item.text,
    group: s.group,
  }));
  const readout = content.readouts[id];
  const objectives = lesson.moduleId ? (content.objectives[lesson.moduleId] ?? []) : [];
  const topic =
    lesson.type === 'g' && lesson.moduleId
      ? content.curriculum.levels
          .flatMap((l) => l.modules)
          .find((m) => m.id === lesson.moduleId)
          ?.grammar.find((g) => g.lessonId === id)
      : undefined;
  const lead = lesson.type === 'g' && lesson.day ? leadOf(lesson.day, roles) : null;

  // Nächste Stunde mit offenen Aufgaben (legacy: nextOpen) – hier einfach die nächste in der Reihenfolge.
  const ordered = allLessons();
  const pos = ordered.findIndex((l) => l.id === id);
  const next = pos >= 0 ? ordered[pos + 1] : undefined;
  const requested = searchParams.modus as Mode | undefined;
  const initialMode: Mode =
    requested && MODES.includes(requested) ? requested : readout ? 'skript' : 'schritte';

  return (
    <>
      <Link
        href={lesson.moduleId ? `/curriculum?level=${lesson.level}#${lesson.moduleId}` : '/'}
        className="mb-2 inline-flex min-h-11 items-center text-sm text-muted"
      >
        <span aria-hidden="true" className="me-1 rtl:rotate-180">
          ‹
        </span>{' '}
        {t(lang, 'back')}
      </Link>
      <h1 className="de-content text-2xl font-bold sm:text-3xl">{lesson.title}</h1>
      <p className="mb-3 text-muted" dir="ltr">
        {metaLine(lesson)}
      </p>

      {objectives.length > 0 && (
        <section className="card mb-4">
          <h2 className="mb-1 flex flex-wrap items-center gap-2 font-semibold">
            {t(lang, 'moduleGoal')} <Label kind="IMPROVEMENT" lang={lang} />
          </h2>
          <p className="text-sm text-muted">{t(lang, 'canDo')}</p>
          <ul className="de-content list-disc ps-5">
            {objectives.map((o) => (
              <li key={o}>{o}</li>
            ))}
          </ul>
        </section>
      )}

      {(lead || topic?.wortschatz) && (
        <section className="card mb-4 text-sm">
          {lead && (
            <p className="flex flex-wrap items-center gap-2">
              <b>{t(lang, 'leadToday')}:</b> {pick(lang, PERSON_LABELS[lead])}{' '}
              <Label kind="PROPOSAL" lang={lang} />
            </p>
          )}
          {topic?.wortschatz && (
            <p className="de-content">
              <b>{t(lang, 'vocabulary')}:</b> {topic.wortschatz}
            </p>
          )}
        </section>
      )}

      {steps.length > 0 && (
        <p className="mb-3">
          <span className="inline-block rounded-full bg-anth px-3 py-1 text-sm text-anth-ink">
            {t(lang, 'roleToday')}:{' '}
            {role === null ? pick(lang, PERSON_LABELS.ALL) : pick(lang, DUTY_LABELS[role])}
          </span>
        </p>
      )}

      <MaterialNote lessonId={id} initial={note} lang={lang} />

      <LessonView
        lessonId={id}
        lang={lang}
        steps={steps}
        initialDone={steps.filter((s) => done.has(s.id)).map((s) => s.id)}
        initialMode={initialMode}
        hasScript={!!readout}
        span={lessonSpan(lesson)}
        roles={content.meta.roles}
        next={next ? { id: next.id, title: next.title } : undefined}
        script={readout ? <Readout sections={readout} lang={lang} /> : undefined}
      />
    </>
  );
}
