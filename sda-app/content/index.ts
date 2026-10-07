/**
 * Typisierter Zugriff auf alle Inhalte in content/.
 * Die JSON-Dateien kommen aus scripts/extract-content.ts (Quelle: legacy/index.html).
 */
import activities from './activities.json';
import checklists from './checklists.json';
import curriculum from './curriculum.json';
import decisions from './decisions.json';
import emergency from './emergency.json';
import germany from './germany.json';
import lessonSystem from './lessonSystem.json';
import lessonsA1 from './lessons/A1.json';
import lessonsA2 from './lessons/A2.json';
import lessonsB1 from './lessons/B1.json';
import lessonsB2 from './lessons/B2.json';
import meta from './meta.json';
import objectives from './objectives.json';
import pages from './pages.json';
import platforms from './platforms.json';
import probe from './probe.json';
import scripts from './scripts.json';
import speaking from './speaking.json';
import standards from './standards.json';
import statements from './statements.json';
import templates from './templates.json';
import type {
  Activity,
  Curriculum,
  EmergencyCase,
  GermanyGroup,
  LegacyPages,
  Lesson,
  LessonScript,
  LessonSystemStep,
  LevelKey,
  Meta,
  Objectives,
  OpenDecision,
  Platform,
  ProbeSection,
  SpecialChecklists,
  SpeakingDialogue,
  Standard,
  Statement,
  Template,
} from './types';

export * from './types';

export const content = {
  curriculum: curriculum as Curriculum,
  objectives: objectives as Objectives,
  scripts: scripts as LessonScript[],
  speaking: speaking as SpeakingDialogue[],
  probe: probe as ProbeSection[],
  platforms: platforms as Platform[],
  standards: standards as Standard[],
  activities: activities as Activity[],
  templates: templates as Template[],
  emergency: emergency as EmergencyCase[],
  germany: germany as GermanyGroup[],
  lessonsByLevel: { A1: lessonsA1, A2: lessonsA2, B1: lessonsB1, B2: lessonsB2 } as Record<
    LevelKey,
    Lesson[]
  >,
  checklists: checklists as SpecialChecklists,
  decisions: decisions as OpenDecision[],
  statements: statements as Statement[],
  lessonSystem: lessonSystem as LessonSystemStep[],
  pages: pages as LegacyPages,
  meta: meta as Meta,
};

/** Alle Stunden A1–B2 in der Reihenfolge der App (Level-Start, dann pro Woche Mo–So). */
export const allLessons = (): Lesson[] => Object.values(content.lessonsByLevel).flat();
