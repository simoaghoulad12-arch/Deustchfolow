import Link from 'next/link';
import { getSession } from '@/lib/auth/session';
import { ButtonLink } from '@/components/live/ui';

const LANGUAGES = [
  { flag: '🇩🇪', name: 'German' },
  { flag: '🇬🇧', name: 'English' },
  { flag: '🇪🇸', name: 'Spanish' },
  { flag: '🇫🇷', name: 'French' },
  { flag: '🇮🇹', name: 'Italian' },
];

const FEATURES = [
  { icon: '🌍', title: 'A world, not a course', text: '15 places — café, train station, doctor, office — each full of real situations you will actually face.' },
  { icon: '💬', title: 'Talk to real characters', text: 'Lena the barista, Herr Braun at the citizens office. They react to what you say, not to a script.' },
  { icon: '✨', title: 'Corrections that feel natural', text: 'No red pens. The AI shows you the more natural sentence, explains why in one line and lets you use it right away.' },
  { icon: '🧬', title: 'Your Language DNA', text: 'Ten skills measured from everything you do, from grammar to response speed. Your plan follows the data.' },
  { icon: '🎯', title: 'Mistakes that disappear', text: 'Every error is remembered and comes back until you have used it correctly three times in a row.' },
  { icon: '🧭', title: 'A coach that knows you', text: '“Your speaking improved 12% this week. Today: ten minutes on past tense.” Every day, personal.' },
];

const MODES = [
  { icon: '🎙️', title: 'Speaking', text: 'Answer out loud and get pronunciation and fluency feedback.' },
  { icon: '⚡', title: 'Brain mode', text: 'Answer before the timer runs out. Stop translating, start thinking.' },
  { icon: '🌀', title: 'Chaos mode', text: 'The train is cancelled, your card is declined. Handle it.' },
  { icon: '📖', title: 'Story mode', text: 'A six-chapter story where your choices shape what happens next.' },
  { icon: '⚖️', title: 'Debate', text: 'Defend your opinion against an AI that argues back.' },
  { icon: '🎭', title: 'Emotion mode', text: 'Say it politely, firmly or warmly — and learn the difference.' },
];

