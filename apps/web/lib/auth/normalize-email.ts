/**
 * Single point of email normalization, used on every read and write path.
 * Prevents two accounts differing only by case (see architecture decision
 * record, section 9 database review).
 */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}
