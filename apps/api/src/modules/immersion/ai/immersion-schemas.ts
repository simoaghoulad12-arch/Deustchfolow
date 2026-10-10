import { z } from 'zod';

/**
 * Zod schemas for every structured AI output in the immersion module.
 * AiService validates each provider response against these before any
 * service sees it — a malformed answer becomes a controlled fallback,
 * never broken data in the database or UI.
 */

const score = z.number().min(0).max(100);

export const MistakeCategorySchema = z.enum([
  'GRAMMAR',
  'VOCABULARY',
  'PRONUNCIATION',
  'SENTENCE_STRUCTURE',
  'WORD_CHOICE',
  'SPELLING',
  'REGISTER',
]);

export const CorrectionSchema = z.object({
  original: z.string().min(1).max(500),
  better: z.string().min(1).max(500),
  explanation: z.string().min(1).max(600),
  category: MistakeCategorySchema,
  reuseTip: z.string().max(300).optional(),
});

export const MissionTurnSchema = z.object({
  reply: z.string().min(1).max(1200),
  correction: CorrectionSchema.nullable(),
  criteriaMet: z.array(z.string()).max(20),
  objectiveComplete: z.boolean(),
  scores: z.object({ grammar: score, vocabulary: score, fluency: score, task: score }),
});

export const MissionHintSchema = z.object({ text: z.string().min(1).max(600) });

export const ChaosTwistSchema = z.object({
  title: z.string().min(1).max(120),
  situation: z.string().min(1).max(600),
  openingLine: z.string().min(1).max(400),
});

export const EvaluationSchema = z.object({
  scores: z.object({
    grammar: score,
    vocabulary: score,
    fluency: score,
    naturalness: score,
    pronunciation: score.nullable(),
    coherence: score.nullable(),
  }),
  feedback: z.string().min(1).max(1200),
  corrections: z.array(CorrectionSchema).max(8),
  improvedVersion: z.string().max(4000),
  tone: z
    .object({ detected: z.string().max(40), matchesTarget: z.boolean(), explanation: z.string().max(600) })
    .nullable(),
});

export const CoachSchema = z.object({
  headline: z.string().min(1).max(240),
  insights: z.array(z.string().min(1).max(300)).min(1).max(5),
  recommendationReason: z.string().min(1).max(300),
});

export type MissionTurn = z.infer<typeof MissionTurnSchema>;
export type Evaluation = z.infer<typeof EvaluationSchema>;
