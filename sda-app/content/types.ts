/**
 * Typen für alle Inhalte in content/*.json.
 * Die JSON-Dateien werden von scripts/extract-content.ts aus legacy/index.html erzeugt.
 * Nicht von Hand bearbeiten – stattdessen das Skript erneut laufen lassen (pnpm extract).
 */

export const LEVEL_KEYS = ['A1', 'A2', 'B1', 'B2'] as const;
export type LevelKey = (typeof LEVEL_KEYS)[number];

/** Kennzeichnung jeder inhaltlichen Aussage (aus legacy: STL). */
export const LABELS = ['EXISTING', 'IMPROVEMENT', 'PROPOSAL', 'OFFENE ENTSCHEIDUNG'] as const;
export type Label = (typeof LABELS)[number];

/** Prüfstatus für neue Inhalte (docs/CONTENT-STATUS.md). */
export type ReviewStatus = 'entwurf' | 'geprüft';

/** Deutscher Text mit arabischer Übersetzung (Darija). `ar` kann leer sein. */
export interface Bilingual {
  de: string;
  ar: string;
}

/** Wochentage wie in legacy: Mo–Do Grammatik, Fr/Sa Sprechen, So Mini-Test. */
export type Day = 'Mo' | 'Di' | 'Mi' | 'Do' | 'Fr' | 'Sa' | 'So';

/** Rollen-Kürzel der Checklisten (legacy: ROLE). */
export type RoleKey = 'H' | 'A' | 'N' | 'T' | 'ALL';

/** Phasen einer Stunde (legacy: PH). */
export type PhaseKey = 'v' | 'w' | 'n';

// ---------------------------------------------------------------- curriculum.json

/** Grammatik-Thema (legacy: "Titel|Kernpunkte;…|Beispiele;…|Wortschatz"). */
export interface GrammarTopic {
  /** Stunden-ID wie in legacy, z. B. "A1.1.Mo". */
  lessonId: string;
  day: Day;
  title: string;
  /** Kernpunkte */
  kern: string[];
  /** Beispielsätze */
  beispiele: string[];
  wortschatz: string;
}

/** Sprechthema (legacy: "Thema|Situation|Redemittel;…"). */
export interface SpeakingTopic {
  thema: string;
  situation: string;
  redemittel: string[];
}

export interface Module {
  /** z. B. "A1.1" */
  id: string;
  level: LevelKey;
  /** 1-basiert, entspricht der Woche in legacy */
  number: number;
  title: string;
  grammar: GrammarTopic[];
  speaking: SpeakingTopic;
}

export interface Level {
  key: LevelKey;
  name: string;
  goal: string;
  modules: Module[];
}

export interface Curriculum {
  levels: Level[];
}

// ---------------------------------------------------------------- objectives.json

/** Lernziele pro Modul („Am Ende dieser Einheit kann der Schüler …“). Schlüssel: Modul-ID. */
export type Objectives = Record<string, string[]>;

// ---------------------------------------------------------------- scripts.json

export interface Exercise {
  frage: string;
  loesung: string;
}

/** Vorlese-Skript einer Grammatikstunde (legacy SC: "Zeilen¶…§Darija§Frage›Antwort¦…§Hausaufgabe"). */
export interface LessonScript {
  lessonId: string;
  lines: string[];
  darija: string;
  exercises: Exercise[];
  hausaufgabe: string;
}

// ---------------------------------------------------------------- speaking.json

/** Sprechdialog und Fragekarten eines Moduls (legacy SPK: "Dialog¶…§Karte¦…"). */
export interface SpeakingDialogue {
  moduleId: string;
  dialog: string[];
  karten: string[];
}

// ---------------------------------------------------------------- probe.json

/** Abschnitt des Probestunden-Skripts (legacy PROBE: Zeit|Titel|Zeilen¶…|Darija). */
export interface ProbeSection {
  zeit: string;
  titel: string;
  lines: string[];
  darija: string;
}

// ---------------------------------------------------------------- platforms / standards / activities / templates / emergency

export interface Platform {
  zweck: string;
  empfehlung: string;
  warum: string;
  ar: string;
  alternative: string;
  hinweis: string;
}

export interface Standard {
  titel: string;
  ar: string;
  punkte: string[];
}

export interface Activity {
  name: string;
  niveau: string;
  dauer: string;
  tool: string;
  ablauf: string[];
  ziel: string;
  ar: string;
}

export interface Template {
  titel: string;
  text: string;
}

export interface EmergencyCase {
  fall: string;
  massnahme: string;
}

// ---------------------------------------------------------------- germany.json

export interface GermanyGroup {
  thema: string;
  lessonIds: string[];
}

// ---------------------------------------------------------------- lessons.json / checklists.json

export interface ChecklistItem {
  /** Stabile ID wie in legacy, z. B. "A1.1.Mo#3" – Schlüssel für checklist_progress. */
  id: string;
  role: RoleKey;
  /** Zeitpunkt oder Minutenbereich, z. B. "T–1 Tag" oder "20–55" */
  zeit: string;
  text: Bilingual;
}

export interface ChecklistGroup {
  /** Phase (Vorher/Während/Nachher) bei Stunden … */
  phase?: PhaseKey;
  /** … oder ein eigener Gruppenname. */
  name?: Bilingual;
  items: ChecklistItem[];
}

export type LessonType = 'g' | 's' | 't' | 'x';

export interface Lesson {
  id: string;
  type: LessonType;
  title: string;
  dauer: string;
  level?: LevelKey;
  moduleId?: string;
  day?: Day;
  /** Lehrkraft laut legacy-Rollenplan (nur Grammatik). PROPOSAL, siehe Offene Entscheidungen. */
  lead?: string;
  groups: ChecklistGroup[];
}

/** Einmalige Abläufe: Generalprobe, Probestunde, Einrichtung, Onboarding, Offene Entscheidungen. */
export type SpecialChecklistKey =
  'generalprobe' | 'probestunde' | 'einrichtung' | 'onboarding' | 'entscheidungen';
export type SpecialChecklists = Record<SpecialChecklistKey, Lesson>;

// ---------------------------------------------------------------- decisions.json

export interface OpenDecision {
  id: string;
  label: 'OFFENE ENTSCHEIDUNG';
  text: Bilingual;
}

// ---------------------------------------------------------------- statements.json

/** Gekennzeichnete Aussage aus den Seiten von legacy/index.html. */
export interface Statement {
  /** Seiten-Schlüssel wie in legacy (std, cur, lo, lsys, play, …) */
  page: string;
  /** Überschrift des Abschnitts (Karte), in dem die Aussage steht */
  section: string;
  label: Label;
  text: string;
}

// ---------------------------------------------------------------- lessonSystem.json

/** Die 9 Schritte des Lesson System mit Minuten (legacy: pageLsys, S9). */
export interface LessonSystemStep {
  nr: number;
  schritt: string;
  beschreibung: string;
  minutenGrammatik: string;
  minutenSprechen: string;
  labels: Label[];
}

// ---------------------------------------------------------------- pages.json

/** Vollständiger Text jeder Legacy-Seite (ein Block pro Zeile, Kennzeichnungen als [LABEL]). Referenz, damit nichts verloren geht. */
export type LegacyPages = Record<string, string[]>;

// ---------------------------------------------------------------- meta.json

export interface Meta {
  roles: Record<RoleKey, Bilingual>;
  phases: Record<PhaseKey, Bilingual>;
  days: Record<Day, Bilingual>;
  /** Navigation aus legacy (V2) */
  nav: { group: string; items: { key: string; label: Bilingual }[] }[];
}
