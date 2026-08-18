import { isAbandoned } from '../abandoned-booking';

describe('isAbandoned (pure function)', () => {
  const now = new Date('2026-01-01T12:00:00Z');

  it('is false for a booking created within the TTL window', () => {
    const createdAt = new Date('2026-01-01T11:50:00Z'); // 10 min old
    expect(isAbandoned(createdAt, 15, now)).toBe(false);
  });

  it('is true once the booking age reaches the TTL exactly', () => {
    const createdAt = new Date('2026-01-01T11:45:00Z'); // exactly 15 min old
    expect(isAbandoned(createdAt, 15, now)).toBe(true);
  });

  it('is true for a booking well past the TTL', () => {
    const createdAt = new Date('2026-01-01T10:00:00Z'); // 2h old
    expect(isAbandoned(createdAt, 15, now)).toBe(true);
  });

  it('respects a different configured TTL (never a hardcoded 15)', () => {
    const createdAt = new Date('2026-01-01T11:50:00Z'); // 10 min old
    expect(isAbandoned(createdAt, 5, now)).toBe(true);
    expect(isAbandoned(createdAt, 30, now)).toBe(false);
  });
});
