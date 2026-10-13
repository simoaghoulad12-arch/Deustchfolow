import { Icon, IconTile, Section, SectionHeader, SECTION_IDS, type IconName } from './primitives';

const STEPS = [
  { n: '01', title: 'Find your level', text: 'Pick a language and your goals. An adaptive placement test measures each skill separately, so you start exactly where you are.' },
  { n: '02', title: 'Live a mission', text: 'Order coffee, buy a ticket, survive an interview. Speak or type — AI characters react to what you actually say, not to a script.' },
  { n: '03', title: 'Get better every day', text: 'Natural corrections, a memory of your mistakes and a coach that plans tomorrow from what happened today.' },
];

export function HowItWorks() {
  return (
    <Section id={SECTION_IDS.how} labelledBy="how-title">
      <SectionHeader
        id="how-title"
        eyebrow="How it works"
        title="From first word to real conversations"
        lead="A learning loop built on use, not memorisation: measure, practise in context, adapt."
        align="center"
      />
      <ol className="mt-12 grid gap-6 md:grid-cols-3">
        {STEPS.map((s) => (
          <li key={s.n} className="min-w-0 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <span className="font-mono text-sm font-semibold text-indigo-600">{s.n}</span>
            <h3 className="mt-3 text-lg font-semibold">{s.title}</h3>
            <p className="mt-2 text-slate-600">{s.text}</p>
          </li>
        ))}
      </ol>
    </Section>
  );
}

const TUTOR_FEATURES: { icon: IconName; title: string; text: string }[] = [
  { icon: 'sparkles', title: 'Corrections that feel natural', text: 'No red pen. You see your sentence, the more natural version and a one-line explanation of why.' },
  { icon: 'memory', title: 'Personal error memory', text: 'Every mistake is remembered and comes back in later practice until you use it correctly three times in a row.' },
  { icon: 'target', title: 'Adaptive difficulty', text: 'Missions, vocabulary and grammar get harder or easier based on how you perform — continuously, not once a month.' },
  { icon: 'compass', title: 'A coach that knows you', text: 'A daily plan from your personal AI coach: what improved, what slipped and the ten minutes that matter most today.' },
];

export function AiTutor() {
  return (
    <Section id={SECTION_IDS.tutor} labelledBy="tutor-title" tone="muted">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <div className="min-w-0">
          <SectionHeader
            id="tutor-title"
            eyebrow="AI Tutor"
            title="A tutor that explains, remembers and adapts"
            lead="Feedback arrives in the moment, in plain language, and shapes everything you practise next."
          />
          <ul className="mt-8 grid gap-5 sm:grid-cols-2">
            {TUTOR_FEATURES.map((f) => (
              <li key={f.title} className="min-w-0">
                <IconTile name={f.icon} />
                <h3 className="mt-3 font-semibold">{f.title}</h3>
                <p className="mt-1 text-sm text-slate-600">{f.text}</p>
              </li>
            ))}
          </ul>
        </div>

        <figure className="min-w-0 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <figcaption className="text-sm font-semibold text-slate-900">Example correction · Spanish · A2</figcaption>
          <dl className="mt-5 space-y-4 text-sm">
            <div className="rounded-2xl border border-slate-200 p-4">
              <dt className="text-xs font-semibold uppercase tracking-wider text-slate-600">Your sentence</dt>
              <dd className="mt-1 break-words text-base text-slate-900" lang="es">
                Ayer yo he ido al mercado con mi hermana.
              </dd>
            </div>
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
              <dt className="text-xs font-semibold uppercase tracking-wider text-emerald-800">More natural</dt>
              <dd className="mt-1 break-words text-base font-medium text-emerald-950" lang="es">
                Ayer fui al mercado con mi hermana.
              </dd>
            </div>
            <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-4">
              <dt className="text-xs font-semibold uppercase tracking-wider text-indigo-800">Why?</dt>
              <dd className="mt-1 text-slate-800">
                With a finished time like <span lang="es">“ayer”</span>, Spanish uses the preterite (<span lang="es">fui</span>). The subject <span lang="es">“yo”</span> is usually dropped.
              </dd>
            </div>
          </dl>
          <p className="mt-4 flex items-center gap-2 text-xs text-slate-600">
            <Icon name="memory" className="h-4 w-4 text-indigo-600" />
            Saved to your error memory · will return in tomorrow’s review
          </p>
        </figure>
      </div>
    </Section>
  );
}

const ENVIRONMENTS = [
  'Home',
  'City',
  'Café',
  'Restaurant',
  'Supermarket',
  'Train Station',
  'Airport',
  'Hotel',
  'Workplace',
  'University',
  'Hospital',
  'Government Office',
  'Social Life',
  'Travel',
  'Business',
];

