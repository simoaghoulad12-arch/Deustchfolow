import { Icon, IconTile, Section, SectionHeader, SECTION_IDS, type IconName } from './primitives';

const FEEDBACK = [
  { label: 'Pronunciation', value: 82 },
  { label: 'Grammar', value: 76 },
  { label: 'Vocabulary', value: 71 },
  { label: 'Fluency', value: 79 },
];

export function SpeakingPractice() {
  return (
    <Section id={SECTION_IDS.speaking} labelledBy="speaking-title" tone="dark">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <div className="min-w-0">
          <SectionHeader
            id="speaking-title"
            eyebrow="Speaking Practice"
            title="Speak first. Get feedback that makes sense."
            lead="Answer out loud and receive a clear breakdown of what went well and what to work on — with the exact words to practise next."
            dark
          />
          <ul className="mt-8 space-y-3 text-slate-300">
            {['Pronunciation scored word by word', 'Grammar and vocabulary checked in context', 'Fluency and response speed tracked over time'].map((t) => (
              <li key={t} className="flex gap-3">
                <Icon name="check" className="mt-0.5 h-5 w-5 text-emerald-400" />
                <span className="min-w-0">{t}</span>
              </li>
            ))}
          </ul>
        </div>

        <figure className="min-w-0 rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8">
          <div className="flex flex-col items-center text-center">
            <div className="relative flex h-40 w-40 items-center justify-center" aria-hidden="true">
              <span className="absolute inset-0 rounded-full bg-indigo-500/15" />
              <span className="absolute inset-4 rounded-full bg-indigo-500/25" />
              <span className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-900/50">
                <Icon name="mic" className="h-10 w-10" />
              </span>
            </div>
            <p className="mt-4 text-2xl font-semibold tracking-tight">Speak naturally.</p>
            <p className="mt-1 text-sm text-slate-400">Example answer · French · B1</p>
          </div>
          <figcaption className="sr-only">Example speaking feedback breakdown</figcaption>
          <dl className="mt-8 grid gap-4 sm:grid-cols-2">
            {FEEDBACK.map((f) => (
              <div key={f.label} className="min-w-0 rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
                <div className="flex items-baseline justify-between gap-2">
                  <dt className="text-sm text-slate-300">{f.label}</dt>
                  <dd className="text-lg font-semibold">{f.value}%</dd>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10" aria-hidden="true">
                  <div className="h-full rounded-full bg-gradient-to-r from-indigo-400 to-fuchsia-400" style={{ width: `${f.value}%` }} />
                </div>
              </div>
            ))}
          </dl>
        </figure>
      </div>
    </Section>
  );
}

const DNA = [
  { label: 'Vocabulary', value: 74 },
  { label: 'Grammar', value: 68 },
  { label: 'Speaking', value: 61 },
  { label: 'Listening', value: 79 },
  { label: 'Reading', value: 83 },
  { label: 'Writing', value: 64 },
  { label: 'Pronunciation', value: 70 },
  { label: 'Fluency', value: 58 },
  { label: 'Accuracy', value: 72 },
  { label: 'Response speed', value: 55 },
];

const PERSONAL: { icon: IconName; title: string; text: string }[] = [
  { icon: 'target', title: 'Placement with per-skill results', text: 'Start with a placement test that reports each skill separately instead of a single score.' },
  { icon: 'memory', title: 'Spaced-repetition vocabulary', text: 'Words return just before you would forget them, drawn from the missions you actually played.' },
  { icon: 'book', title: 'Structured grammar curriculum', text: 'Grammar is taught in order, then practised inside conversations where it matters.' },
  { icon: 'calendar', title: 'Daily challenge', text: 'A short, focused task every day, picked from your weakest skills.' },
];

