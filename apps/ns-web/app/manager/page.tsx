import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { CopyButton } from '@/components/manager/CopyButton';
import { KpiLog } from '@/components/manager/KpiLog';
import { WeekChecklist } from '@/components/manager/WeekChecklist';
import {
  AUDIENCE,
  BRAND_PATH,
  BROADCAST_TYPES,
  DECISION_RULES,
  EMERGENCY_MODE,
  FUNNEL_FLOW,
  FUNNEL_NOTE,
  FUNNELS,
  GOAL_CHAIN,
  HYBRID_NOTE,
  HYBRID_STEPS,
  IDENTITY,
  KPI_SOURCE,
  MANAGER_META,
  NOT_NOW,
  REEL_NOTES,
  REEL_SLOTS,
  RULES,
  RULES_INTRO,
  RULES_NOTE,
  SQUAD_CHECKLIST,
  SQUAD_INTRO,
  START_TOMORROW,
  SUNDAY_FLOW,
  WEEK,
  WEEK_INTRO,
} from '@/lib/manager';

/**
 * The founder's private management system. Not linked anywhere, excluded
 * from the sitemap, disallowed in robots.txt and noindex — but anyone with
 * the URL can open it (there is no backend to log in against). Keep only
 * strategy and aggregate numbers here, never personal data. See ASSETS.md.
 */
export const metadata: Metadata = {
  title: 'Manager',
  robots: { index: false, follow: false },
};

const SECTIONS = [
  ['sonntag', 'Sonntag'],
  ['nicht-jetzt', 'Nicht jetzt'],
  ['regeln', 'Regeln'],
  ['reels', 'Reels'],
  ['funnels', 'DM-Funnels'],
  ['squad', 'Squad'],
  ['woche', 'Woche'],
  ['kpis', 'Zahlen'],
  ['marke', 'NATYSIMO & Hybrid'],
  ['identitaet', 'Identität'],
] as const;

function Chain({ items, open = false }: { items: readonly string[]; open?: boolean }) {
  return (
    <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
      {items.map((item, i) => (
        <span key={item} className="flex items-center gap-2">
          {i > 0 && <span className="text-gold">→</span>}
          {item}
        </span>
      ))}
      {open && (
        <span className="flex items-center gap-2 text-fog">
          <span className="text-gold">→</span> … (offen)
        </span>
      )}
    </p>
  );
}

function Section({
  id,
  index,
  title,
  intro,
  children,
}: {
  id: string;
  index: number;
  title: string;
  intro?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 border-t border-white/[0.07] py-14">
      <p className="tech text-fog">{String(index).padStart(2, '0')}</p>
      <h2 className="mt-3 font-display text-4xl leading-none sm:text-5xl">{title}</h2>
      {intro && <p className="mt-5 max-w-2xl text-sm leading-relaxed text-mist">{intro}</p>}
      <div className="mt-8">{children}</div>
    </section>
  );
}

