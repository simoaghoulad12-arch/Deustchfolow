import type { Label as LabelKind } from '@/content/types';
import type { Bilingual } from '@/content/types';
import { pick, type Lang } from '@/lib/i18n';

/** Kennzeichnung jeder inhaltlichen Aussage (CLAUDE.md, Regel 2), Farben wie legacy (STL). */
const STYLES: Record<LabelKind, string> = {
  EXISTING: 'border-line bg-panel text-muted',
  IMPROVEMENT: 'border-ok bg-ok-soft text-ok',
  PROPOSAL: 'border-gold bg-gold-soft text-gold',
  'OFFENE ENTSCHEIDUNG': 'border-red bg-red-soft text-red',
};

export const LABEL_MEANING: Record<LabelKind, Bilingual> = {
  EXISTING: { de: 'Besteht bereits so in der Akademie.', ar: 'موجود من قبل فالأكاديمية.' },
  IMPROVEMENT: { de: 'Verbesserung des Bestehenden durch das System.', ar: 'تحسين للي كان موجود.' },
  PROPOSAL: { de: 'Vorschlag, noch nicht beschlossen.', ar: 'اقتراح، مازال ما تقررش.' },
  'OFFENE ENTSCHEIDUNG': { de: 'Muss die Leitung noch entscheiden.', ar: 'خاص الإدارة تقرر فيه.' },
};

export function Label({ kind, lang = 'de' }: { kind: LabelKind; lang?: Lang }) {
  return (
    <span
      title={pick(lang, LABEL_MEANING[kind])}
      dir="ltr"
      className={`inline-block whitespace-nowrap rounded border px-1.5 py-0.5 align-middle text-[11px] font-semibold tracking-wide ${STYLES[kind]}`}
    >
      {kind}
    </span>
  );
}

/** Aussage mit Kennzeichnung, z. B. in Listen von Standards und Regeln. */
export function Statement({
  kind,
  children,
  lang,
}: {
  kind: LabelKind;
  children: React.ReactNode;
  lang?: Lang;
}) {
  return (
    <p className="flex flex-wrap items-baseline gap-2">
      <Label kind={kind} lang={lang} />
      <span className="min-w-0 flex-1">{children}</span>
    </p>
  );
}

/** Erklärung aller vier Kennzeichnungen. */
export function LabelLegend({ lang }: { lang: Lang }) {
  return (
    <dl className="grid gap-2 sm:grid-cols-2">
      {(Object.keys(LABEL_MEANING) as LabelKind[]).map((k) => (
        <div key={k} className="flex flex-wrap items-baseline gap-2">
          <dt>
            <Label kind={k} lang={lang} />
          </dt>
          <dd className="text-sm text-muted">{pick(lang, LABEL_MEANING[k])}</dd>
        </div>
      ))}
    </dl>
  );
}
