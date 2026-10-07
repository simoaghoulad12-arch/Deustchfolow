import statements from '@/content/statements.json';
import type { Label, Statement } from '@/content/types';

const all = statements as Statement[];

/** Gekennzeichnete Aussagen einer Legacy-Seite (content/statements.json). */
export const statementsOf = (page: string) => all.filter((s) => s.page === page);

/** Kennzeichnung der Seite selbst (in legacy direkt an der Überschrift). */
export function pageLabel(page: string): Label | undefined {
  return all.find((s) => s.page === page && s.text === s.section)?.label;
}
