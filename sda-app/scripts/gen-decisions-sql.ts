/**
 * Erzeugt die Migration, die die offenen Entscheidungen aus content/decisions.json
 * (Quelle: legacy/index.html, openLesson) in die Tabelle decisions schreibt.
 * Aufruf: pnpm --filter @sda/app gen:decisions
 */
import { writeFileSync } from 'node:fs';
import path from 'node:path';
import decisions from '../content/decisions.json';

export const DECISIONS_MIGRATION = path.join(
  __dirname,
  '..',
  'supabase',
  'migrations',
  '20261007120100_seed_decisions.sql',
);

const q = (s: string) => `'${s.replace(/'/g, "''")}'`;

export function decisionsSql(): string {
  const rows = decisions.map((d, i) => `  (${q(d.id)}, ${q(d.text.de)}, ${q(d.text.ar)}, ${i})`);
  return [
    '-- Generiert von scripts/gen-decisions-sql.ts aus content/decisions.json – nicht von Hand ändern.',
    '-- Startinhalt: die offenen Entscheidungen aus legacy/index.html (alle Status = offen).',
    'insert into public.decisions (id, title, title_ar, sort_order) values',
    rows.join(',\n'),
    'on conflict (id) do nothing;',
    '',
  ].join('\n');
}

if (require.main === module) {
  writeFileSync(DECISIONS_MIGRATION, decisionsSql(), 'utf8');
  console.log(`${path.basename(DECISIONS_MIGRATION)}: ${decisions.length} Entscheidungen`);
}
