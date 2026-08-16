import { RateLimiter } from '../rate-limiter';

describe('RateLimiter', () => {
  it('allows requests up to the limit within the window', () => {
    const limiter = new RateLimiter();

    for (let i = 0; i < 5; i++) {
      expect(limiter.check('key', 5, 60_000).allowed).toBe(true);
    }
  });

  it('denies requests once the limit is exceeded within the window', () => {
    const limiter = new RateLimiter();

    for (let i = 0; i < 5; i++) {
      limiter.check('key', 5, 60_000);
    }

    const result = limiter.check('key', 5, 60_000);
    expect(result.allowed).toBe(false);
    expect(result.retryAfterMs).toBeGreaterThan(0);
  });

  it('tracks separate keys independently', () => {
    const limiter = new RateLimiter();

    for (let i = 0; i < 5; i++) {
      limiter.check('attacker-ip', 5, 60_000);
    }

    expect(limiter.check('attacker-ip', 5, 60_000).allowed).toBe(false);
    expect(limiter.check('innocent-ip', 5, 60_000).allowed).toBe(true);
  });

  it('resets the window after it elapses', () => {
    const limiter = new RateLimiter();
    const nowSpy = jest.spyOn(Date, 'now');

    nowSpy.mockReturnValue(0);
    for (let i = 0; i < 5; i++) {
      limiter.check('key', 5, 1000);
    }
    expect(limiter.check('key', 5, 1000).allowed).toBe(false);

    nowSpy.mockReturnValue(1001);
    expect(limiter.check('key', 5, 1000).allowed).toBe(true);

    nowSpy.mockRestore();
  });
});
