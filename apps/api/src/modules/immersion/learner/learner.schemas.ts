import { z } from 'zod';

const level = z.enum(['A1', 'A2', 'B1', 'B2']);
const languageCode = z.string().regex(/^[a-z]{2}$/);
const goal = z.enum(['work', 'travel', 'study', 'everyday', 'exam', 'relocation', 'personal']);
const style = z.enum(['speaking', 'listening', 'reading', 'writing', 'grammar', 'vocabulary', 'mixed']);
const minutes = z.number().int().min(5).max(120);

export const OnboardingSchema = z
  .object({
    targetLanguage: languageCode,
    nativeLanguage: languageCode,
    level: z.union([level, z.literal('unknown')]),
    goals: z.array(goal).min(1).max(7),
    dailyMinutes: minutes,
    learningStyles: z.array(style).min(1).max(7),
    personalGoal: z.string().trim().max(280).optional().default(''),
    displayName: z.string().trim().min(1).max(60).optional(),
  })
  .strict();

export const ProfileUpdateSchema = z
  .object({
    displayName: z.string().trim().min(1).max(60).optional(),
    avatarUrl: z.string().url().max(500).optional(),
    targetLanguage: languageCode.optional(),
    nativeLanguage: languageCode.optional(),
    level: level.optional(),
    goals: z.array(goal).min(1).max(7).optional(),
    dailyMinutes: minutes.optional(),
    learningStyles: z.array(style).min(1).max(7).optional(),
    personalGoal: z.string().trim().max(280).optional(),
  })
  .strict();

export type OnboardingInput = z.infer<typeof OnboardingSchema>;
export type ProfileUpdateInput = z.infer<typeof ProfileUpdateSchema>;