const MODES: { icon: IconName; title: string; text: string; tag?: string }[] = [
  { icon: 'mic', title: 'Speaking', text: 'Answer out loud and get pronunciation and fluency feedback.' },
  { icon: 'bolt', title: 'Brain mode', text: 'Five seconds to answer. Stop translating, start thinking in the language.' },
  { icon: 'shuffle', title: 'Chaos', text: 'The train is cancelled, your card is declined. Handle the unexpected.' },
  { icon: 'book', title: 'Story', text: 'A multi-chapter story where your choices shape what happens next.' },
  { icon: 'scale', title: 'Debate', text: 'Defend your opinion against an AI that argues back.', tag: 'B1+' },
  { icon: 'face', title: 'Emotion & tone', text: 'Say it politely, firmly or warmly — and learn the difference.' },
];

export function ImmersiveWorld() {
  return (
    <Section id={SECTION_IDS.world} labelledBy="world-title">
      <SectionHeader
        id="world-title"
        eyebrow="Immersive World"
        title="A world with 15 places to live the language"
        lead="Each environment is full of missions with AI characters who react dynamically — they ask follow-up questions, misunderstand you when you are unclear and remember what you told them."
      />
      <ul className="mt-10 flex flex-wrap gap-2" aria-label="The 15 environments">
        {ENVIRONMENTS.map((e, i) => (
          <li key={e} className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-sm font-medium text-slate-700">
            <span className="font-mono text-xs text-slate-500" aria-hidden="true">
              {String(i + 1).padStart(2, '0')}
            </span>
            {e}
          </li>
        ))}
      </ul>

      <h3 className="mt-14 text-xl font-semibold tracking-tight">Six ways to practise</h3>
      <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {MODES.map((m) => (
          <li key={m.title} className="flex min-w-0 gap-4 rounded-2xl border border-slate-200 bg-white p-5">
            <IconTile name={m.icon} />
            <div className="min-w-0">
              <p className="flex flex-wrap items-center gap-2 font-semibold">
                {m.title}
                {m.tag ? <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-700">{m.tag}</span> : null}
              </p>
              <p className="mt-1 text-sm text-slate-600">{m.text}</p>
            </div>
          </li>
        ))}
      </ul>
    </Section>
  );
}

const LEVELS = [
  {
    code: 'A1',
    name: 'Beginner',
    summary: 'Handle everyday basics.',
    can: ['Introduce yourself and others', 'Order food and drinks', 'Ask for directions and prices'],
  },
  {
    code: 'A2',
    name: 'Elementary',
    summary: 'Manage routine situations.',
    can: ['Talk about your past and plans', 'Shop, book and make appointments', 'Describe your work and home'],
  },
  {
    code: 'B1',
    name: 'Intermediate',
    summary: 'Get by independently.',
    can: ['Solve problems while travelling', 'Give opinions and reasons', 'Follow clear talk on familiar topics'],
  },
  {
    code: 'B2',
    name: 'Upper intermediate',
    summary: 'Speak with confidence.',
    can: ['Discuss abstract topics fluently', 'Negotiate and argue at work', 'Understand most native speech'],
  },
];

export function LearningPath() {
  return (
    <Section id={SECTION_IDS.path} labelledBy="path-title" tone="muted">
      <SectionHeader
        id="path-title"
        eyebrow="A1–B2 Learning Path"
        title="Four CEFR levels. Forty modules. One clear path."
        lead="Each level has 10 modules that combine missions, a structured grammar curriculum and spaced-repetition vocabulary."
      />
      <ol className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {LEVELS.map((l, i) => (
          <li key={l.code} className="relative flex min-w-0 flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-2">
              <span className="text-3xl font-extrabold tracking-tight text-indigo-600">{l.code}</span>
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">10 modules</span>
            </div>
            <h3 className="mt-3 font-semibold">{l.name}</h3>
            <p className="text-sm text-slate-600">{l.summary}</p>
            <ul className="mt-4 space-y-2 text-sm text-slate-700">
              {l.can.map((c) => (
                <li key={c} className="flex gap-2">
                  <Icon name="check" className="mt-0.5 h-4 w-4 text-emerald-600" />
                  <span className="min-w-0">{c}</span>
                </li>
              ))}
            </ul>
            <div className="mt-auto pt-5" aria-hidden="true">
              <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500" style={{ width: `${(i + 1) * 25}%` }} />
              </div>
            </div>
          </li>
        ))}
      </ol>
    </Section>
  );
}
