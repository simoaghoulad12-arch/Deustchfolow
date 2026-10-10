'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import Link from 'next/link';
import { DNA_LABELS, MISTAKE_CATEGORY_LABELS } from '@deutschflow/types';
import { cn } from '@deutschflow/ui';
import type { ChatTurn, MissionCompletion, MissionRun } from '@/lib/api/live';
import { Badge, ButtonLink, ProgressBar, Ring, buttonClass } from '@/components/live/ui';
import { AnswerBox } from '@/components/live/answer-box';
import { speak } from '@/components/live/use-speech';
import { finishRunAction, hintAction, sendTurnAction } from '../../actions';

export function MissionChat({ run, languageCode }: { run: MissionRun; languageCode: string }) {
  const [turns, setTurns] = useState<ChatTurn[]>(run.turns);
  const [goals, setGoals] = useState(run.goals);
  const [hintsUsed, setHintsUsed] = useState(run.hintsUsed);
  const [completion, setCompletion] = useState<MissionCompletion | null>(null);
  const [ended, setEnded] = useState(run.status !== 'ACTIVE');
  const [error, setError] = useState<string | null>(null);
  const [autoSpeak, setAutoSpeak] = useState(false);
  const [showPhrases, setShowPhrases] = useState(false);
  const [pending, startTransition] = useTransition();
  const bottom = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [turns.length, completion]);

  const met = goals.filter((g) => g.met).length;
  const character = run.mission.character;

  const send = (text: string, meta: { spoken: boolean; speechConfidence?: number; responseMs: number }) =>
    startTransition(async () => {
      setError(null);
      const optimistic: ChatTurn = { id: `tmp-${Date.now()}`, role: 'user', content: text, createdAt: new Date().toISOString() };
      setTurns((t) => [...t, optimistic]);
      const res = await sendTurnAction(run.id, { text, responseMs: meta.responseMs, spoken: meta.spoken, speechConfidence: meta.speechConfidence });
      if (!res.ok) {
        setTurns((t) => t.filter((x) => x.id !== optimistic.id));
        setError(res.message);
        return;
      }
      setTurns((t) => [...t.filter((x) => x.id !== optimistic.id), res.data.userTurn, res.data.reply]);
      setGoals((g) => g.map((goal) => ({ ...goal, met: res.data.criteriaMet.includes(goal.id) })));
      if (autoSpeak) speak(res.data.reply.content, languageCode);
      if (res.data.completion) {
        setCompletion(res.data.completion);
        setEnded(true);
      }
    });

  const askHint = () =>
    startTransition(async () => {
      setError(null);
      const res = await hintAction(run.id);
      if (!res.ok) return setError(res.message);
      setHintsUsed((h) => h + 1);
      setTurns((t) => [...t, res.data.turn]);
    });

  const finish = () =>
    startTransition(async () => {
      setError(null);
      const res = await finishRunAction(run.id);
      if (!res.ok) return setError(res.message);
      setEnded(true);
      if (res.data.completion) setCompletion(res.data.completion);
    });

  return (
    <div className="-mx-4 -mt-6 flex min-h-[calc(100vh-3.5rem)] flex-col sm:-mx-6 lg:-mt-8 lg:flex-row">
      {/* Scenario & goals */}
      <aside className="border-b border-border bg-white px-4 py-4 sm:px-6 lg:sticky lg:top-14 lg:h-[calc(100vh-3.5rem)] lg:w-80 lg:shrink-0 lg:overflow-y-auto lg:border-b-0 lg:border-r">
        <Link href={`/missions/${run.mission.slug}`} className="text-xs font-medium text-indigo-600 hover:underline">
          ← Mission details
        </Link>
        <div className="mt-3 flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-3xl" aria-hidden>
            {character?.avatar ?? run.mission.environment?.icon}
          </span>
          <div className="min-w-0">
            <h1 className="truncate font-bold leading-tight">{run.mission.title}</h1>
            {character && (
              <p className="truncate text-xs text-muted-foreground">
                {character.name} · {character.role}
              </p>
            )}
          </div>
        </div>
        <p className="mt-3 text-sm text-slate-600">{run.mission.scenario}</p>
        {run.state.twist && (
          <p className="mt-2 rounded-xl bg-fuchsia-50 p-3 text-sm text-fuchsia-900">
            🌀 <span className="font-semibold">{run.state.twist.title}</span>
          </p>
        )}
        {run.state.choice && <p className="mt-2 rounded-xl bg-indigo-50 p-3 text-sm text-indigo-900">📖 Your choice: {run.state.choice.label}</p>}
        {run.state.stance && <p className="mt-2 rounded-xl bg-slate-100 p-3 text-sm">⚖️ They argue: {run.state.stance}</p>}

        <div className="mt-4">
          <div className="mb-1 flex justify-between text-xs font-medium">
            <span>Goals</span>
            <span>
              {met}/{goals.length}
            </span>
          </div>
          <ProgressBar value={goals.length ? (met / goals.length) * 100 : 0} tone="green" label="Mission goals" />
          <ul className="mt-3 space-y-1.5">
            {goals.map((g) => (
              <li key={g.id} className={cn('flex items-start gap-2 text-sm', g.met ? 'text-emerald-700' : 'text-slate-600')}>
                <span aria-hidden>{g.met ? '✅' : '⬜'}</span>
                <span className={g.met ? 'line-through decoration-emerald-300' : ''}>{g.description}</span>
                <span className="sr-only">{g.met ? '(done)' : '(open)'}</span>
              </li>
            ))}
          </ul>
        </div>

        <button type="button" className="mt-4 text-sm font-medium text-indigo-600 lg:hidden" onClick={() => setShowPhrases((s) => !s)} aria-expanded={showPhrases}>
          {showPhrases ? 'Hide' : 'Show'} useful phrases
        </button>
        <div className={cn('mt-4', showPhrases ? 'block' : 'hidden lg:block')}>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Useful phrases</p>
          <ul className="space-y-1.5">
            {run.mission.keyPhrases.map((p) => (
              <li key={p.term}>
                <button type="button" onClick={() => speak(p.term, languageCode)} className="w-full rounded-lg px-2 py-1 text-left text-sm hover:bg-slate-100" title="Listen">
                  <span className="font-medium" lang={languageCode}>
                    {p.term}
                  </span>
                  <span className="block text-xs text-muted-foreground">{p.translation}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </aside>

      {/* Conversation */}
      <section className="flex min-w-0 flex-1 flex-col bg-slate-50/70" aria-label="Conversation">
        <div className="flex items-center justify-between gap-2 border-b border-border bg-white/80 px-4 py-2 backdrop-blur sm:px-6">
          <label className="flex items-center gap-2 text-xs text-slate-600">
            <input type="checkbox" checked={autoSpeak} onChange={(e) => setAutoSpeak(e.target.checked)} className="h-4 w-4 rounded border-slate-300" />
            Read replies aloud
          </label>
          {!ended && (
            <div className="flex gap-2">
              <button type="button" onClick={askHint} disabled={pending || hintsUsed >= run.maxHintLevel + 2} className={buttonClass('secondary', 'sm')}>
                💡 Hint
              </button>
              <button type="button" onClick={finish} disabled={pending} className={buttonClass('ghost', 'sm')}>
                End
              </button>
            </div>
          )}
        </div>

        <ol className="flex-1 space-y-4 overflow-y-auto px-4 py-6 sm:px-6" aria-live="polite">
          {turns.map((t) => (
            <Turn key={t.id} turn={t} avatar={character?.avatar} languageCode={languageCode} />
          ))}
          {pending && !ended && (
            <li className="flex items-center gap-2 text-sm text-slate-500">
              <span className="text-2xl" aria-hidden>
                {character?.avatar}
              </span>
              <span className="flex gap-1" aria-label={`${character?.name ?? 'Partner'} is typing`}>
                <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:120ms]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:240ms]" />
              </span>
            </li>
          )}
          {completion && <Completion completion={completion} />}
          {ended && !completion && (
            <li className="rounded-2xl border border-border bg-white p-5 text-center">
              <p className="font-semibold">This conversation has ended.</p>
              <div className="mt-3 flex justify-center gap-2">
                <ButtonLink href={`/missions/${run.mission.slug}`}>Try again</ButtonLink>
                <ButtonLink href="/world" variant="secondary">
                  Back to world
                </ButtonLink>
              </div>
            </li>
          )}
          <div ref={bottom} />
        </ol>

        {!ended && (
          <div className="sticky bottom-16 border-t border-border bg-white/95 px-4 py-3 backdrop-blur sm:px-6 lg:bottom-0">
            {error && (
              <p className="mb-2 text-sm text-rose-600" role="alert">
                {error}
              </p>
            )}
            <AnswerBox languageCode={languageCode} busy={pending} onSubmit={send} placeholder={`Answer ${character?.name ?? ''} in the language you’re learning…`} resetKey={turns.length} autoFocus />
          </div>
        )}
      </section>
    </div>
  );
}

