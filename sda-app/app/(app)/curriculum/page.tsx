import Link from 'next/link';
import { Label } from '@/components/Label';
import { PageHeader } from '@/components/PageHeader';
import { ProgressBar } from '@/components/ProgressBar';
import { content } from '@/content';
import { AREAS, LEVEL_KEYS, type Area, type Lesson, type LevelKey } from '@/content/types';
import { requireMember } from '@/lib/auth';
import { getStore } from '@/lib/data/store';
import { t } from '@/lib/i18n';
import { getPrefs } from '@/lib/prefs';
import {
  LESSON_STATUSES,
  lessonProgress,
  percent,
  statusOf,
  sumProgress,
  type LessonStatus,
} from '@/lib/progress';
import { getDayRoles, getPerson } from '@/lib/team';

// Filter wie legacy (pageCur); „Test“ ist ein Bereich der Mini-Tests und hat dort keinen eigenen Filter.
const AREA_FILTERS: Area[] = AREAS.filter((a) => a !== 'Test');
const TYPE_TAG: Record<Lesson['type'], string> = {
  g: 'Grammatik',
  s: 'Sprechen',
  t: 'Test',
  x: 'Ablauf',
};

export default async function CurriculumPage({
  searchParams,
}: {
  searchParams: { level?: string; bereich?: string; status?: string };
}) {
  const member = await requireMember();
  const { lang } = getPrefs();
  const person = getPerson();
  const [roles, done] = await Promise.all([getDayRoles(), getStore().doneItems(member.id)]);

  const levelKey: LevelKey = LEVEL_KEYS.includes(searchParams.level as LevelKey)
    ? (searchParams.level as LevelKey)
    : 'A1';
  const area = AREA_FILTERS.includes(searchParams.bereich as Area)
    ? (searchParams.bereich as Area)
    : null;
  const status = LESSON_STATUSES.includes(searchParams.status as LessonStatus)
    ? (searchParams.status as LessonStatus)
    : null;
  const level = content.curriculum.levels.find((l) => l.key === levelKey)!;
  const lessons = content.lessonsByLevel[levelKey];
  const progressOf = (l: Lesson) => lessonProgress(l, person, roles, done);
  const filtered = !!(area || status);
  const matches = (l: Lesson) =>
    (!area || l.areas.includes(area)) && (!status || statusOf(progressOf(l)) === status);

  const href = (p: { level?: string; bereich?: string | null; status?: string | null }) => {
    const q = new URLSearchParams();
    q.set('level', p.level ?? levelKey);
    const b = p.bereich === undefined ? area : p.bereich;
    const s = p.status === undefined ? status : p.status;
    if (b) q.set('bereich', b);
    if (s) q.set('status', s);
    return `/curriculum?${q}`;
  };
  const chip =
    'inline-flex min-h-11 items-center rounded-full border border-line bg-panel px-3 text-sm aria-[current=true]:border-red aria-[current=true]:font-semibold aria-[current=true]:text-red';

  const start = lessons.find((l) => l.type === 'x');
  let shown = 0;

  return (
    <>
      <PageHeader page="cur" lang={lang} />

      <nav
        aria-label={t(lang, 'level')}
        className="mb-4 grid grid-cols-4 gap-1 rounded-xl border border-line bg-panel p-1"
      >
        {LEVEL_KEYS.map((k) => (
          <Link
            key={k}
            href={href({ level: k })}
            aria-current={k === levelKey ? 'page' : undefined}
            className="flex min-h-11 items-center justify-center rounded-lg font-semibold aria-[current=page]:bg-anth aria-[current=page]:text-anth-ink"
          >
            {k}
          </Link>
        ))}
      </nav>

      <section className="mb-4 rounded-xl bg-anth p-4 text-anth-ink">
        <p className="text-sm opacity-70">{level.key}</p>
        <h2 className="text-xl font-bold">{level.name}</h2>
        <p className="de-content mb-3 opacity-90">{level.goal}</p>
        <ProgressBar
          progress={sumProgress(lessons.map(progressOf))}
          label={`Fortschritt ${level.key}`}
        />
      </section>

      <p className="mb-3 flex flex-wrap items-center gap-2 text-sm text-muted">
        <Label kind="EXISTING" lang={lang} /> Themen, Stunden und Skripte{' '}
        <Label kind="IMPROVEMENT" lang={lang} /> Lernziele aus den Themen abgeleitet{' '}
        <Label kind="PROPOSAL" lang={lang} /> {level.modules.length} Module pro Level
      </p>

      <div className="mb-2 flex flex-wrap gap-2" role="group" aria-label={t(lang, 'area')}>
        <Link href={href({ bereich: null })} aria-current={!area} className={chip}>
          {t(lang, 'all')}
        </Link>
        {AREA_FILTERS.map((a) => (
          <Link key={a} href={href({ bereich: a })} aria-current={area === a} className={chip}>
            {a}
          </Link>
        ))}
      </div>
      <div className="mb-4 flex flex-wrap gap-2" role="group" aria-label={t(lang, 'status')}>
        <Link href={href({ status: null })} aria-current={!status} className={chip}>
          {t(lang, 'all')}
        </Link>
        {LESSON_STATUSES.map((s) => (
          <Link key={s} href={href({ status: s })} aria-current={status === s} className={chip}>
            {s}
          </Link>
        ))}
      </div>

      {start && !filtered && (
        <ul className="card mb-3">
          <LessonRow
            lesson={start}
            label={t(lang, 'beforeModule1')}
            pct={percent(progressOf(start))}
          />
        </ul>
      )}

      <div className="space-y-3">
        {level.modules.map((m) => {
          const ml = lessons.filter((l) => l.moduleId === m.id && l.type !== 'x');
          const visible = ml.filter(matches);
          if (!visible.length) return null;
          shown++;
          const germany = ml.some((l) => l.areas.includes('Deutschland'));
          return (
            <section key={m.id} id={m.id} className="card scroll-mt-20">
              <div className="flex items-baseline justify-between gap-2">
                <h2 className="de-content text-lg font-bold">
                  {t(lang, 'module')} {m.number}: {m.title}
                </h2>
                <span className="shrink-0 text-sm font-semibold">
                  {percent(sumProgress(ml.map(progressOf)))} %
                </span>
              </div>
              <p className="mt-1 text-sm text-muted">{t(lang, 'canDo')}</p>
              <ul className="de-content list-disc ps-5">
                {(content.objectives[m.id] ?? []).map((o) => (
                  <li key={o}>{o}</li>
                ))}
              </ul>
              <p className="de-content mt-2 flex flex-wrap gap-1 text-xs">
                {m.grammar.map((g) => (
                  <span key={g.lessonId} className="rounded bg-bg px-2 py-1">
                    {g.title}
                  </span>
                ))}
                <span className="rounded bg-bg px-2 py-1">Sprechen: {m.speaking.thema}</span>
                {germany && (
                  <span className="rounded bg-red-soft px-2 py-1 text-red">Deutschland-Bezug</span>
                )}
              </p>
              <details className="mt-2" open={filtered}>
                <summary className="inline-flex min-h-11 cursor-pointer items-center font-medium text-red">
                  {t(lang, 'showLessons')} ({visible.length})
                </summary>
                <ul className="divide-y divide-line">
                  {visible.map((l) => (
                    <LessonRow
                      key={l.id}
                      lesson={l}
                      label={l.day ? content.meta.days[l.day].de : ''}
                      pct={percent(progressOf(l))}
                      tag={TYPE_TAG[l.type]}
                    />
                  ))}
                </ul>
              </details>
            </section>
          );
        })}
      </div>
      {!shown && <p className="card">{t(lang, 'noLessonsForFilter')}</p>}
    </>
  );
}

function LessonRow({
  lesson,
  label,
  pct,
  tag,
}: {
  lesson: Lesson;
  label: string;
  pct: number;
  tag?: string;
}) {
  return (
    <li id={lesson.id}>
      <Link href={`/stunde/${lesson.id}`} className="flex min-h-11 items-center gap-3 py-2">
        <span className="w-20 shrink-0 text-sm text-muted">{label}</span>
        <span className="de-content min-w-0 flex-1">
          {lesson.title}
          {tag && <span className="ms-2 text-xs text-muted">{tag}</span>}
        </span>
        <span
          className={`shrink-0 text-sm font-semibold ${pct === 100 ? 'text-ok' : 'text-muted'}`}
        >
          {pct} %
        </span>
      </Link>
    </li>
  );
}
