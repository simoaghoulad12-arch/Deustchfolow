import bcrypt from 'bcryptjs';
import { z } from 'zod';

/**
 * bcrypt (via bcryptjs, pure JS — no native build step, avoids platform-
 * specific compilation risk in CI/deploy) with a cost factor of 12.
 * OWASP lists bcrypt as an acceptable modern password hash alongside
 * Argon2id; we chose it here for zero native-dependency risk. Never
 * plaintext, never reversible encryption, never a hand-rolled scheme.
 */
export const BCRYPT_COST_FACTOR = 12;

export async function hashPassword(plainPassword: string): Promise<string> {
  return bcrypt.hash(plainPassword, BCRYPT_COST_FACTOR);
}

export async function verifyPassword(plainPassword: string, passwordHash: string): Promise<boolean> {
  return bcrypt.compare(plainPassword, passwordHash);
}

/**
 * Length over arbitrary complexity rules (current OWASP guidance). Upper
 * bound guards against pathologically long inputs being pushed through
 * bcrypt (denial-of-service via CPU cost).
 */
export const passwordSchema = z
  .string()
  .min(10, 'Das Passwort muss mindestens 10 Zeichen lang sein.')
  .max(128, 'Das Passwort darf höchstens 128 Zeichen lang sein.')
  .regex(/[A-Za-z]/, 'Das Passwort muss mindestens einen Buchstaben enthalten.')
  .regex(/[0-9]/, 'Das Passwort muss mindestens eine Zahl enthalten.');
