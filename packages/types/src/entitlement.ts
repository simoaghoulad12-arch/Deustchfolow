import { SubscriptionPlan } from './subscription';

/**
 * Fine-grained feature flags. Feature access is always checked via
 * `canAccess(user, entitlement)` — never via `user.role === 'PREMIUM'` or
 * any other role-based check. See
 * docs/architecture-decisions/phase-1.5-identity-auth-entitlements.md.
 */
export const Entitlement = {
  BASIC_LEARNING: 'BASIC_LEARNING',
  BASIC_PROGRESS: 'BASIC_PROGRESS',
  LIMITED_AI: 'LIMITED_AI',
  AI_ADVANCED: 'AI_ADVANCED',
  WRITING_ADVANCED: 'WRITING_ADVANCED',
  SPEAKING_ADVANCED: 'SPEAKING_ADVANCED',
  EXAM_PREPARATION: 'EXAM_PREPARATION',
} as const;

export type Entitlement = (typeof Entitlement)[keyof typeof Entitlement];

/**
 * Single source of truth mapping a plan to its default entitlements. Adding
 * a plan or a feature is a change to this config, not a code-path change in
 * every controller that checks access.
 */
export const PLAN_ENTITLEMENTS: Record<SubscriptionPlan, readonly Entitlement[]> = {
  [SubscriptionPlan.FREE]: [
    Entitlement.BASIC_LEARNING,
    Entitlement.BASIC_PROGRESS,
    Entitlement.LIMITED_AI,
  ],
  [SubscriptionPlan.PREMIUM]: [
    Entitlement.BASIC_LEARNING,
    Entitlement.BASIC_PROGRESS,
    Entitlement.AI_ADVANCED,
    Entitlement.WRITING_ADVANCED,
  ],
  [SubscriptionPlan.PRO]: [
    Entitlement.BASIC_LEARNING,
    Entitlement.BASIC_PROGRESS,
    Entitlement.AI_ADVANCED,
    Entitlement.WRITING_ADVANCED,
    Entitlement.SPEAKING_ADVANCED,
    Entitlement.EXAM_PREPARATION,
  ],
};
