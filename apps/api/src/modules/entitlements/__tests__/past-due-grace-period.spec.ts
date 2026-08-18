import { isWithinPastDueGracePeriod } from '../past-due-grace-period';

const NOW = new Date('2026-01-15T12:00:00Z');

describe('isWithinPastDueGracePeriod', () => {
  it('returns false when pastDueSince is null (never been PAST_DUE)', () => {
    expect(isWithinPastDueGracePeriod(null, 7, NOW)).toBe(false);
  });

  it('returns true just inside the grace window', () => {
    const pastDueSince = new Date(NOW.getTime() - 6 * 24 * 60 * 60 * 1000); // 6 days ago
    expect(isWithinPastDueGracePeriod(pastDueSince, 7, NOW)).toBe(true);
  });

  it('returns false exactly at the grace window boundary', () => {
    const pastDueSince = new Date(NOW.getTime() - 7 * 24 * 60 * 60 * 1000); // exactly 7 days ago
    expect(isWithinPastDueGracePeriod(pastDueSince, 7, NOW)).toBe(false);
  });

  it('returns false once the grace window has elapsed', () => {
    const pastDueSince = new Date(NOW.getTime() - 8 * 24 * 60 * 60 * 1000); // 8 days ago
    expect(isWithinPastDueGracePeriod(pastDueSince, 7, NOW)).toBe(false);
  });

  it('respects a configurable, non-default grace period length', () => {
    const pastDueSince = new Date(NOW.getTime() - 20 * 24 * 60 * 60 * 1000); // 20 days ago
    expect(isWithinPastDueGracePeriod(pastDueSince, 30, NOW)).toBe(true);
    expect(isWithinPastDueGracePeriod(pastDueSince, 7, NOW)).toBe(false);
  });

  it('defaults `now` to the current time when not supplied', () => {
    const pastDueSince = new Date(Date.now() - 1000);
    expect(isWithinPastDueGracePeriod(pastDueSince, 7)).toBe(true);
  });
});
