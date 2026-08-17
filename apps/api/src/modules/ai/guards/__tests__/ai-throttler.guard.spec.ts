import { AiThrottlerGuard } from '../ai-throttler.guard';

describe('AiThrottlerGuard', () => {
  // getTracker() is a pure function of the request in this override — it
  // doesn't touch `this` — so it can be exercised directly without
  // constructing the full ThrottlerGuard (options/storage/reflector), the
  // same way other guards in this codebase are unit-tested directly.
  const guard = Object.create(AiThrottlerGuard.prototype) as AiThrottlerGuard;
  const getTracker = (req: Record<string, unknown>) =>
    (guard as unknown as { getTracker(req: Record<string, unknown>): Promise<string> }).getTracker(req);

  it('tracks by the authenticated user id — never by IP — so one user cannot exhaust another\'s burst budget', async () => {
    await expect(
      getTracker({ user: { id: 'user-1' }, ip: '203.0.113.5' }),
    ).resolves.toBe('user-1');
  });

  it('falls back to IP only when there is no authenticated user on the request', async () => {
    await expect(getTracker({ ip: '203.0.113.5' })).resolves.toBe('203.0.113.5');
  });

  it('falls back to "unknown" when neither a user nor an IP is present', async () => {
    await expect(getTracker({})).resolves.toBe('unknown');
  });
});
