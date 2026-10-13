import Link from 'next/link';
import { ButtonLink } from '@/components/live/ui';
import { Icon, NAV_LINKS, Section, SectionHeader, SECTION_IDS } from './primitives';

const STORIES = [
  {
    persona: 'The relocating engineer',
    detail: 'German · A2 → B1',
    initials: 'RE',
    quote: 'I’m moving for a new job. I want to handle the Government Office and my first team meetings without switching to English.',
  },
  {
    persona: 'The weekend traveller',
    detail: 'Italian · A1 → A2',
    initials: 'WT',
    quote: 'I want to order, ask for directions and chat with hosts in Italy — and actually understand the answer.',
  },
  {
    persona: 'The career switcher',
    detail: 'English · B1 → B2',
    initials: 'CS',
    quote: 'Debate mode is how I want to prepare for interviews: defending my ideas in real time, with feedback on tone.',
  },
];

export function Testimonials() {
  return (
    <Section id={SECTION_IDS.testimonials} labelledBy="stories-title">
      <SectionHeader
        id="stories-title"
        eyebrow="Learner stories"
        title="What learners are working towards"
        lead="Illustrative learner personas based on the goals DeutschFlow is designed for — not verified reviews."
      />
      <ul className="mt-12 grid gap-6 md:grid-cols-3">
        {STORIES.map((s) => (
          <li key={s.persona} className="min-w-0">
            <figure className="flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <blockquote className="flex-1 text-slate-800">
                <p>“{s.quote}”</p>
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white" aria-hidden="true">
                  {s.initials}
                </span>
                <span className="min-w-0">
                  <span className="block font-semibold">{s.persona}</span>
                  <span className="block text-sm text-slate-600">{s.detail}</span>
                </span>
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>
      <p className="mt-6 text-xs text-slate-600">Illustrative learner stories. Personas are composites, not real customers.</p>
    </Section>
  );
}

const FAQS = [
  {
    q: 'Which levels are supported?',
    a: 'DeutschFlow covers the CEFR levels A1, A2, B1 and B2. Each level has 10 modules. If you are unsure where to begin, the placement test recommends a starting level and shows results per skill.',
  },
  {
    q: 'Which languages can I learn?',
    a: 'German, English, Spanish, French and Italian. Missions, grammar and vocabulary are built for each language, so you learn how people actually speak it.',
  },
  {
    q: 'Does it work without a microphone?',
    a: 'Yes. You can type your answers in every mission and mode. Speaking practice and pronunciation feedback need a microphone, so we recommend using one when you can.',
  },
  {
    q: 'How does the AI correct me?',
    a: 'After you answer, you see your sentence, a more natural version and a short explanation of why. Mistakes are saved to your personal error memory and come back in later practice until you get them right consistently.',
  },
  {
    q: 'How does DeutschFlow adapt to me?',
    a: 'Your Language DNA tracks ten skills — from vocabulary and grammar to fluency and response speed. Difficulty, daily challenges and your coach’s plan are adjusted from that profile.',
  },
  {
    q: 'Is my data safe?',
    a: 'Your learning data is used to personalise your practice and stays tied to your account. Microphone input is only used when you choose to answer out loud. If you have questions about your data or want it removed, contact us.',
  },
  {
    q: 'How much does it cost?',
    a: 'You can start for free, with no credit card required. Optional paid features may be offered inside the app; you will always see the details before choosing.',
  },
];

export function Faq() {
  return (
    <Section id={SECTION_IDS.faq} labelledBy="faq-title" tone="muted">
      <div className="grid gap-12 lg:grid-cols-[1fr_1.6fr]">
        <SectionHeader id="faq-title" eyebrow="FAQ" title="Questions, answered" lead="Everything you need to know before your first mission." />
        <div className="min-w-0 divide-y divide-slate-200 rounded-3xl border border-slate-200 bg-white">
          {FAQS.map((f) => (
            <details key={f.q} className="group px-6 py-1">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-lg py-4 font-semibold text-slate-900 [&::-webkit-details-marker]:hidden">
                <span className="min-w-0">{f.q}</span>
                <Icon name="plus" className="h-5 w-5 text-slate-500 transition-transform group-open:rotate-45" />
              </summary>
              <p className="pb-5 text-slate-600">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </Section>
  );
}

export function FinalCta({ startHref }: { startHref: string }) {
  return (
    <section id={SECTION_IDS.cta} aria-labelledby="cta-title" className="scroll-mt-16 px-4 py-20 sm:px-6 sm:py-24">
      <div className="mx-auto max-w-6xl overflow-hidden rounded-[2rem] bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 px-6 py-14 text-center text-white sm:px-12">
        <h2 id="cta-title" className="text-balance text-3xl font-bold tracking-tight sm:text-5xl">
          Your first conversation is two minutes away.
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-lg text-white/90">Pick a language, tell us your goal and walk into the café.</p>
        <ButtonLink href={startHref} variant="secondary" size="lg" className="mt-8">
          Start Learning
        </ButtonLink>
        <p className="mt-4 text-sm text-white/90">Free to start · No credit card</p>
      </div>
    </section>
  );
}

export function LandingFooter() {
  return (
    <footer className="border-t border-slate-200">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 text-sm sm:px-6 md:grid-cols-[1.5fr_1fr_1fr]">
        <div className="min-w-0">
          <Link href="/" className="inline-flex items-center gap-2 rounded-lg text-base font-bold tracking-tight text-slate-900">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 text-xs text-white" aria-hidden="true">
              D
            </span>
            DeutschFlow
          </Link>
          <p className="mt-3 max-w-xs text-slate-600">AI language coaching for German, English, Spanish, French and Italian — from A1 to B2.</p>
        </div>
        <nav aria-label="Footer sections">
          <p className="font-semibold text-slate-900">Product</p>
          <ul className="mt-3 space-y-2">
            {NAV_LINKS.map((l) => (
              <li key={l.href}>
                <a href={l.href} className="rounded text-slate-600 hover:text-slate-900">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-label="Footer account links">
          <p className="font-semibold text-slate-900">Account</p>
          <ul className="mt-3 space-y-2">
            <li>
              <Link href="/login" className="rounded text-slate-600 hover:text-slate-900">
                Login
              </Link>
            </li>
            <li>
              <Link href="/register" className="rounded text-slate-600 hover:text-slate-900">
                Register
              </Link>
            </li>
            <li>
              <Link href="/tutors" className="rounded text-slate-600 hover:text-slate-900">
                Tutors
              </Link>
            </li>
          </ul>
        </nav>
      </div>
      <div className="border-t border-slate-100">
        <p className="mx-auto max-w-6xl px-4 py-6 text-xs text-slate-600 sm:px-6">© {new Date().getFullYear()} DeutschFlow. All rights reserved.</p>
      </div>
    </footer>
  );
}