export function PersonalizedLearning() {
  return (
    <Section id={SECTION_IDS.personalized} labelledBy="personal-title">
      <div className="grid items-start gap-12 lg:grid-cols-[1fr_1.1fr]">
        <div className="min-w-0">
          <SectionHeader
            id="personal-title"
            eyebrow="Personalized Learning"
            title="Your Language DNA drives your plan"
            lead="Ten skills are measured from everything you do. Your coach uses that profile to decide what you practise next."
          />
          <ul className="mt-8 space-y-5">
            {PERSONAL.map((p) => (
              <li key={p.title} className="flex min-w-0 gap-4">
                <IconTile name={p.icon} />
                <div className="min-w-0">
                  <h3 className="font-semibold">{p.title}</h3>
                  <p className="mt-1 text-sm text-slate-600">{p.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <figure className="min-w-0 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <figcaption className="font-semibold">Language DNA · example profile</figcaption>
            <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700">German · A2</span>
          </div>
          <dl className="mt-6 grid gap-x-8 gap-y-4 sm:grid-cols-2">
            {DNA.map((d) => (
              <div key={d.label} className="min-w-0">
                <div className="flex justify-between gap-2 text-sm">
                  <dt className="text-slate-600">{d.label}</dt>
                  <dd className="font-semibold text-slate-900">{d.value}</dd>
                </div>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-100" aria-hidden="true">
                  <div
                    className={d.value >= 75 ? 'h-full rounded-full bg-emerald-500' : d.value >= 60 ? 'h-full rounded-full bg-indigo-500' : 'h-full rounded-full bg-amber-500'}
                    style={{ width: `${d.value}%` }}
                  />
                </div>
              </div>
            ))}
          </dl>
          <p className="mt-6 rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
            <span className="font-semibold text-slate-900">Coach: </span>
            Your fluency is the skill to push this week. Today: one Brain mode round and a café mission, spoken out loud.
          </p>
        </figure>
      </div>
    </Section>
  );
}

const WEEKLY_XP = [
  { day: 'Mon', xp: 120 },
  { day: 'Tue', xp: 180 },
  { day: 'Wed', xp: 90 },
  { day: 'Thu', xp: 240 },
  { day: 'Fri', xp: 200 },
  { day: 'Sat', xp: 310 },
  { day: 'Sun', xp: 260 },
];

const STATS = [
  { value: '23', label: 'Day streak' },
  { value: '1,400', label: 'XP this week' },
  { value: '312', label: 'Words in review' },
  { value: '14', label: 'Achievements' },
];

export function Progress() {
  const max = Math.max(...WEEKLY_XP.map((d) => d.xp));
  return (
    <Section id={SECTION_IDS.progress} labelledBy="progress-title" tone="muted">
      <SectionHeader
        id="progress-title"
        eyebrow="Progress"
        title="See your progress, not just your streak"
        lead="XP, streaks and achievements keep you going. Skill trends and your AI journal show what has really changed."
      />

      <div className="mt-12 grid gap-6 lg:grid-cols-3">
        <figure className="min-w-0 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
          <figcaption className="flex flex-wrap items-baseline justify-between gap-2">
            <span className="font-semibold">XP this week</span>
            <span className="text-xs text-slate-600">Example data</span>
          </figcaption>
          <dl className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {STATS.map((s) => (
              <div key={s.label} className="min-w-0 rounded-2xl bg-slate-50 p-4">
                <dt className="text-xs text-slate-600">{s.label}</dt>
                <dd className="mt-1 text-2xl font-bold tracking-tight">{s.value}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-8 flex h-44 items-end gap-2 sm:gap-4" role="img" aria-label={`Bar chart of XP per day: ${WEEKLY_XP.map((d) => `${d.day} ${d.xp}`).join(', ')}`}>
            {WEEKLY_XP.map((d) => (
              <div key={d.day} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2">
                <div className="w-full rounded-t-lg bg-gradient-to-t from-indigo-600 to-violet-400" style={{ height: `${Math.round((d.xp / max) * 100)}%` }} />
                <span className="text-xs text-slate-600">{d.day}</span>
              </div>
            ))}
          </div>
        </figure>

        <figure className="min-w-0 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <figcaption className="flex items-center gap-2 font-semibold">
            <Icon name="journal" className="text-indigo-600" />
            AI journal
          </figcaption>
          <p className="mt-1 text-sm text-slate-600">The same prompt, answered on Day 1 and Day 90.</p>
          <div className="mt-5 space-y-3 text-sm">
            <div className="rounded-2xl border border-slate-200 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-600">Day 1</p>
              <p className="mt-1 break-words text-slate-800" lang="it">
                Io lavoro in ufficio. Io piace caffè.
              </p>
            </div>
            <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-indigo-800">Day 90</p>
              <p className="mt-1 break-words text-slate-900" lang="it">
                Lavoro in un ufficio in centro e, prima di iniziare, mi piace prendere un caffè con i colleghi.
              </p>
            </div>
          </div>
          <svg viewBox="0 0 200 48" className="mt-5 h-12 w-full" aria-hidden="true" focusable="false">
            <polyline points="0,44 30,40 60,36 90,30 120,24 150,16 200,6" fill="none" stroke="rgb(79 70 229)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <p className="text-xs text-slate-600">Sentence length and accuracy, Day 1 → Day 90 (illustrative)</p>
        </figure>
      </div>
    </Section>
  );
}
