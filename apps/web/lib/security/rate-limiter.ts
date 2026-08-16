/**
 * Simple in-memory fixed-window rate limiter.
 *
 * Deliberately not distributed — this is a single-process, in-memory
 * counter. That is enough for an MVP running as one Next.js instance, but
 * it does NOT share state across horizontally-scaled instances. If/when
 * DeutschFlow's frontend runs as more than one instance, this must move to
 * a shared store (e.g. Redis/Upstash) — swapping the implementation is
 * contained to this file because callers only depend on the `RateLimiter`
 * interface below, not on how counters are stored.
 */
export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterMs: number;
}

export class RateLimiter {
  private readonly hits = new Map<string, { count: number; windowStart: number }>();

  check(key: string, limit: number, windowMs: number): RateLimitResult {
    const now = Date.now();
    const entry = this.hits.get(key);

    if (!entry || now - entry.windowStart >= windowMs) {
      this.hits.set(key, { count: 1, windowStart: now });
      return { allowed: true, remaining: limit - 1, retryAfterMs: 0 };
    }

    if (entry.count >= limit) {
      return {
        allowed: false,
        remaining: 0,
        retryAfterMs: windowMs - (now - entry.windowStart),
      };
    }

    entry.count += 1;
    return { allowed: true, remaining: limit - entry.count, retryAfterMs: 0 };
  }

  /** Test-only escape hatch to avoid cross-test pollution of the singleton. */
  reset(): void {
    this.hits.clear();
  }
}

export const rateLimiter = new RateLimiter();
