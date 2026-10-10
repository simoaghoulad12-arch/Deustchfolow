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
import readoutsA1 from './readouts/A1.json';
import readoutsA2 from './readouts/A2.json';
import readoutsB1 from './readouts/B1.json';
import readoutsB2 from './readouts/B2.json';
import readoutsProbe from './readouts/probe.json';
import scripts from './scripts.json';
import speaking from './speaking.json';
import standards from './standards.json';
import statements from './statements.json';
import templates from './templates.json';
import weeklyRoutine from './weeklyRoutine.json';
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
  Readouts,
  RoutineDay,
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
  readouts: {
    ...readoutsA1,
    ...readoutsA2,
    ...readoutsB1,
    ...readoutsB2,
    ...readoutsProbe,
  } as Readouts,
  checklists: checklists as SpecialChecklists,
  decisions: decisions as OpenDecision[],
  statements: statements as Statement[],
  lessonSystem: lessonSystem as LessonSystemStep[],
  weeklyRoutine: weeklyRoutine as RoutineDay[],
  pages: pages as LegacyPages,
  meta: meta as Meta,
};

/** Stunde (oder einmaliger Ablauf wie Probestunde) zu einer ID, sonst undefined. */
export function findLesson(id: string): Lesson | undefined {
  const special = Object.values(content.checklists).find((l) => l.id === id);
  if (special) return special;
  const level = id.split('.')[0] as LevelKey;
  return content.lessonsByLevel[level]?.find((l) => l.id === id);
}

/** Alle Stunden A1–B2 in der Reihenfolge der App (Level-Start, dann pro Woche Mo–So). */
export const allLessons = (): Lesson[] => Object.values(content.lessonsByLevel).flat();
