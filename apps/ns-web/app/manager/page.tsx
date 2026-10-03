import type { Metadata } from 'next';
import { IBM_Plex_Sans_Arabic } from 'next/font/google';
import type { CSSProperties, ReactNode } from 'react';
import { CopyButton } from '@/components/manager/CopyButton';
import { KpiLog } from '@/components/manager/KpiLog';
import { ReelReviewer } from '@/components/manager/ReelReviewer';
import { WeekChecklist } from '@/components/manager/WeekChecklist';
import {
  AUDIENCE,
  BRAND_PATH,
  BROADCAST_TYPES,
  CONTENT_TYPES,
  DECISION_RULES,
  EMERGENCY_MODE,
  FUNNEL_FLOW,
  FUNNEL_NOTE,
  FUNNELS,
  GOAL_CHAIN,
  GOLDEN_RULE,
  HYBRID_NOTE,
  HYBRID_STEPS,
  IDENTITY,
  KPI_SOURCE,
  MANAGER_META,
  NOT_NOW,
  PRE_QUESTIONS,
  PROTECTION_RULES,
  REEL_NOTES,
  REEL_SLOTS,
  REVIEW_RULE,
  RULES,
  RULES_INTRO,
  RULES_NOTE,
  SCRIPT_MARKS,
  SQUAD_CHECKLIST,
  SQUAD_INTRO,
  START_TOMORROW,
  SUNDAY_FLOW,
  WEEK,
  VERDICTS,
  WEEK_INTRO,
  buildReviewPrompt,
} from '@/lib/manager';

/**
 * The founder's private management system. Not linked anywhere, excluded
 * from the sitemap, disallowed in robots.txt and noindex — but anyone with
 * the URL can open it (there is no backend to log in against). Keep only
 * strategy and aggregate numbers here, never personal data. See ASSETS.md.
 */
