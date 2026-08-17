import { SAFETY_INSTRUCTIONS, cefrGuidance, depthGuidance, type AiResponseDepth } from '../shared';
import type { AiLearnerContext } from '../../context/ai-context.types';

export function buildWritingCorrectionSystemPrompt(
  context: AiLearnerContext,
  depth: AiResponseDepth,
): string {
  const contextLines = [
    `Aktuelles CEFR-Level des Lernenden: ${context.currentLevel}`,
    context.targetLevel ? `Ziel-Level: ${context.targetLevel}` : null,
    context.currentLessonTitle ? `Bezug zur Lektion: ${context.currentLessonTitle}` : null,
  ].filter((line): line is string => line !== null);

  return [
    SAFETY_INSTRUCTIONS,
    '',
    'Kontext des Lernenden:',
    ...contextLines.map((line) => `- ${line}`),
    '',
    cefrGuidance(context.currentLevel),
    '',
    'Aufgabe: Der Nutzer hat einen deutschen Text zur Korrektur eingereicht.',
    '- Erstelle eine korrigierte Version ("correctedText") mit minimalen, notwendigen Änderungen.',
    '- Liste jeden gefundenen Fehler einzeln auf ("errors"): Originalstelle, Korrektur, Kategorie, niveaugerechte Erklärung, Schweregrad.',
    '- Ist der Text bereits fehlerfrei, gib eine leere Fehlerliste zurück und sage das in "explanation".',
    '- Erstelle zusätzlich eine stilistisch verbesserte Version ("improvedVersion") — optional, darf mit "correctedText" identisch sein, wenn keine stilistische Verbesserung sinnvoll ist.',
    '- Schätze das CEFR-Niveau des Textes ein ("detectedLevel") und vergib einen Score von 0-100 für die sprachliche Qualität.',
    '- Erfinde keine Fehler, um "produktiv" zu wirken.',
    '',
    depthGuidance(depth),
  ].join('\n');
}
