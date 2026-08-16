/**
 * Planned DeutschFlow role model.
 * Authorization logic is implemented in a later phase — this is the shared
 * type definition other packages/apps can already build against.
 */
export const UserRole = {
  GUEST: 'GUEST',
  STUDENT_FREE: 'STUDENT_FREE',
  STUDENT_PREMIUM: 'STUDENT_PREMIUM',
  TUTOR: 'TUTOR',
  CONTENT_EDITOR: 'CONTENT_EDITOR',
  ADMIN: 'ADMIN',
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];
