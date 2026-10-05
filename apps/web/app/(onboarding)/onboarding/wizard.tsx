'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { DAILY_MINUTES_OPTIONS, LEARNING_GOALS, LEARNING_STYLES, NATIVE_LANGUAGES } from '@deutschflow/types';
import { cn } from '@deutschflow/ui';
import type { Language } from '@/lib/api/live';
import { buttonClass } from '@/components/live/ui';
import { completeOnboardingAction } from '../actions';

const LEVELS = [
  { value: 'A1', label: 'A1 · Beginner', hint: 'I know a few words or nothing at all.' },
  { value: 'A2', label: 'A2 · Elementary', hint: 'I can handle simple everyday situations.' },
  { value: 'B1', label: 'B1 · Intermediate', hint: 'I can talk about most familiar topics.' },
  { value: 'B2', label: 'B2 · Upper intermediate', hint: 'I can discuss and argue fluently.' },
  { value: 'unknown', label: 'I don’t know', hint: 'Take a short adaptive test (about 4 minutes).' },
] as const;

const STEPS = ['Language', 'Native language', 'Level', 'Goals', 'Daily time', 'Learning style'];

function Option({ selected, onClick, children, className }: { selected: boolean; onClick: () => void; children: React.ReactNode; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        'rounded-2xl border bg-white p-4 text-left shadow-sm transition hover:border-indigo-300',
        selected ? 'border-indigo-500 ring-2 ring-indigo-100' : 'border-border',
        className,
      )}
    >
      {children}
    </button>
  );
}

