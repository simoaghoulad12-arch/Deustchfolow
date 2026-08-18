import { SAFETY_INSTRUCTIONS, cefrGuidance, depthGuidance, type AiResponseDepth } from '../shared';
import type { AiLearnerContext } from '../../context/ai-context.types';

export interface SimulationPromptContent {
  title: string;
  situation: string;
  goal: string;
  roles: string[];
  cefrLevel: string;
}

/**
 * Real-Life Simulations (spec section 15) reuse the exact same
 * TutorResponseSchema structured-output contract as the general AI
 * tutor — the only difference is this system prompt, which puts the
 * model in the counterpart role(s) for a specific everyday scenario
 * (e.g. "Du möchtest einen Arzttermin telefonisch vereinbaren.")
 * instead of acting as a tutor answering open questions. `roles` and
 * `situation` come from an admin-authored Simulation row, never
 * generated here.
 */
export function buildSimulationSystemPrompt(
  context: AiLearnerContext,
  depth: AiResponseDepth,
  simulation: SimulationPromptContent,
): string {
  const contextLines = [
    `Aktuelles CEFR-Level des Lernenden: ${context.currentLevel}`,
    // Quoted — see SAFETY_INSTRUCTIONS / tutor.prompt.ts for why
    // (learningGoal is client-settable free text, Phase 6.5 audit).
    context.learningGoal ? `Lernziel: "${context.learningGoal}"` : null,
  ].filter((line): line is string => line !== null);

  return [
    SAFETY_INSTRUCTIONS,
    '',
    'Kontext des Lernenden:',
    ...contextLines.map((line) => `- ${line}`),
    '',
    cefrGuidance(context.currentLevel),
    '',
    `Aufgabe: Du spielst eine Alltagssimulation namens "${simulation.title}" (Zielniveau ${simulation.cefrLevel}).`,
    `Situation: ${simulation.situation}`,
    `Ziel des Lernenden: ${simulation.goal}`,
    simulation.roles.length > 0
      ? `Deine Rolle(n) in diesem Dialog: ${simulation.roles.join(', ')}.`
      : null,
    '',
    'Bleibe konsequent in deiner Rolle und reagiere realistisch auf das, was der',
    'Lernende schreibt oder sagt — wie eine echte Person in dieser Situation',
    'reagieren würde (z. B. eine Arzthelferin am Telefon, ein Bankangestellter am',
    'Schalter). Antworte NICHT als Deutschlehrer, außer über die "corrections"-',
    'und "explanation"-Felder, die weiterhin sprachliche Fehler des Lernenden',
    'aufgreifen — die Rollen-Antwort selbst gehört in "response".',
    '',
    depthGuidance(depth),
  ]
    .filter((line): line is string => line !== null)
    .join('\n');
}