function Turn({ turn, avatar, languageCode }: { turn: ChatTurn; avatar?: string; languageCode: string }) {
  if (turn.hint) {
    return (
      <li className="mx-auto max-w-lg rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        <p className="mb-0.5 text-xs font-semibold uppercase tracking-wide">💡 Hint {turn.hint.level}</p>
        {turn.hint.text}
      </li>
    );
  }
  if (turn.role === 'assistant') {
    return (
      <li className="flex max-w-[85%] items-end gap-2 sm:max-w-[75%]">
        <span className="text-2xl" aria-hidden>
          {avatar ?? '🙂'}
        </span>
        <div className="rounded-2xl rounded-bl-md bg-white px-4 py-3 shadow-sm">
          <p lang={languageCode}>{turn.content}</p>
          <button type="button" onClick={() => speak(turn.content, languageCode)} className="mt-1 text-xs text-slate-400 hover:text-indigo-600" aria-label="Listen to this message">
            🔊 Listen
          </button>
        </div>
      </li>
    );
  }
  return (
    <li className="ml-auto flex max-w-[85%] flex-col items-end gap-1.5 sm:max-w-[75%]">
      <div className="rounded-2xl rounded-br-md bg-indigo-600 px-4 py-3 text-white shadow-sm">
        <p lang={languageCode}>{turn.content}</p>
      </div>
      {turn.correction && (
        <div className="w-full rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm">
          <p className="text-xs font-semibold text-emerald-800">
            ✨ More natural · {MISTAKE_CATEGORY_LABELS[turn.correction.category]}
          </p>
          <p className="font-medium text-emerald-900" lang={languageCode}>
            {turn.correction.better}
          </p>
          <p className="text-xs text-emerald-800">{turn.correction.explanation}</p>
        </div>
      )}
    </li>
  );
}