const arabic = IBM_Plex_Sans_Arabic({
  subsets: ['arabic'],
  weight: ['400', '500', '600'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Manager',
  robots: { index: false, follow: false },
};

const SECTIONS = [
  ['sonntag', 'الحد'],
  ['reel-check', 'تشيك الريل'],
  ['nicht-jetzt', 'ماشي دابا'],
  ['regeln', 'القواعد'],
  ['reels', 'الريلز'],
  ['funnels', 'فانيل الديام'],
  ['squad', 'Squad'],
  ['woche', 'السيمانة'],
  ['kpis', 'الأرقام'],
  ['marke', 'NATYSIMO والهايبريد'],
  ['identitaet', 'الهوية'],
] as const;

function Chain({ items, open = false }: { items: readonly string[]; open?: boolean }) {
  return (
    <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
      {items.map((item, i) => (
        <span key={item} className="flex items-center gap-2">
          {i > 0 && <span className="text-gold">←</span>}
          {item}
        </span>
      ))}
      {open && (
        <span className="flex items-center gap-2 text-fog">
          <span className="text-gold">←</span> … (مازال مفتوح)
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
      <p className="tech text-fog" dir="ltr">
        {String(index).padStart(2, '0')}
      </p>
      <h2 className="mt-3 font-display text-4xl leading-none sm:text-5xl">{title}</h2>
      {intro && <p className="mt-5 max-w-2xl text-sm leading-relaxed text-mist">{intro}</p>}
      <div className="mt-8">{children}</div>
    </section>
  );
}

export default function ManagerPage() {
  return (
    <div
      lang="ar-MA"
      dir="rtl"
      className={`${arabic.className} mx-auto max-w-4xl px-4 pb-32 pt-28 sm:px-6`}
      style={
        {
          '--font-sans': arabic.style.fontFamily,
          '--font-display': arabic.style.fontFamily,
        } as CSSProperties
      }
    >
      <header>
        <p className="label text-mist">
          {MANAGER_META.date} · {MANAGER_META.author}
        </p>
        <h1 className="mt-4 font-display text-5xl leading-[0.95] sm:text-6xl">
          نظام المانجمنت <em className="text-gold">90 يوم</em>
        </h1>
        <p className="mt-5 font-display text-xl text-ivory/80" dir="ltr" lang="en">
          {IDENTITY.claim}
        </p>
        <p className="mt-6 max-w-2xl text-xs leading-relaxed text-fog">
          صفحة خاصة، ماكاين حتى لينك ليها. العلامات والأرقام كيتسجلو غير فهاد الجهاز.
        </p>
      </header>

      <nav aria-label="الأقسام" className="mt-10 flex flex-wrap gap-2">
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
        title="الحد = نهار المانجر"
        intro="كل حد كتشوف 15 دقيقة فـ 5 أرقام بالضبط، ومن بعد كتقرر شنو غادي تصور هاد السيمانة."
      >
        <h3 className="label text-gold">البداية · {START_TOMORROW.date}</h3>
        <div className="mt-4">
          <WeekChecklist id="start" items={START_TOMORROW.steps} />
        </div>

        <h3 className="label mt-12 text-gold">البرنامج ديال الحد</h3>
        <div className="mt-4">
          <WeekChecklist id="sunday" items={SUNDAY_FLOW} />
        </div>

        <h3 className="label mt-12 text-gold">قواعد القرار</h3>
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
        id="reel-check"
        index={2}
        title="تشيك الجودة ديال الريل"
        intro="كل ريل كيتراجع بصرامة قبل النشر، بحال إلا السمية ديالك هي اللي مكتوبة عليه. بلا مجاملة."
      >
        <div className="flex flex-col gap-3 border border-white/10 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-mist">
            نسخ البرومبت ديال المراجعة، ولصقو فـ Claude مع السكريبت، الترانسكريبت ولا الكابشن.
          </p>
          <CopyButton text={buildReviewPrompt()} label="نسخ البرومبت" />
        </div>

        <h3 className="label mt-10 text-gold">قبل ما تبدا، جاوب</h3>
        <dl className="mt-4 border-t border-white/[0.07]">
          {PRE_QUESTIONS.map((q) => (
            <div key={q.id} className="flex gap-4 border-b border-white/[0.07] py-4">
              <dt className="tech pt-0.5 text-fog">{q.id}</dt>
              <dd className="text-sm leading-relaxed">
                {q.question} <span className="text-mist">{q.rule}</span>
              </dd>
            </div>
          ))}
        </dl>

        <div className="mt-10 grid gap-8 sm:grid-cols-2">
          <div>
            <h3 className="label text-gold">الأحكام</h3>
            <ul className="mt-4 grid gap-2 text-sm">
              {VERDICTS.map((v) => (
                <li key={v.id}>
                  <span className="tech text-ivory">{v.label}</span>{' '}
                  <span className="text-mist">{v.when}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="label text-gold">علامات السكريبت</h3>
            <ul className="mt-4 grid gap-2 text-sm">
              {SCRIPT_MARKS.map((m) => (
                <li key={m.mark}>
                  <span className="tech text-ivory" dir="ltr">
                    {m.mark}
                  </span>{' '}
                  <span className="text-mist">{m.meaning}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <ul className="mt-10 grid gap-px bg-white/[0.07] sm:grid-cols-2">
          {CONTENT_TYPES.map((c) => (
            <li key={c.id} className="bg-ink py-4 sm:pe-4">
              <p className="tech text-ivory">{c.label}</p>
              <p className="mt-2 text-sm text-mist">{c.text}</p>
            </li>
          ))}
        </ul>
        <p className="mt-6 text-sm text-mist">{REVIEW_RULE}</p>

        <h3 className="label mt-12 text-gold">راجع الريلز</h3>
        <div className="mt-4">
          <ReelReviewer />
        </div>

        <div className="mt-12">
          <p className="label text-fog">القاعدة الذهبية</p>
          <div className="mt-3">
            <Chain items={GOLDEN_RULE.chain} />
          </div>
          <p className="mt-3 text-sm text-mist">{GOLDEN_RULE.text}</p>
        </div>
      </Section>

      <Section
        id="nicht-jetzt"
        index={3}
        title="ماشي دابا"
        intro="إلا جيتي بشي موضوع من هادو، الجواب هو: ماشي دابا. كل موضوع عندو سبب وشرط، ومن بعدو يقدر يرجع للطابلة."
      >
        <ul className="grid gap-px bg-white/[0.07]">
          {NOT_NOW.map((n) => (
            <li key={n.topic} className="grid gap-3 bg-ink py-5 sm:grid-cols-3 sm:gap-6">
              <p className="text-sm">{n.topic}</p>
              <p className="text-sm text-mist">
                <span className="label block text-fog">علاش ماشي دابا</span>
                {n.why}
              </p>
              <p className="text-sm text-mist">
                <span className="label block text-fog">يرجع مسموح ملي</span>
                {n.allowedWhen}
              </p>
            </li>
          ))}
        </ul>
      </Section>

      <Section id="regeln" index={4} title="قواعد المانجر" intro={RULES_INTRO}>
        <Chain items={GOAL_CHAIN} />
        <p className="mt-2 text-xs text-fog">ماشي مشاهدة ← مشاهدة ← مشاهدة</p>
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
        index={5}
        title="الستروكتور ديال الريلز"
        intro="كل سيمانة 4–5 ريلز، وعلى الأقل 2 منهم فيتنس. Deutsch بالدارجة ماكيفوتش 1 من 4–5."
      >
        <ul className="border-t border-white/[0.07]">
          {REEL_SLOTS.map((r) => (
            <li
              key={r.slot}
              className="grid gap-2 border-b border-white/[0.07] py-5 sm:grid-cols-[3rem_1fr_7rem] sm:gap-6"
            >
              <span className="tech text-fog">
                {r.slot}
                {r.optional && ' (اختياري)'}
              </span>
              <span>
                <span className="block text-sm">{r.topic}</span>
                <span className="mt-1 block font-display text-lg text-ivory/80">{r.hook}</span>
              </span>
              <span className="tech text-gold sm:text-end" dir="ltr">
                {r.ctas.join(' / ')}
              </span>
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
        index={6}
        title="CTA وفانيل الديام"
        intro={`كل ريل كيسالي بكلمة. ${FUNNEL_NOTE}`}
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
                        <div className="mt-3 flex items-start justify-between gap-3 border-s border-gold/60 ps-4">
                          <p className="font-display text-lg">«{s.snippet}»</p>
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

      <Section id="squad" index={7} title="Natty Squad Broadcast" intro={SQUAD_INTRO}>
        <ul className="grid gap-px bg-white/[0.07] sm:grid-cols-2">
          {BROADCAST_TYPES.map((b) => (
            <li key={b.type} className="bg-ink p-5">
              <p className="text-sm">{b.type}</p>
              <p className="label mt-1 text-fog">{b.purpose}</p>
              <p className="mt-3 text-sm text-mist">{b.example}</p>
            </li>
          ))}
        </ul>
        <h3 className="label mt-12 text-gold">الليستة لكل ريل: كيفاش الناس كيدخلو للقناة؟</h3>
        <div className="mt-4">
          <WeekChecklist id="squad" items={SQUAD_CHECKLIST} />
        </div>
      </Section>

      <Section id="woche" index={8} title="الريتم ديال السيمانة" intro={WEEK_INTRO}>
        <ul className="border-t border-white/[0.07]">
          {WEEK.map((w) => (
            <li
              key={w.day}
              className="grid gap-1 border-b border-white/[0.07] py-4 sm:grid-cols-[9rem_1fr_7rem] sm:gap-6"
            >
              <span className="text-sm">{w.day}</span>
              <span className="text-sm text-mist">{w.task}</span>
              <span className="tech text-fog sm:text-end">{w.time}</span>
            </li>
          ))}
        </ul>
        <div className="mt-10 border border-white/10 p-5">
          <p className="label text-gold">وضع الطوارئ · {EMERGENCY_MODE.time}</p>
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

      <Section id="kpis" index={9} title="الأرقام الخمسة" intro={KPI_SOURCE}>
        <KpiLog />
      </Section>

      <Section id="marke" index={10} title="NATYSIMO وبرنامج الهايبريد" intro={BRAND_PATH.intro}>
        <h3 className="label text-gold">NATYSIMO</h3>
        <div className="mt-4 grid gap-2">
          <Chain items={BRAND_PATH.path} />
          <p className="text-sm text-fog">ماشي ديريكت: {BRAND_PATH.notPath.join(' ← ')}</p>
        </div>
        <p className="label mt-8 text-mist">أفكار ديال المحتوى للريل 5 وللبرودكاست</p>
        <ul className="mt-3 grid gap-2 text-sm">
          {BRAND_PATH.ideas.map((idea) => (
            <li key={idea} className="flex gap-3">
              <span className="text-gold">·</span>
              {idea}
            </li>
          ))}
        </ul>

        <h3 className="label mt-12 text-gold">برنامج الهايبريد ديال 12 سيمانة</h3>
        <p className="mt-3 text-sm text-mist">البرنامج ماكيتباعش بالضغط. الترتيب ثابت:</p>
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

      <Section id="identitaet" index={11} title="الهوية" intro={IDENTITY.summary}>
        <Chain items={IDENTITY.chain} />
        <h3 className="label mt-10 text-gold">الترتيب ديال البراند</h3>
        <ol className="mt-4 border-t border-white/[0.07]">
          {IDENTITY.hierarchy.map((h, i) => (
            <li key={h} className="flex gap-4 border-b border-white/[0.07] py-3 text-sm">
              <span className="tech pt-0.5 text-fog">{i + 1}</span>
              {h}
            </li>
          ))}
        </ol>
        <p className="mt-6 text-sm text-mist">{IDENTITY.deutschNote}</p>
        <h3 className="label mt-10 text-gold">سلسلة القصة</h3>
        <div className="mt-4">
          <Chain items={IDENTITY.storyChain} open={IDENTITY.storyChainOpen} />
        </div>

        <h3 className="label mt-10 text-gold">الجمهور واللغة</h3>
        <p className="mt-4 text-sm text-mist">{AUDIENCE.summary}</p>
        <dl className="mt-4 grid gap-3">
          {AUDIENCE.points.map((p) => (
            <div key={p.term} className="text-sm leading-relaxed">
              <dt className="inline font-medium">{p.term}: </dt>
              <dd className="inline text-mist">{p.text}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-6 text-sm">{AUDIENCE.protectionIntro}</p>
        <ul className="mt-3 grid gap-2 text-sm text-mist">
          {PROTECTION_RULES.map((r) => (
            <li key={r} className="flex gap-3">
              <span className="text-gold">·</span>
              {r}
            </li>
          ))}
        </ul>
      </Section>
    </div>
  );
}
