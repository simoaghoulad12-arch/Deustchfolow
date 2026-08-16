import { rateLimiter, type RateLimiter } from './rate-limiter';

const MINUTE_MS = 60 * 1000;

/**
 * Limits chosen to blunt brute force / credential stuffing / registration
 * abuse without needing distributed infrastructure for the MVP (see
 * rate-limiter.ts for the scaling caveat). Each action is limited both per
 * IP (catches a single attacker hammering many accounts) and per account
 * identifier where applicable (catches distributed attacks against one
 * account).
 */
const LIMITS = {
  register: { limit: 5, windowMs: 15 * MINUTE_MS },
  login: { limit: 10, windowMs: 15 * MINUTE_MS },
  loginPerAccount: { limit: 5, windowMs: 15 * MINUTE_MS },
  passwordResetRequest: { limit: 3, windowMs: 15 * MINUTE_MS },
} as const;

export type RateLimitedAction = keyof typeof LIMITS;

export function checkAuthRateLimit(
  action: RateLimitedAction,
  key: string,
  limiter: RateLimiter = rateLimiter,
): boolean {
  const { limit, windowMs } = LIMITS[action];
  return limiter.check(`${action}:${key}`, limit, windowMs).allowed;
}
