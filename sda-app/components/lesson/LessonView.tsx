'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { resetLesson, setItemsDone } from '@/app/actions/lesson';
import type { Bilingual, RoleKey } from '@/content/types';
import { pick, t, type Lang } from '@/lib/i18n';
import { minuteRange } from '@/lib/minutes';

export interface ViewStep {
  id: string;
  zeit: string;
  role: RoleKey;
  text: Bilingual;
  group: Bilingual;
}

export type Mode = 'skript' | 'schritte' | 'liste';

interface Props {
  lessonId: string;
  lang: Lang;
  steps: ViewStep[];
  initialDone: string[];
  initialMode: Mode;
  hasScript: boolean;
  /** Länge der Stunde in Minuten (0 = kein Timer) */
  span: number;
  roles: Record<RoleKey, Bilingual>;
  next?: { id: string; title: string };
  /** Vorlese-Skript, auf dem Server gerendert */
  script?: React.ReactNode;
}

const TIMER_KEY = 'sda-timer';

/** Stunden-Ansicht wie legacy: Skript zum Vorlesen, Schritte (eine Aufgabe nach der anderen) und Liste, mit Timer. */
export function LessonView(props: Props) {
  const { lessonId, lang, steps, hasScript, span, roles } = props;
  const [mode, setMode] = useState<Mode>(
    hasScript ? props.initialMode : props.initialMode === 'skript' ? 'schritte' : props.initialMode,
  );
  const [done, setDone] = useState(() => new Set(props.initialDone));
  const [index, setIndex] = useState<number | null>(null);
  const timer = useTimer(lessonId);

  // Speicherstatus sichtbar machen, damit niemand die Seite verlässt, bevor ein Häkchen gespeichert ist.
  const [saving, setSaving] = useState(0);
  const [saveState, setSaveState] = useState<'' | 'ok' | 'error'>('');

  const track = (save: Promise<void>) => {
    setSaving((n) => n + 1);
    save
      .then(() => setSaveState((st) => (st === 'error' ? st : 'ok')))
      .catch(() => setSaveState('error'))
      .finally(() => setSaving((n) => n - 1));
  };

  const toggle = (ids: string[], value: boolean) => {
    setDone((prev) => {
      const s = new Set(prev);
      for (const id of ids) value ? s.add(id) : s.delete(id);
      return s;
    });
    track(setItemsDone(lessonId, ids, value));
  };

  const doneCount = steps.filter((s) => done.has(s.id)).length;
  const firstUndone = (from = 0) => {
    for (let i = from; i < steps.length; i++) if (!done.has(steps[i]!.id)) return i;
    for (let i = 0; i < from; i++) if (!done.has(steps[i]!.id)) return i;
    return -1;
  };
  const current = index !== null && index >= 0 && index < steps.length ? index : firstUndone();

  const changeMode = (m: Mode) => {
    setMode(m);
    const url = new URL(window.location.href);
    url.searchParams.set('modus', m);
    window.history.replaceState(null, '', url);
  };

  const modes: Mode[] = hasScript ? ['skript', 'schritte', 'liste'] : ['schritte', 'liste'];
  const modeLabel: Record<Mode, string> = {
    skript: t(lang, 'modeScript'),
    schritte: t(lang, 'modeSteps'),
    liste: t(lang, 'modeList'),
  };

  return (
    <div>
      {span > 0 && <TimerBox timer={timer} span={span} steps={steps} lang={lang} />}

      <div
        role="tablist"
        aria-label="Ansicht"
        className="mb-4 grid gap-1 rounded-xl border border-line bg-panel p-1"
        style={{ gridTemplateColumns: `repeat(${modes.length}, 1fr)` }}
      >
        {modes.map((m) => (
          <button
            key={m}
            type="button"
            role="tab"
            aria-selected={mode === m}
            onClick={() => changeMode(m)}
            className="min-h-11 rounded-lg font-medium aria-selected:bg-anth aria-selected:text-anth-ink"
          >
            {modeLabel[m]}
          </button>
        ))}
      </div>

      {mode === 'skript' && props.script}

      {mode !== 'skript' && (
        <>
          <div className="mb-3">
            <div
              className="h-2 overflow-hidden rounded-full bg-line"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={steps.length}
              aria-valuenow={doneCount}
              aria-label="Fortschritt der Stunde"
            >
              <div
                className={`h-full ${doneCount === steps.length && steps.length ? 'bg-ok' : 'bg-red'}`}
                style={{ width: `${steps.length ? (100 * doneCount) / steps.length : 0}%` }}
              />
            </div>
            <div className="mt-1 flex justify-between gap-2 text-sm text-muted">
              <span>
                {doneCount} / {steps.length}
              </span>
              <span role="status" className={saveState === 'error' && !saving ? 'text-red' : ''}>
                {saving > 0
                  ? t(lang, 'saving')
                  : saveState === 'error'
                    ? t(lang, 'saveFailed')
                    : saveState === 'ok'
                      ? t(lang, 'saved')
                      : ''}
              </span>
            </div>
          </div>

          {!steps.length && <p className="card">{t(lang, 'nothingForYou')}</p>}

          {mode === 'schritte' && steps.length > 0 && (
            <FocusStep
              steps={steps}
              index={current}
              done={done}
              lang={lang}
              roles={roles}
              next={props.next}
              onToggle={(id, v) => {
                toggle([id], v);
                if (v) setIndex(firstUndoneAfter(steps, new Set([...done, id]), current + 1));
              }}
              onMove={(i) => setIndex(Math.max(0, Math.min(steps.length - 1, i)))}
            />
          )}

          {mode === 'liste' && steps.length > 0 && (
            <ChecklistList
              steps={steps}
              done={done}
              lang={lang}
              roles={roles}
              nowMinute={timer.minute}
              onToggle={(id, v) => toggle([id], v)}
            />
          )}

          {steps.length > 0 && (
            <button
              type="button"
              className="btn-secondary mt-6"
              onClick={() => {
                if (!window.confirm(t(lang, 'resetConfirm'))) return;
                setDone(new Set());
                setIndex(null);
                track(resetLesson(lessonId));
              }}
            >
              {t(lang, 'reset')}
            </button>
          )}
        </>
      )}
    </div>
  );
}

