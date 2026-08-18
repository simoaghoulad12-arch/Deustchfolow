/**
 * Pure predicate — no I/O, unit-testable without mocking Prisma. A
 * PENDING booking with no successful payment more than
 * `ttlMinutes` old has its slot released (Booking -> CANCELLED) so it
 * doesn't hold a tutor's calendar forever over an abandoned checkout.
 * `ttlMinutes` always comes from PaymentPolicy (Phase 6.1) — never a
 * hardcoded constant (see phase-6 implementation notes).
 */
export function isAbandoned(createdAt: Date, ttlMinutes: number, now: Date = new Date()): boolean {
  const ageMinutes = (now.getTime() - createdAt.getTime()) / 60_000;
  return ageMinutes >= ttlMinutes;
}
