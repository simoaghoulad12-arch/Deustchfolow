import Link from 'next/link';
import { PageHeader } from '@/components/PageHeader';
import { content } from '@/content';
import { LEVEL_KEYS, type LevelKey } from '@/content/types';
import { t } from '@/lib/i18n';
import { getPrefs } from '@/lib/prefs';
import { pageLabel } from '@/lib/statements';

/** Lernziele pro Modul mit Grammatik, Wortschatz, Kommunikation, Praxis (legacy: pageLO). */
export default function LearningGoalsPage({ searchParams }: { searchParams: { level?: string } }) {
  const { lang } = getPrefs();
  const levelKey: LevelKey = LEVEL_KEYS.includes(searchParams.level as LevelKey)
    ? (searchParams.level as LevelKey)
    : 'A1';
  const level = content.curriculum.levels.find((l) => l.key === levelKey)!;
  const lessons = content.lessonsByLevel[levelKey];

  return (
    <>
      <PageHeader
        page="lo"
        lang={lang}
        label={pageLabel('lo')}
        intro={
          <span className="de-content block">
            Messbare Ziele pro Modul, abgeleitet aus den bestehenden Themen, Sprechsituationen und
            Wortfeldern.
          </span>
        }
      />
      <nav
        aria-label={t(lang, 'level')}
        className="mb-4 grid grid-cols-4 gap-1 rounded-xl border border-line bg-panel p-1"
      >
        {LEVEL_KEYS.map((k) => (
          <Link
            key={k}
            href={`/lernziele?level=${k}`}
            aria-current={k === levelKey ? 'page' : undefined}
            className="flex min-h-11 items-center justify-center rounded-lg font-semibold aria-[current=page]:bg-anth aria-[current=page]:text-anth-ink"
          >
            {k}
          </Link>
        ))}
      </nav>
      <div className="space-y-3">
        {level.modules.map((m, i) => {
          const words = [...new Set(m.grammar.map((g) => g.wortschatz).filter(Boolean))];
          const praxis = lessons
            .filter(
              (l) =>
                l.moduleId === m.id &&
                (l.areas.includes('Deutschland') || l.areas.includes('Bewerbung')),
            )
            .map((l) => l.title);
          return (
            <details key={m.id} id={m.id} className="card scroll-mt-20" open={i === 0}>
              <summary className="de-content flex min-h-11 cursor-pointer items-center font-bold">
                {t(lang, 'module')} {m.number}: {m.title}
              </summary>
              <p className="mt-2 text-sm text-muted">{t(lang, 'canDo')}</p>
              <ul className="de-content list-disc ps-5">
                {(content.objectives[m.id] ?? []).map((o) => (
                  <li key={o}>{o}</li>
                ))}
              </ul>
              <dl className="de-content mt-3 grid gap-x-4 gap-y-2 sm:grid-cols-[10rem_1fr]">
                <dt className="font-semibold">Grammatik</dt>
                <dd>
                  {m.grammar.map((g) => (
                    <Link
                      key={g.lessonId}
                      href={`/stunde/${g.lessonId}`}
                      className="block underline-offset-2 hover:underline"
                    >
                      {g.title}
                    </Link>
                  ))}
                </dd>
                <dt className="font-semibold">Wortschatz</dt>
                <dd>{words.join(', ') || '–'}</dd>
                <dt className="font-semibold">Kommunikation</dt>
                <dd>
                  {m.speaking.thema}: {m.speaking.situation}
                </dd>
                <dt className="font-semibold">Praxis</dt>
                <dd>{praxis.length ? praxis.join(' · ') : '–'}</dd>
              </dl>
            </details>
          );
        })}
      </div>
    </>
  );
}
