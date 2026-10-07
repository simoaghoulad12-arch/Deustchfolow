/**
 * Liest alle Inhalte aus legacy/index.html und schreibt sie als JSON nach content/.
 * Aufruf: pnpm --filter @sda/app extract
 * Die Ausgabe ist deterministisch; ein erneuter Lauf ändert nichts, solange legacy/ gleich bleibt.
 */
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { LEVEL_KEYS } from '../content/types';
import { extractContent } from './extract';

const outDir = path.join(__dirname, '..', 'content');
const write = (file: string, data: unknown) =>
  writeFileSync(path.join(outDir, file), JSON.stringify(data, null, 2) + '\n', 'utf8');

const { lessons, ...rest } = extractContent();
for (const [name, data] of Object.entries(rest)) write(`${name}.json`, data);

// Stunden-Checklisten pro Level, damit die App nur das nötige Level laden muss.
rmSync(path.join(outDir, 'lessons'), { recursive: true, force: true });
mkdirSync(path.join(outDir, 'lessons'));
for (const k of LEVEL_KEYS)
  write(
    `lessons/${k}.json`,
    lessons.filter((l) => l.level === k),
  );

console.log(
  `content/: ${Object.keys(rest).length} Dateien + lessons/ (${lessons.length} Stunden) geschrieben`,
);
