/**
 * DeutschFlow role model — functional capacity in the system, deliberately
 * separate from commercial plan (see SubscriptionPlan). GUEST is not part
 * of this type: it is never a persisted role, only the absence of a
 * session (see EffectiveRole below).
 */
export const UserRole = {
  STUDENT: 'STUDENT',
  TUTOR: 'TUTOR',
  CONTENT_EDITOR: 'CONTENT_EDITOR',
  SUPPORT: 'SUPPORT',
  ADMIN: 'ADMIN',
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

/** UI/route-guard-only union — GUEST exists here, never in the database. */
export type EffectiveRole = UserRole | 'GUEST';