export function OnboardingWizard({ languages, initialName }: { languages: Language[]; initialName: string }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [targetLanguage, setTarget] = useState(languages[0]?.code ?? 'de');
  const [nativeLanguage, setNative] = useState('en');
  const [level, setLevel] = useState<(typeof LEVELS)[number]['value'] | null>(null);
  const [goals, setGoals] = useState<string[]>([]);
  const [dailyMinutes, setMinutes] = useState<number>(10);
  const [styles, setStyles] = useState<string[]>([]);
  const [personalGoal, setPersonalGoal] = useState('');
  const [displayName, setDisplayName] = useState(initialName);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const toggle = (list: string[], value: string, set: (v: string[]) => void) =>
    set(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);

  const canContinue = [Boolean(targetLanguage), Boolean(nativeLanguage) && nativeLanguage !== targetLanguage, level !== null, goals.length > 0, dailyMinutes > 0, styles.length > 0][step];
  const languageName = languages.find((l) => l.code === targetLanguage)?.name ?? 'your language';

  const submit = () =>
    startTransition(async () => {
      setError(null);
      const res = await completeOnboardingAction({
        targetLanguage,
        nativeLanguage,
        level: level ?? 'unknown',
        goals,
        dailyMinutes,
        learningStyles: styles,
        personalGoal: personalGoal.trim(),
        displayName: displayName.trim() || undefined,
      });
      if (!res.ok) return setError(res.message);
      router.push(res.data.needsPlacement ? '/placement' : '/plan');
    });

  return (
    <div className="pt-4 sm:pt-10">
      <div className="mb-8">
        <div className="mb-2 flex justify-between text-xs font-medium text-muted-foreground">
          <span>
            Step {step + 1} of {STEPS.length}
          </span>
          <span>{STEPS[step]}</span>
        </div>
        <div className="flex gap-1.5" aria-hidden>
          {STEPS.map((s, i) => (
            <div key={s} className={cn('h-1.5 flex-1 rounded-full', i <= step ? 'bg-indigo-500' : 'bg-slate-200')} />
          ))}
        </div>
      </div>

      <div className="min-h-[380px]">
        {step === 0 && (
          <section aria-labelledby="s0">
            <h1 id="s0" className="text-2xl font-bold tracking-tight sm:text-3xl">
              Which language do you want to live?
            </h1>
            <p className="mt-1 text-muted-foreground">You can add more languages later.</p>
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {languages.map((l) => (
                <Option key={l.code} selected={targetLanguage === l.code} onClick={() => setTarget(l.code)}>
                  <span className="text-3xl" aria-hidden>
                    {l.flag}
                  </span>
                  <span className="mt-2 block font-semibold">{l.name}</span>
                  <span className="text-sm text-muted-foreground">{l.nativeName}</span>
                </Option>
              ))}
            </div>
          </section>
        )}

        {step === 1 && (
          <section aria-labelledby="s1">
            <h1 id="s1" className="text-2xl font-bold tracking-tight sm:text-3xl">
              What is your native language?
            </h1>
            <p className="mt-1 text-muted-foreground">Explanations and translations adapt to it.</p>
            <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {NATIVE_LANGUAGES.filter((l) => l.code !== targetLanguage).map((l) => (
                <Option key={l.code} selected={nativeLanguage === l.code} onClick={() => setNative(l.code)} className="p-3">
                  <span className="font-medium">{l.name}</span>
                </Option>
              ))}
            </div>
            <label className="mt-6 block max-w-sm text-sm font-medium">
              What should we call you? <span className="font-normal text-muted-foreground">(optional)</span>
              <input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                maxLength={60}
                className="mt-1 h-11 w-full rounded-xl border border-border bg-white px-3 text-base outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                autoComplete="given-name"
              />
            </label>
          </section>
        )}

        {step === 2 && (
          <section aria-labelledby="s2">
            <h1 id="s2" className="text-2xl font-bold tracking-tight sm:text-3xl">
              How good is your {languageName}?
            </h1>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {LEVELS.map((l) => (
                <Option key={l.value} selected={level === l.value} onClick={() => setLevel(l.value)} className={l.value === 'unknown' ? 'sm:col-span-2' : ''}>
                  <span className="font-semibold">{l.label}</span>
                  <span className="block text-sm text-muted-foreground">{l.hint}</span>
                </Option>
              ))}
            </div>
          </section>
        )}

        {step === 3 && (
          <section aria-labelledby="s3">
            <h1 id="s3" className="text-2xl font-bold tracking-tight sm:text-3xl">
              Why are you learning {languageName}?
            </h1>
            <p className="mt-1 text-muted-foreground">Pick everything that applies.</p>
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {LEARNING_GOALS.map((g) => (
                <Option key={g.value} selected={goals.includes(g.value)} onClick={() => toggle(goals, g.value, setGoals)}>
                  <span className="font-medium">{g.label}</span>
                </Option>
              ))}
            </div>
            <label className="mt-6 block text-sm font-medium">
              Your personal goal <span className="font-normal text-muted-foreground">(optional)</span>
              <textarea
                value={personalGoal}
                onChange={(e) => setPersonalGoal(e.target.value)}
                maxLength={280}
                rows={3}
                placeholder="e.g. I want to work as a nurse in Germany in one year."
                className="mt-1 w-full rounded-xl border border-border bg-white p-3 text-base outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              />
            </label>
          </section>
        )}

        {step === 4 && (
          <section aria-labelledby="s4">
            <h1 id="s4" className="text-2xl font-bold tracking-tight sm:text-3xl">
              How much time do you have per day?
            </h1>
            <p className="mt-1 text-muted-foreground">Consistency beats intensity. You can change this any time.</p>
            <div className="mt-6 grid grid-cols-3 gap-3 sm:grid-cols-5">
              {DAILY_MINUTES_OPTIONS.map((m) => (
                <Option key={m} selected={dailyMinutes === m} onClick={() => setMinutes(m)} className="text-center">
                  <span className="block text-2xl font-bold">{m}</span>
                  <span className="text-sm text-muted-foreground">min</span>
                </Option>
              ))}
            </div>
          </section>
        )}

        {step === 5 && (
          <section aria-labelledby="s5">
            <h1 id="s5" className="text-2xl font-bold tracking-tight sm:text-3xl">
              How do you like to learn?
            </h1>
            <p className="mt-1 text-muted-foreground">Your plan puts more of this first.</p>
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {LEARNING_STYLES.map((s) => (
                <Option key={s.value} selected={styles.includes(s.value)} onClick={() => toggle(styles, s.value, setStyles)}>
                  <span className="font-medium">{s.label}</span>
                </Option>
              ))}
            </div>
          </section>
        )}
      </div>

      {error && (
        <p className="mt-4 text-sm text-rose-600" role="alert">
          {error}
        </p>
      )}
      <div className="mt-8 flex items-center justify-between">
        <button type="button" onClick={() => setStep((s) => Math.max(0, s - 1))} className={cn(buttonClass('ghost'), step === 0 && 'invisible')}>
          ← Back
        </button>
        {step < STEPS.length - 1 ? (
          <button type="button" disabled={!canContinue} onClick={() => setStep((s) => s + 1)} className={buttonClass('primary', 'lg')}>
            Continue
          </button>
        ) : (
          <button type="button" disabled={!canContinue || pending} onClick={submit} className={buttonClass('primary', 'lg')}>
            {pending ? 'Building your plan…' : level === 'unknown' ? 'Start the placement test' : 'Create my plan'}
          </button>
        )}
      </div>
    </div>
  );
}
