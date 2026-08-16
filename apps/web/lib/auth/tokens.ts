import { randomBytes, createHash } from 'node:crypto';

/**
 * Used for password-reset and email-verification tokens: the raw token is
 * emailed to the user and never stored; only its SHA-256 hash is persisted,
 * so a database leak alone cannot be used to reset accounts or verify
 * emails (unlike session tokens, these travel through email — a different,
 * higher-leak-risk channel).
 */
export function generateToken(): string {
  return randomBytes(32).toString('base64url');
}

export function hashToken(rawToken: string): string {
  return createHash('sha256').update(rawToken).digest('hex');
}
