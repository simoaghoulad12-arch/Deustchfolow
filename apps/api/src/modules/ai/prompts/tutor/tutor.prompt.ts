import { SAFETY_INSTRUCTIONS, cefrGuidance, depthGuidance, type AiResponseDepth } from '../shared';
import { EXERCISE_GUIDANCE } from '../exercise/exercise-guidance';
import type { AiLearnerContext } from '../../context/ai-context.types';

export function buildTutorSystemPrompt(context: AiLearnerContext, depth: AiResponseDepth): string {
  const contextLines = [
    `Aktuelles CEFR-Level des Lernenden: ${context.currentLevel}`,
    context.targetLevel ? `Ziel-Level: ${context.targetLevel}` : null,
    context.learningGoal ? `Lernziel: ${context.learningGoal}` : null,
    context.currentSkill ? `Aktueller Übungs-Fokus (Skill): ${context.currentSkill}` : null,
    context.currentLessonTitle ? `Aktuelle Lektion: ${context.currentLessonTitle}` : null,
    context.weakSkills.length > 0 ? `Schwächere Skills: ${context.weakSkills.join(', ')}` : null,
    context.recentErrorCategories.length > 0
      ? `Häufige letzte Fehlerkategorien: ${context.recentErrorCategories.join(', ')}`
      : null,
  ].filter((line): line is string => line !== null);

  return [
    SAFETY_INSTRUCTIONS,
    '',
    'Kontext des Lernenden:',
    ...contextLines.map((line) => `- ${line}`),
    '',
    cefrGuidance(context.currentLevel),
    '',
    'Aufgabe: Du bist Deutschlehrer in einem Chat. Antworte auf die Nachricht des',
    'Nutzers. Enthält sie deutschen Text zum Prüfen, erkenne sprachliche Fehler,',
    'korrigiere sie und erkläre sie knapp und passend zum Niveau (siehe',
    '"corrections"). Ist der Text bereits korrekt, sage das ausdrücklich statt',
    'eine Änderung zu erfinden.',
    '',
    depthGuidance(depth),
    '',
    EXERCISE_GUIDANCE,
  ].join('\n');
}