function firstUndoneAfter(steps: ViewStep[], done: Set<string>, from: number): number {
  for (let i = from; i < steps.length; i++) if (!done.has(steps[i]!.id)) return i;
  for (let i = 0; i < from; i++) if (!done.has(steps[i]!.id)) return i;
  return -1;
}

function RoleBadge({
  role,
  roles,
  lang,
}: {
  role: RoleKey;
  roles: Record<RoleKey, Bilingual>;
  lang: Lang;
}) {
  return (
    <span className="rounded border border-line px-1.5 text-xs font-semibold text-muted">
      {pick(lang, roles[role])}
    </span>
  );
}

function FocusStep(props: {
  steps: ViewStep[];
  index: number;
  done: Set<string>;
  lang: Lang;
  roles: Record<RoleKey, Bilingual>;
  next?: { id: string; title: string };
  onToggle: (id: string, value: boolean) => void;
  onMove: (i: number) => void;
}) {
  const { steps, index, done, lang, roles } = props;
  if (index === -1) {
    return (
      <section className="card border-ok">
        <h2 className="text-xl font-bold">✓ {t(lang, 'lessonComplete')}</h2>
        <p className="mb-3 text-muted">{t(lang, 'allDone')}</p>
        {props.next && (
          <Link href={`/stunde/${props.next.id}`} className="btn-primary">
            {t(lang, 'nextLesson')}: {props.next.title}
          </Link>
        )}
      </section>
    );
  }
  const step = steps[index]!;
  const isDone = done.has(step.id);
  const upcoming = steps
    .slice(index + 1)
    .filter((s) => !done.has(s.id))
    .slice(0, 3);
  return (
    <>
      <p className="mb-1 text-sm text-muted">
        {t(lang, 'step')} {index + 1} / {steps.length}
      </p>
      <section className={`card ${isDone ? 'border-ok' : ''}`} aria-live="polite">
        <div className="mb-2 flex flex-wrap items-center gap-2 text-sm">
          <span dir="ltr" className="rounded bg-anth px-2 py-0.5 font-semibold text-anth-ink">
            {step.zeit}
          </span>
          <RoleBadge role={step.role} roles={roles} lang={lang} />
          <span className="text-muted">{pick(lang, step.group)}</span>
        </div>
        <p className="text-xl font-medium leading-snug" dir="auto">
          {pick(lang, step.text)}
        </p>
        {lang === 'de' && step.text.ar && (
          <p lang="ar" dir="rtl" className="mt-2 text-muted">
            {step.text.ar}
          </p>
        )}
        <div className="mt-4 grid grid-cols-[auto_1fr_auto] gap-2">
          <button
            type="button"
            className="btn-secondary min-w-11"
            onClick={() => props.onMove(index - 1)}
            aria-label={t(lang, 'prev')}
          >
            <span aria-hidden="true" className="rtl:rotate-180">
              ‹
            </span>
          </button>
          <button
            type="button"
            className={isDone ? 'btn-secondary' : 'btn-primary'}
            onClick={() => props.onToggle(step.id, !isDone)}
          >
            {isDone ? t(lang, 'undo') : `✓ ${t(lang, 'done')}`}
          </button>
          <button
            type="button"
            className="btn-secondary min-w-11"
            onClick={() => props.onMove(index + 1)}
            aria-label={t(lang, 'next')}
          >
            <span aria-hidden="true" className="rtl:rotate-180">
              ›
            </span>
          </button>
        </div>
      </section>
      {upcoming.length > 0 && (
        <>
          <p className="mb-1 mt-3 text-sm text-muted">{t(lang, 'after')}</p>
          <ul className="space-y-1 text-sm">
            {upcoming.map((u) => (
              <li key={u.id} className="text-muted">
                <span dir="ltr" className="font-semibold">
                  {u.zeit}
                </span>{' '}
                · {pick(lang, u.text)}
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  );
}

function ChecklistList(props: {
  steps: ViewStep[];
  done: Set<string>;
  lang: Lang;
  roles: Record<RoleKey, Bilingual>;
  nowMinute: number | null;
  onToggle: (id: string, value: boolean) => void;
}) {
  const { steps, done, lang, roles, nowMinute } = props;
  const groups = useMemo(() => {
    const out: { group: Bilingual; items: ViewStep[] }[] = [];
    for (const s of steps) {
      const last = out[out.length - 1];
      if (last && last.group.de === s.group.de) last.items.push(s);
      else out.push({ group: s.group, items: [s] });
    }
    return out;
  }, [steps]);
  return (
    <div className="space-y-4">
      {groups.map((g, i) => (
        <section key={i}>
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">
            {pick(lang, g.group)}
          </h2>
          <ul className="space-y-2">
            {g.items.map((s) => {
              const r = minuteRange(s.zeit);
              const isNow =
                nowMinute !== null && r !== null && nowMinute >= r[0] && nowMinute < r[1];
              return (
                <li key={s.id}>
                  <label
                    className={`card flex min-h-11 cursor-pointer gap-3 ${isNow ? 'border-gold bg-gold-soft' : ''} ${done.has(s.id) ? 'opacity-70' : ''}`}
                  >
                    <input
                      type="checkbox"
                      checked={done.has(s.id)}
                      onChange={(e) => props.onToggle(s.id, e.target.checked)}
                      className="mt-1 h-5 w-5 shrink-0 accent-[var(--red)]"
                    />
                    <span className="min-w-0">
                      <span className="mb-1 flex flex-wrap items-center gap-2 text-xs">
                        <span dir="ltr" className="font-semibold">
                          {s.zeit}
                        </span>
                        <RoleBadge role={s.role} roles={roles} lang={lang} />
                      </span>
                      <span className={`block ${done.has(s.id) ? 'line-through' : ''}`} dir="auto">
                        {pick(lang, s.text)}
                      </span>
                      {lang === 'de' && s.text.ar && (
                        <span lang="ar" dir="rtl" className="block text-sm text-muted">
                          {s.text.ar}
                        </span>
                      )}
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}

interface Timer {
  minute: number | null;
  start: () => void;
  stop: () => void;
}

/** Stunden-Timer: Startzeit pro Stunde im Browser (wie legacy), Minute wird alle 15 s aktualisiert. */
function useTimer(lessonId: string): Timer {
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(TIMER_KEY) ?? 'null') as {
        id: string;
        at: number;
      } | null;
      if (saved?.id === lessonId) setStartedAt(saved.at);
    } catch {
      /* Speicher nicht verfügbar */
    }
  }, [lessonId]);
  useEffect(() => {
    if (startedAt === null) return;
    setNow(Date.now());
    const id = window.setInterval(() => setNow(Date.now()), 15_000);
    return () => window.clearInterval(id);
  }, [startedAt]);
  return {
    minute: startedAt === null ? null : Math.max(0, Math.floor((now - startedAt) / 60_000)),
    start: () => {
      const at = Date.now();
      setStartedAt(at);
      try {
        localStorage.setItem(TIMER_KEY, JSON.stringify({ id: lessonId, at }));
      } catch {
        /* ohne Speicher läuft der Timer nur bis zum Neuladen */
      }
    },
    stop: () => {
      setStartedAt(null);
      try {
        localStorage.removeItem(TIMER_KEY);
      } catch {
        /* egal */
      }
    },
  };
}

function TimerBox({
  timer,
  span,
  steps,
  lang,
}: {
  timer: Timer;
  span: number;
  steps: ViewStep[];
  lang: Lang;
}) {
  if (timer.minute === null) {
    return (
      <button type="button" className="btn-secondary mb-4 w-full" onClick={timer.start}>
        ▶ {t(lang, 'timerStart')}
      </button>
    );
  }
  const min = timer.minute;
  const now: ViewStep[] = [];
  let next: { at: number; step: ViewStep } | null = null;
  for (const s of steps) {
    const r = minuteRange(s.zeit);
    if (!r) continue;
    if (min >= r[0] && min < r[1]) now.push(s);
    else if (r[0] > min && (!next || r[0] < next.at)) next = { at: r[0], step: s };
  }
  return (
    <section
      className="card mb-4 border-gold bg-gold-soft"
      aria-live="polite"
      aria-label="Stunden-Timer"
    >
      <p>
        {t(lang, 'minute')} <b>{min}</b> / {span}
        {min < span ? ` · ${span - min} Min.` : ''}
      </p>
      {now.length > 0 ? (
        <ul className="mt-1 text-lg font-semibold">
          {now.slice(0, 3).map((s) => (
            <li key={s.id} dir="auto">
              {pick(lang, s.text)}
            </li>
          ))}
        </ul>
      ) : (
        min >= span && <p className="mt-1 text-lg font-semibold">{t(lang, 'lessonOver')}</p>
      )}
      {next && (
        <p className="mt-1 text-sm">
          {t(lang, 'fromMinute')} {next.at}: {pick(lang, next.step.text)}
        </p>
      )}
      <button type="button" className="btn-secondary mt-2" onClick={timer.stop}>
        {t(lang, 'timerStop')}
      </button>
    </section>
  );
}
