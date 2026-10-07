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

const { lessons, readouts, ...rest } = extractContent();
for (const [name, data] of Object.entries(rest)) write(`${name}.json`, data);

// Stunden-Checklisten pro Level, damit die App nur das nötige Level laden muss.
rmSync(path.join(outDir, 'lessons'), { recursive: true, force: true });
mkdirSync(path.join(outDir, 'lessons'));
for (const k of LEVEL_KEYS)
  write(
    `lessons/${k}.json`,
    lessons.filter((l) => l.level === k),
  );

// Vorlese-Skripte pro Level (+ Probestunde)
rmSync(path.join(outDir, 'readouts'), { recursive: true, force: true });
mkdirSync(path.join(outDir, 'readouts'));
const byPrefix = (prefix: string) =>
  Object.fromEntries(Object.entries(readouts).filter(([id]) => id.startsWith(prefix)));
for (const k of LEVEL_KEYS) write(`readouts/${k}.json`, byPrefix(`${k}.`));
write('readouts/probe.json', byPrefix('probe.'));

console.log(
  `content/: ${Object.keys(rest).length} Dateien + lessons/ (${lessons.length} Stunden) + readouts/ (${Object.keys(readouts).length} Skripte) geschrieben`,
);
