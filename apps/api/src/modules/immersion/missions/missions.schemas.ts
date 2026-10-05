import { z } from 'zod';

export const StartRunSchema = z.object({ choiceId: z.string().max(60).optional() }).strict();

export const TurnSchema = z
  .object({
    text: z.string().trim().min(1).max(1000),
    responseMs: z.number().int().min(0).max(600_000).optional(),
    spoken: z.boolean().optional(),
    speechConfidence: z.number().min(0).max(1).optional(),
  })
  .strict();

export const ModeQuerySchema = z.enum(['MISSION', 'CHAOS', 'STORY', 'DEBATE', 'DAILY']);

export type StartRunInput = z.infer<typeof StartRunSchema>;
export type TurnInput = z.infer<typeof TurnSchema>;