export default async function LandingPage() {
  const session = await getSession();

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2 text-lg font-bold tracking-tight">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 text-white">D</span>
            DeutschFlow
          </Link>
          <nav className="flex items-center gap-2">
            {session ? (
              <ButtonLink href="/home" size="sm">
                Open app
              </ButtonLink>
            ) : (
              <>
                <ButtonLink href="/login" variant="ghost" size="sm">
                  Log in
                </ButtonLink>
                <ButtonLink href="/register" size="sm">
                  Start free
                </ButtonLink>
              </>
            )}
          </nav>
        </div>
      </header>

      <main>
        <section className="bg-hero relative overflow-hidden">
          <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-[1.1fr_1fr]">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white/70 px-3 py-1 text-xs font-medium text-indigo-700">
                {LANGUAGES.map((l) => (
                  <span key={l.name} aria-hidden>
                    {l.flag}
                  </span>
                ))}
                <span>5 languages · A1 to B2</span>
              </p>
              <h1 className="mt-6 text-balance text-5xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl">
                Learn a language.{' '}
                <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 bg-clip-text text-transparent">Live it.</span>
              </h1>
              <p className="mt-6 max-w-xl text-lg text-slate-600 sm:text-xl">
                Step into a café in Berlin, a train station in Madrid or a job interview in Paris. Talk to AI characters, get corrected naturally and grow with a plan built around you.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <ButtonLink href={session ? '/home' : '/register'} size="lg">
                  Start your first conversation
                </ButtonLink>
                <ButtonLink href="#how" variant="secondary" size="lg">
                  How it works
                </ButtonLink>
              </div>
              <p className="mt-4 text-sm text-slate-500">Free to start · No credit card · Works on any device</p>
            </div>

            <div className="relative mx-auto w-full max-w-md" aria-label="Example conversation at the café">
              <div className="absolute -inset-6 -z-10 rounded-[2.5rem] bg-gradient-to-br from-indigo-200/60 via-violet-200/50 to-fuchsia-200/50 blur-2xl" aria-hidden />
              <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
                <div className="flex items-center gap-3 border-b border-slate-100 bg-amber-50 px-5 py-4">
                  <span className="text-3xl" aria-hidden>
                    👩🏼‍🍳
                  </span>
                  <div>
                    <p className="font-semibold">At the Café · A1</p>
                    <p className="text-xs text-slate-500">Lena, barista at Café Morgenrot</p>
                  </div>
                  <span className="ml-auto rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">2/4 goals</span>
                </div>
                <div className="space-y-3 bg-slate-50/60 p-5 text-sm">
                  <p className="max-w-[80%] rounded-2xl rounded-bl-md bg-white px-4 py-2.5 shadow-sm" lang="de">
                    Guten Morgen! Was darf ich Ihnen bringen?
                  </p>
                  <div className="ml-auto max-w-[85%] space-y-1.5">
                    <p className="rounded-2xl rounded-br-md bg-indigo-600 px-4 py-2.5 text-white" lang="de">
                      Ich möchte ein Kaffee mit Milch, bitte.
                    </p>
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2">
                      <p className="text-xs font-semibold text-emerald-800">✨ More natural</p>
                      <p className="font-medium text-emerald-900" lang="de">
                        Ich möchte einen Kaffee mit Milch, bitte.
                      </p>
                      <p className="text-xs text-emerald-800">“Kaffee” is masculine → einen.</p>
                    </div>
                  </div>
                  <p className="max-w-[80%] rounded-2xl rounded-bl-md bg-white px-4 py-2.5 shadow-sm" lang="de">
                    Sehr gern! Möchten Sie auch etwas essen? Der Apfelstrudel ist ganz frisch.
                  </p>
                </div>
                <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3 text-xs text-slate-500">
                  <span>🎙️ Speak or type</span>
                  <span className="font-semibold text-indigo-600">+100 XP</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="how" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">From first word to real conversations</h2>
          <ol className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              { n: '1', title: 'Tell us about you', text: 'Language, level, goals and time. Not sure about your level? A four-minute adaptive test finds it.' },
              { n: '2', title: 'Live a mission', text: 'Order coffee, buy a ticket, survive an interview. Speak or type — the character responds like a real person.' },
              { n: '3', title: 'Grow every day', text: 'XP, streaks and a Language DNA that shows exactly what improved. Your coach picks what comes next.' },
            ].map((s) => (
              <li key={s.n} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 font-bold text-white">{s.n}</span>
                <h3 className="mt-4 text-lg font-semibold">{s.title}</h3>
                <p className="mt-2 text-slate-600">{s.text}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="bg-slate-50 py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 className="max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">Not another vocabulary app.</h2>
            <p className="mt-3 max-w-2xl text-lg text-slate-600">Everything is built around one idea: you learn a language by using it in situations that matter to you.</p>
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map((f) => (
                <div key={f.title} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <span className="text-3xl" aria-hidden>
                    {f.icon}
                  </span>
                  <h3 className="mt-3 text-lg font-semibold">{f.title}</h3>
                  <p className="mt-2 text-slate-600">{f.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Six ways to practise</h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {MODES.map((m) => (
              <div key={m.title} className="flex gap-4 rounded-2xl border border-slate-200 p-5">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-2xl" aria-hidden>
                  {m.icon}
                </span>
                <div>
                  <h3 className="font-semibold">{m.title}</h3>
                  <p className="text-sm text-slate-600">{m.text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="px-4 pb-20 sm:px-6">
          <div className="mx-auto max-w-6xl overflow-hidden rounded-[2rem] bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 px-6 py-14 text-center text-white sm:px-12">
            <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-5xl">Your first conversation is two minutes away.</h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-white/85">Pick a language, tell us your goal and walk into the café.</p>
            <ButtonLink href={session ? '/home' : '/register'} variant="secondary" size="lg" className="mt-8">
              Start free
            </ButtonLink>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-100">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-8 text-sm text-slate-500 sm:flex-row sm:px-6">
          <p>© {new Date().getFullYear()} DeutschFlow</p>
          <nav className="flex gap-4">
            <Link href="/login" className="hover:text-slate-900">
              Log in
            </Link>
            <Link href="/register" className="hover:text-slate-900">
              Sign up
            </Link>
            <Link href="/tutors" className="hover:text-slate-900">
              Tutors
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