export default function ManagerPage() {
  return (
    <div lang="de" className="mx-auto max-w-4xl px-4 pb-32 pt-28 sm:px-6">
      <header>
        <p className="label text-mist">
          {MANAGER_META.date} · {MANAGER_META.author}
        </p>
        <h1 className="mt-4 font-display text-5xl leading-[0.95] sm:text-6xl">
          Management-System <em className="text-gold">90 Tage</em>
        </h1>
        <p className="mt-5 font-display text-xl italic text-ivory/80">{IDENTITY.claim}</p>
        <p className="mt-6 max-w-2xl text-xs leading-relaxed text-fog">
          Private Seite, nirgends verlinkt. Abhaken und Zahlen werden nur auf diesem Gerät
          gespeichert.
        </p>
      </header>

      <nav aria-label="Abschnitte" className="mt-10 flex flex-wrap gap-2">
        {SECTIONS.map(([id, label]) => (
          <a
            key={id}
            href={`#${id}`}
            className="label border border-white/10 px-3 py-2.5 text-mist transition-colors hover:border-accent hover:text-accent"
          >
            {label}
          </a>
        ))}
      </nav>

      <Section
        id="sonntag"
        index={1}
        title="Sonntag = Manager Day"
        intro="Jeden Sonntag schaust du 15 Minuten auf genau 5 Zahlen und entscheidest danach, was du diese Woche filmst."
      >
        <h3 className="label text-gold">Start · {START_TOMORROW.date}</h3>
        <div className="mt-4">
          <WeekChecklist id="start" items={START_TOMORROW.steps} />
        </div>

        <h3 className="label mt-12 text-gold">Ablauf am Sonntag</h3>
        <div className="mt-4">
          <WeekChecklist id="sunday" items={SUNDAY_FLOW} />
        </div>

        <h3 className="label mt-12 text-gold">Entscheidungsregeln</h3>
        <dl className="mt-4 border-t border-white/[0.07]">
          {DECISION_RULES.map((r) => (
            <div
              key={r.signal}
              className="grid gap-1 border-b border-white/[0.07] py-4 sm:grid-cols-[16rem_1fr] sm:gap-6"
            >
              <dt className="text-sm">{r.signal}</dt>
              <dd className="text-sm text-mist">{r.action}</dd>
            </div>
          ))}
        </dl>
      </Section>

      <Section
        id="nicht-jetzt"
        index={2}
        title="NICHT JETZT"
        intro="Wenn du mit einem dieser Themen kommst, lautet die Antwort NICHT JETZT. Jedes Thema hat einen Grund und eine Bedingung, ab der es wieder auf den Tisch darf."
      >
        <ul className="grid gap-px bg-white/[0.07]">
          {NOT_NOW.map((n) => (
            <li key={n.topic} className="grid gap-3 bg-ink py-5 sm:grid-cols-3 sm:gap-6">
              <p className="text-sm">{n.topic}</p>
              <p className="text-sm text-mist">
                <span className="label block text-fog">Warum nicht jetzt</span>
                {n.why}
              </p>
              <p className="text-sm text-mist">
                <span className="label block text-fog">Wieder erlaubt, wenn</span>
                {n.allowedWhen}
              </p>
            </li>
          ))}
        </ul>
      </Section>

      <Section id="regeln" index={3} title="Manager-Regeln" intro={RULES_INTRO}>
        <Chain items={GOAL_CHAIN} />
        <p className="mt-2 text-xs text-fog">nicht View → View → View</p>
        <ol className="mt-8 border-t border-white/[0.07]">
          {RULES.map((r, i) => (
            <li key={r.title} className="flex gap-4 border-b border-white/[0.07] py-4">
              <span className="tech pt-1 text-fog">{i + 1}</span>
              <p className="text-sm leading-relaxed">
                <strong className="font-medium text-ivory">{r.title}</strong>
                {r.text && <span className="text-mist">: {r.text}</span>}
              </p>
            </li>
          ))}
        </ol>
        <p className="mt-6 text-sm text-mist">{RULES_NOTE}</p>
      </Section>

      <Section
        id="reels"
        index={4}
        title="Reel-Struktur"
        intro="Pro Woche gibt es 4–5 Reels, und mindestens 2 davon sind Fitness. Deutsch bdarija bleibt bei höchstens 1 von 4–5."
      >
        <ul className="border-t border-white/[0.07]">
          {REEL_SLOTS.map((r) => (
            <li
              key={r.slot}
              className="grid gap-2 border-b border-white/[0.07] py-5 sm:grid-cols-[3rem_1fr_7rem] sm:gap-6"
            >
              <span className="tech text-fog">
                {r.slot}
                {r.optional && ' (opt.)'}
              </span>
              <span>
                <span className="block text-sm">{r.topic}</span>
                <span className="mt-1 block font-display text-lg italic text-ivory/80">
                  {r.hook}
                </span>
              </span>
              <span className="tech text-gold sm:text-right">{r.ctas.join(' / ')}</span>
            </li>
          ))}
        </ul>
        <dl className="mt-8 grid gap-4">
          {REEL_NOTES.map((n) => (
            <div key={n.term} className="text-sm leading-relaxed">
              <dt className="inline font-medium">{n.term}: </dt>
              <dd className="inline text-mist">{n.text}</dd>
            </div>
          ))}
        </dl>
      </Section>

      <Section
        id="funnels"
        index={5}
        title="CTA und DM-Funnels"
        intro={`Jedes Reel endet mit einem Keyword. ${FUNNEL_NOTE}`}
      >
        <Chain items={FUNNEL_FLOW} />
        <div className="mt-10 grid gap-10">
          {FUNNELS.map((f) => (
            <div key={f.keyword}>
              <h3 className="flex items-baseline gap-3">
                <span className="tech text-gold">{f.keyword}</span>
                <span className="text-sm text-mist">{f.label}</span>
              </h3>
              <ol className="mt-4 border-t border-white/[0.07]">
                {f.steps.map((s, i) => (
                  <li key={s.step} className="flex gap-4 border-b border-white/[0.07] py-4">
                    <span className="tech pt-1 text-fog">{i + 1}</span>
                    <div className="min-w-0 flex-1 text-sm leading-relaxed">
                      <p>
                        <strong className="font-medium">{s.step}</strong>
                        {s.text && <span className="text-mist">: {s.text}</span>}
                      </p>
                      {s.snippet && (
                        <div className="mt-3 flex items-start justify-between gap-3 border-l border-gold/60 pl-4">
                          <p className="font-display text-lg italic">„{s.snippet}“</p>
                          <CopyButton text={s.snippet} />
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      </Section>

      <Section id="squad" index={6} title="Natty Squad Broadcast" intro={SQUAD_INTRO}>
        <ul className="grid gap-px bg-white/[0.07] sm:grid-cols-2">
          {BROADCAST_TYPES.map((b) => (
            <li key={b.type} className="bg-ink p-5">
              <p className="text-sm">{b.type}</p>
              <p className="label mt-1 text-fog">{b.purpose}</p>
              <p className="mt-3 text-sm text-mist">{b.example}</p>
            </li>
          ))}
        </ul>
        <h3 className="label mt-12 text-gold">
          Checkliste pro Reel: Wie kommen Menschen in den Channel?
        </h3>
        <div className="mt-4">
          <WeekChecklist id="squad" items={SQUAD_CHECKLIST} />
        </div>
      </Section>

      <Section id="woche" index={7} title="Wochenrhythmus" intro={WEEK_INTRO}>
        <ul className="border-t border-white/[0.07]">
          {WEEK.map((w) => (
            <li
              key={w.day}
              className="grid gap-1 border-b border-white/[0.07] py-4 sm:grid-cols-[9rem_1fr_7rem] sm:gap-6"
            >
              <span className="text-sm">{w.day}</span>
              <span className="text-sm text-mist">{w.task}</span>
              <span className="tech text-fog sm:text-right">{w.time}</span>
            </li>
          ))}
        </ul>
        <div className="mt-10 border border-white/10 p-5">
          <p className="label text-gold">Notfallmodus · {EMERGENCY_MODE.time}</p>
          <ul className="mt-4 grid gap-2 text-sm">
            {EMERGENCY_MODE.tasks.map((t) => (
              <li key={t} className="flex gap-3">
                <span className="text-gold">·</span>
                {t}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-mist">{EMERGENCY_MODE.never}</p>
        </div>
      </Section>

      <Section id="kpis" index={8} title="Die 5 Zahlen" intro={KPI_SOURCE}>
        <KpiLog />
      </Section>

      <Section id="marke" index={9} title="NATYSIMO und Hybrid-Programm" intro={BRAND_PATH.intro}>
        <h3 className="label text-gold">NATYSIMO</h3>
        <div className="mt-4 grid gap-2">
          <Chain items={BRAND_PATH.path} />
          <p className="text-sm text-fog">Nicht sofort: {BRAND_PATH.notPath.join(' → ')}</p>
        </div>
        <p className="label mt-8 text-mist">Content-Ideen für Reel 5 und den Broadcast</p>
        <ul className="mt-3 grid gap-2 text-sm">
          {BRAND_PATH.ideas.map((idea) => (
            <li key={idea} className="flex gap-3">
              <span className="text-gold">·</span>
              {idea}
            </li>
          ))}
        </ul>

        <h3 className="label mt-12 text-gold">12-Wochen-Hybrid-Programm</h3>
        <p className="mt-3 text-sm text-mist">
          Das Programm wird nicht aggressiv verkauft. Die Reihenfolge ist fest:
        </p>
        <ol className="mt-4 grid gap-px bg-white/[0.07] sm:grid-cols-2">
          {HYBRID_STEPS.map((s, i) => (
            <li key={s} className="flex gap-4 bg-ink py-3">
              <span className="tech pt-0.5 text-fog">{String(i + 1).padStart(2, '0')}</span>
              <span className="text-sm">{s}</span>
            </li>
          ))}
        </ol>
        <p className="mt-6 text-sm text-mist">{HYBRID_NOTE}</p>
      </Section>

      <Section id="identitaet" index={10} title="Identität" intro={IDENTITY.summary}>
        <Chain items={IDENTITY.chain} />
        <h3 className="label mt-10 text-gold">Brand-Hierarchie</h3>
        <ol className="mt-4 border-t border-white/[0.07]">
          {IDENTITY.hierarchy.map((h, i) => (
            <li key={h} className="flex gap-4 border-b border-white/[0.07] py-3 text-sm">
              <span className="tech pt-0.5 text-fog">{i + 1}</span>
              {h}
            </li>
          ))}
        </ol>
        <p className="mt-6 text-sm text-mist">{IDENTITY.deutschNote}</p>
        <h3 className="label mt-10 text-gold">Story-Kette</h3>
        <div className="mt-4">
          <Chain items={IDENTITY.storyChain} open={IDENTITY.storyChainOpen} />
        </div>

        <h3 className="label mt-10 text-gold">Zielgruppe und Sprache</h3>
        <p className="mt-4 text-sm text-mist">{AUDIENCE.summary}</p>
        <dl className="mt-4 grid gap-3">
          {AUDIENCE.points.map((p) => (
            <div key={p.term} className="text-sm leading-relaxed">
              <dt className="inline font-medium">{p.term}: </dt>
              <dd className="inline text-mist">{p.text}</dd>
            </div>
          ))}
        </dl>
      </Section>
    </div>
  );
}
