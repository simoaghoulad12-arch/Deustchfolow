import type { Label as LabelKind } from '@/content/types';
import type { Lang } from '@/lib/i18n';
import { statementsOf } from '@/lib/statements';
import { Label } from './Label';

/**
 * Gekennzeichnete Aussagen einer Legacy-Seite als Karten pro Abschnitt (content/statements.json).
 * So stehen Regeln und Hinweise genau mit der Kennzeichnung aus legacy/index.html in der App.
 */
export function StatementSections({
  page,
  lang,
  sections,
  children,
}: {
  page: string;
  lang: Lang;
  /** nur diese Abschnitte, in dieser Reihenfolge */
  sections?: string[];
  /** zusätzlicher Inhalt je Abschnitt (z. B. unmarkierte Listen aus legacy) */
  children?: Partial<Record<string, React.ReactNode>>;
}) {
  const all = statementsOf(page);
  const order = sections ?? [...new Set(all.map((s) => s.section))];
  return (
    <div className="space-y-4">
      {order.map((section) => {
        const items = all.filter((s) => s.section === section);
        const headingLabels = items.filter((s) => s.text === section).map((s) => s.label);
        const rest = items.filter((s) => s.text !== section);
        return (
          <section key={section} className="card">
            <h2 className="mb-2 flex flex-wrap items-center gap-2 text-lg font-bold">
              {section}
              {headingLabels.map((l: LabelKind, i) => (
                <Label key={i} kind={l} lang={lang} />
              ))}
            </h2>
            {rest.length > 0 && (
              <ul className="de-content space-y-2">
                {rest.map((s, i) => (
                  <li key={i} className="flex flex-wrap items-baseline gap-2">
                    <Label kind={s.label} lang={lang} />
                    <span className="min-w-0 flex-1">{s.text}</span>
                  </li>
                ))}
              </ul>
            )}
            {children?.[section]}
          </section>
        );
      })}
    </div>
  );
}
