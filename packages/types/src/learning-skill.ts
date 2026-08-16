/** Core language skills exercises and lessons are organized around. */
export const LearningSkill = {
  GRAMMAR: 'GRAMMAR',
  VOCABULARY: 'VOCABULARY',
  LISTENING: 'LISTENING',
  READING: 'READING',
  WRITING: 'WRITING',
  SPEAKING: 'SPEAKING',
} as const;

export type LearningSkill = (typeof LearningSkill)[keyof typeof LearningSkill];
