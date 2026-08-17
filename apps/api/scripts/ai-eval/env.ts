import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

/**
 * Minimal, dependency-free .env loader for standalone scripts under
 * scripts/ (these never run through Nest's ConfigModule bootstrap). Only
 * fills variables that are not already set in the real process
 * environment — an exported shell var always wins over the file. Never
 * logs values, only which keys were found.
 */
function loadEnvFile(path: string): void {
  if (!existsSync(path)) return;

  const content = readFileSync(path, 'utf-8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;

    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

loadEnvFile(join(__dirname, '../../.env'));
