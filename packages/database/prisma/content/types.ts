/** Content-authoring helpers shared by the seed files. Kept local to the seed so the runtime packages stay lean. */
export type Level = 'A1' | 'A2' | 'B1' | 'B2';
export type Skill = 'GRAMMAR' | 'VOCABULARY' | 'READING' | 'LISTENING' | 'WRITING' | 'SPEAKING';

export interface Criterion {
  id: string;
  description: string;
  keywords: string[];
  pattern: string;
  example: string;
  npcPrompt: string;
  npcReaction: string;
}

export function crit(
  id: string,
  description: string,
  keywords: string[],
  pattern: string,
  example: string,
  npcPrompt: string,
  npcReaction: string,
): Criterion {
  return { id, description, keywords, pattern, example, npcPrompt, npcReaction };
}

export interface MissionDef {
  slug: string;
  lang: string;
  env: string;
  character: string;
  mode?: 'MISSION' | 'CHAOS' | 'STORY' | 'DEBATE';
  title: string;
  description: string;
  objective: string;
  scenario: string;
  level: Level;
  difficulty: number;
  skills: Skill[];
  minutes: number;
  xp?: number;
  keyPhrases: [string, string][];
  grammarFocus?: string;
  opening: string;
  criteria: Criterion[];
  closingLine?: string;
  extra?: Record<string, unknown>;
  story?: string;
  chapter?: number;
}
