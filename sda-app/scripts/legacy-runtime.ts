/**
 * Lädt legacy/index.html in einer abgeschotteten Node-VM und gibt Zugriff auf die
 * Original-Daten (LV, SC, SPK, …) und Funktionen (getLesson, probeLessons, page…).
 *
 * Warum VM statt Text-Parsing: Die Checklisten werden in legacy/ von Funktionen erzeugt
 * und die Kennzeichnungen (EXISTING, IMPROVEMENT, PROPOSAL, OFFENE ENTSCHEIDUNG) stehen
 * im Seiten-Code. Nur wenn wir den Original-Code ausführen, geht nichts verloren.
 * legacy/index.html wird nur gelesen, nie verändert.
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

export const LEGACY_PATH = path.join(__dirname, '..', 'legacy', 'index.html');

/** Schluckt jeden DOM-Zugriff des Legacy-Codes (document, window, …). */
function sink(): unknown {
  const fn = function () {};
  return new Proxy(fn, {
    get: (_t, key) => {
      if (key === Symbol.toPrimitive) return () => '';
      if (key === 'length') return 0;
      return sink();
    },
    apply: () => sink(),
    construct: () => sink() as object,
    set: () => true,
  });
}

/** 2026-01-05 (Montag), 10:00 UTC – beliebig, aber fest. */
const FIXED_NOW = Date.UTC(2026, 0, 5, 10, 0, 0);

export interface LegacyRuntime {
  /** Wert einer Variable oder Funktion aus dem Legacy-Skript. */
  get<T = unknown>(name: string): T;
  /** Ausdruck im Kontext des Legacy-Skripts auswerten. */
  run<T = unknown>(code: string): T;
}

export function loadLegacy(file: string = LEGACY_PATH): LegacyRuntime {
  const html = readFileSync(file, 'utf8');
  const match = /<script>([\s\S]*?)<\/script>/.exec(html);
  if (!match?.[1]) throw new Error('Kein <script> in ' + file);
  // Die IIFE-Hülle entfernen, damit die Variablen im VM-Kontext erreichbar sind.
  const js = match[1].replace(/^\s*\(function\(\)\{/, '').replace(/\}\)\(\);\s*$/, '');

  const storage = { getItem: () => null, setItem: () => undefined, removeItem: () => undefined };
  const context = vm.createContext({
    document: sink(),
    window: sink(),
    navigator: sink(),
    location: sink(),
    history: sink(),
    localStorage: storage,
    sessionStorage: storage,
    setTimeout: () => 0,
    clearTimeout: () => undefined,
    setInterval: () => 0,
    clearInterval: () => undefined,
    matchMedia: () => ({ matches: false, addEventListener: () => undefined }),
    console: { log: () => undefined, warn: () => undefined, error: () => undefined },
  });
  // Festes Datum, damit datumsabhängige Seiten (Heute, Dashboard) reproduzierbar sind.
  vm.runInContext(
    `var __RealDate = Date;
     Date = class extends __RealDate {
       constructor(...a) { if (a.length) super(...a); else super(${FIXED_NOW}); }
       static now() { return ${FIXED_NOW}; }
     };`,
    context,
  );
  vm.runInContext(js, context, { timeout: 10_000, filename: 'legacy/index.html' });

  const run = <T>(code: string): T =>
    // JSON-Rundreise: Objekte aus der VM werden zu normalen Objekten dieses Prozesses.
    JSON.parse(vm.runInContext(`JSON.stringify(${code})`, context) ?? 'null') as T;
  return { run, get: <T>(name: string) => run<T>(name) };
}

/** Funktionen werden nicht serialisiert; für Seiten-HTML gibt es diesen Zugang. */
export function renderLegacyPage(rt: LegacyRuntime, setup: string, call: string): string {
  return rt.run<string>(`(function(){${setup};return ${call};})()`);
}
