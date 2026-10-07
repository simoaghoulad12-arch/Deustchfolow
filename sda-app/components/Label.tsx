import type { Label as LabelKind } from '@/content/types';

const STYLES: Record<LabelKind, string> = {
  EXISTING: 'border-line text-muted',
  IMPROVEMENT: 'border-ink text-ink',
  PROPOSAL: 'border-gold text-gold',
  'OFFENE ENTSCHEIDUNG': 'border-red text-red',
};

/** Kennzeichnung einer inhaltlichen Aussage (CLAUDE.md, Regel 2). Ausbau in Phase 3. */
export function Label({ kind }: { kind: LabelKind }) {
  return (
    <span
      className={`inline-block rounded border px-1.5 py-0.5 align-middle text-xs font-semibold tracking-wide ${STYLES[kind]}`}
    >
      {kind}
    </span>
  );
}
