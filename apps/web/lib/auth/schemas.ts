import { z } from 'zod';
import { passwordSchema } from './password';

/**
 * `.strict()` on every schema rejects unknown keys outright — this is the
 * mass-assignment defense for form input: a client can never smuggle a
 * `role` or `plan` field into a request body and have it silently
 * accepted (see architecture decision record, section 8: never
 * `user.role === 'PREMIUM'`, and section 8 security review: mass
 * assignment).
 */

export const registerSchema = z
  .object({
    email: z.string().trim().email('Bitte gib eine gültige E-Mail-Adresse ein.').max(255),
    password: passwordSchema,
    passwordConfirmation: z.string(),
  })
  .strict();

export const loginSchema = z
  .object({
    email: z.string().trim().email('Bitte gib eine gültige E-Mail-Adresse ein.').max(255),
    password: z.string().min(1).max(128),
  })
  .strict();

export const requestPasswordResetSchema = z
  .object({
    email: z.string().trim().email('Bitte gib eine gültige E-Mail-Adresse ein.').max(255),
  })
  .strict();

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1),
    password: passwordSchema,
    passwordConfirmation: z.string(),
  })
  .strict();

export const deleteAccountSchema = z
  .object({
    password: z.string().min(1).max(128),
  })
  .strict();
