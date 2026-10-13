import Link from 'next/link';
import { ButtonLink } from '@/components/live/ui';
import { Icon, NAV_LINKS, SECTION_IDS } from './primitives';

export const LANGUAGES = [
  { code: 'DE', name: 'German' },
  { code: 'EN', name: 'English' },
  { code: 'ES', name: 'Spanish' },
  { code: 'FR', name: 'French' },
  { code: 'IT', name: 'Italian' },
] as const;

export function LandingHeader({ signedIn }: { signedIn: boolean }) {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 rounded-lg text-lg font-bold tracking-tight">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 text-white" aria-hidden="true">
            D
          </span>
          DeutschFlow
        </Link>
        <nav aria-label="Sections" className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((l) => (
            <a key={l.href} href={l.href} className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900">
              {l.label}
            </a>
          ))}
        </nav>
        <nav aria-label="Account" className="flex shrink-0 items-center gap-1 whitespace-nowrap sm:gap-2">
          {signedIn ? (
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
  );
}

export function Hero({ startHref }: { startHref: string }) {
  return (
    <section id={SECTION_IDS.hero} aria-labelledby="hero-title" className="bg-hero relative overflow-hidden">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-[1.1fr_1fr]">
        <div className="min-w-0">
          <p className="inline-flex flex-wrap items-center gap-x-2 gap-y-1 rounded-full border border-indigo-100 bg-white/70 px-3 py-1 text-xs font-medium text-indigo-700">
            <span className="flex gap-1" aria-hidden="true">
              {LANGUAGES.map((l) => (
                <span key={l.code} className="rounded bg-indigo-50 px-1 font-semibold tracking-wide">
                  {l.code}
                </span>
              ))}
            </span>
            <span>5 languages · CEFR A1 to B2</span>
          </p>
          <h1 id="hero-title" className="mt-6 text-balance text-5xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl">
            Learn a language.{' '}
            <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 bg-clip-text text-transparent">Live it.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-slate-600 sm:text-xl">
            Your personal AI language coach helps you progress from A1 to B2 through real conversations, immersive missions and personalized practice.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href={startHref} size="lg">
              Start Learning
              <Icon name="arrow" className="h-4 w-4" />
            </ButtonLink>
            <ButtonLink href={`#${SECTION_IDS.how}`} variant="secondary" size="lg">
              Explore the Experience
            </ButtonLink>
          </div>
          <p className="mt-4 text-sm text-slate-600">Free to start · No credit card · Works on any device</p>
        </div>

        <HeroConversation />
      </div>
    </section>
  );
}

function HeroConversation() {
  return (
    <figure className="relative mx-auto w-full min-w-0 max-w-md">
      <div className="absolute -inset-6 -z-10 rounded-[2.5rem] bg-gradient-to-br from-indigo-200/60 via-violet-200/50 to-fuchsia-200/50 blur-2xl" aria-hidden="true" />
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 bg-slate-50 px-5 py-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-rose-400 text-sm font-bold text-white" aria-hidden="true">
            L
          </span>
          <div className="min-w-0">
            <p className="font-semibold">At the Café · A1</p>
            <p className="text-xs text-slate-600">Lena, barista at Café Morgenrot</p>
          </div>
          <span className="ml-auto rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800">2/4 goals</span>
        </div>
        <div className="space-y-3 bg-white p-5 text-sm">
          <p className="max-w-[85%] rounded-2xl rounded-bl-md bg-slate-100 px-4 py-2.5" lang="de">
            Guten Morgen! Was darf ich Ihnen bringen?
          </p>
          <div className="ml-auto max-w-[90%] space-y-1.5">
            <p className="rounded-2xl rounded-br-md bg-indigo-600 px-4 py-2.5 text-white" lang="de">
              Ich möchte ein Kaffee mit Milch, bitte.
            </p>
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2">
              <p className="text-xs font-semibold text-emerald-800">More natural</p>
              <p className="font-medium text-emerald-950" lang="de">
                Ich möchte einen Kaffee mit Milch, bitte.
              </p>
              <p className="text-xs text-emerald-800">“Kaffee” is masculine → einen.</p>
            </div>
          </div>
          <p className="max-w-[85%] rounded-2xl rounded-bl-md bg-slate-100 px-4 py-2.5" lang="de">
            Sehr gern! Möchten Sie auch etwas essen? Der Apfelstrudel ist ganz frisch.
          </p>
        </div>
        <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3 text-xs text-slate-600">
          <span className="inline-flex items-center gap-1.5">
            <Icon name="mic" className="h-4 w-4" /> Speak or type
          </span>
          <span className="font-semibold text-indigo-700">+100 XP</span>
        </div>
      </div>
      <figcaption className="sr-only">Example mission: ordering at a café in German with a natural correction from the AI.</figcaption>
    </figure>
  );
}
