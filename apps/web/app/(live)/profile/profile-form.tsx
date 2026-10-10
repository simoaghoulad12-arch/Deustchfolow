'use client';

import { useState, useTransition } from 'react';
import { DAILY_MINUTES_OPTIONS, LEARNING_GOALS, LEARNING_STYLES, NATIVE_LANGUAGES } from '@deutschflow/types';
import { cn } from '@deutschflow/ui';
import type { Language, Me } from '@/lib/api/live';
import { Card, buttonClass } from '@/components/live/ui';
import { updateProfileAction } from '../actions';

const field = 'mt-1 h-11 w-full rounded-xl border border-border bg-white px-3 text-base outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100';

function Chips({ options, value, onChange }: { options: readonly { value: string; label: string }[]; value: string[]; onChange: (v: string[]) => void }) {
  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {options.map((o) => {
        const on = value.includes(o.value);
        return (
          <button
            key={o.value}
            type="button"
            aria-pressed={on}
            onClick={() => onChange(on ? value.filter((v) => v !== o.value) : [...value, o.value])}
            className={cn('rounded-full border px-3 py-1.5 text-sm', on ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-border bg-white')}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

export function ProfileForm({ me, languages }: { me: Me; languages: Language[] }) {
  const [displayName, setDisplayName] = useState(me.displayName ?? '');
  const [targetLanguage, setTarget] = useState(me.targetLanguage?.code ?? 'de');
  const [nativeLanguage, setNative] = useState(me.nativeLanguage ?? 'en');
  const [level, setLevel] = useState(me.level ?? 'A1');
  const [goals, setGoals] = useState(me.goals);
  const [styles, setStyles] = useState(me.learningStyles);
  const [dailyMinutes, setMinutes] = useState(me.dailyMinutes ?? 10);
  const [personalGoal, setPersonalGoal] = useState(me.personalGoal ?? '');
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, start] = useTransition();

  return (
    <form
      className="space-y-6"
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          const res = await updateProfileAction({
            ...(displayName.trim() ? { displayName: displayName.trim() } : {}),
            targetLanguage,
            nativeLanguage,
            level,
            goals: goals.length ? goals : undefined,
            learningStyles: styles.length ? styles : undefined,
            dailyMinutes,
            personalGoal: personalGoal.trim(),
          });
          setMsg(res.ok ? { ok: true, text: 'Saved. Your plan has been updated.' } : { ok: false, text: res.message });
        });
      }}
    >
      <Card className="space-y-4">
        <label className="block text-sm font-medium">
          Name
          <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} maxLength={60} className={field} />
        </label>
        <div className="grid gap-4 sm:grid-cols-3">
          <label className="block text-sm font-medium">
            Learning
            <select value={targetLanguage} onChange={(e) => setTarget(e.target.value)} className={field}>
              {languages.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.flag} {l.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-medium">
            Native language
            <select value={nativeLanguage} onChange={(e) => setNative(e.target.value)} className={field}>
              {NATIVE_LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-medium">
            Level
            <select value={level} onChange={(e) => setLevel(e.target.value as typeof level)} className={field}>
              {['A1', 'A2', 'B1', 'B2'].map((l) => (
                <option key={l}>{l}</option>
              ))}
            </select>
          </label>
        </div>
        {targetLanguage !== me.targetLanguage?.code && <p className="text-xs text-muted-foreground">Switching language keeps your progress in each language separately.</p>}
      </Card>
      <Card className="space-y-4">
        <div>
          <p className="text-sm font-medium">Goals</p>
          <Chips options={LEARNING_GOALS} value={goals} onChange={setGoals} />
        </div>
        <div>
          <p className="text-sm font-medium">Learning style</p>
          <Chips options={LEARNING_STYLES} value={styles} onChange={setStyles} />
        </div>
        <label className="block text-sm font-medium">
          Daily time
          <select value={dailyMinutes} onChange={(e) => setMinutes(Number(e.target.value))} className={field}>
            {DAILY_MINUTES_OPTIONS.map((m) => (
              <option key={m} value={m}>
                {m} minutes
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm font-medium">
          Personal goal
          <textarea value={personalGoal} onChange={(e) => setPersonalGoal(e.target.value)} maxLength={280} rows={3} className="mt-1 w-full rounded-xl border border-border bg-white p-3 text-base outline-none focus:border-indigo-400" />
        </label>
      </Card>
      <div className="flex items-center gap-3">
        <button type="submit" disabled={pending} className={buttonClass('primary')}>
          {pending ? 'Saving…' : 'Save changes'}
        </button>
        {msg && (
          <p className={`text-sm ${msg.ok ? 'text-emerald-700' : 'text-rose-600'}`} role="status">
            {msg.text}
          </p>
        )}
      </div>
    </form>
  );
}