function Completion({ completion }: { completion: MissionCompletion }) {
  return (
    <li className="overflow-hidden rounded-3xl border border-indigo-100 bg-white shadow-lg">
      <div className="bg-gradient-to-br from-indigo-600 to-violet-600 p-6 text-center text-white">
        <p className="text-4xl" aria-hidden>
          🎉
        </p>
        <h2 className="mt-2 text-2xl font-bold">Mission complete!</h2>
        <div className="mt-4 flex items-center justify-center gap-6">
          <div className="rounded-full bg-white p-1 text-slate-900">
            <Ring value={completion.score} size={76} label={`Score ${completion.score}`} />
          </div>
          <div className="text-left">
            <p className="text-3xl font-bold">+{completion.xpAwarded} XP</p>
            <p className="text-sm text-white/80">
              {completion.totalXp.toLocaleString('en')} total · 🔥 {completion.streak}-day streak
            </p>
          </div>
        </div>
      </div>
      <div className="space-y-5 p-6">
        {completion.newAchievements.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {completion.newAchievements.map((a) => (
              <Badge key={a.code} tone="violet" className="text-sm">
                {a.icon} {a.title}
              </Badge>
            ))}
          </div>
        )}
        <div>
          <p className="mb-2 text-sm font-semibold">What went well</p>
          <ul className="space-y-1 text-sm">
            {completion.highlights.map((h) => (
              <li key={h}>✅ {h}</li>
            ))}
          </ul>
        </div>
        {completion.practiceNext.length > 0 && (
          <div>
            <p className="mb-2 text-sm font-semibold">Practise next</p>
            <ul className="space-y-1 text-sm text-slate-700">
              {completion.practiceNext.map((p) => (
                <li key={p}>🎯 {p}</li>
              ))}
            </ul>
          </div>
        )}
        {completion.dnaChanges.length > 0 && (
          <div>
            <p className="mb-2 text-sm font-semibold">Language DNA</p>
            <ul className="grid gap-2 sm:grid-cols-2">
              {completion.dnaChanges.slice(0, 6).map((c) => (
                <li key={c.dimension} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-1.5 text-sm">
                  <span>{DNA_LABELS[c.dimension]}</span>
                  <span className={c.after >= c.before ? 'font-semibold text-emerald-600' : 'font-semibold text-amber-600'}>
                    {c.before} → {c.after}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="flex flex-col gap-2 sm:flex-row">
          {completion.nextMission && (
            <ButtonLink href={`/missions/${completion.nextMission.slug}`} size="lg" className="flex-1">
              Next: {completion.nextMission.title} →
            </ButtonLink>
          )}
          <ButtonLink href="/home" variant="secondary" size="lg">
            Dashboard
          </ButtonLink>
        </div>
      </div>
    </li>
  );
}
