import { loginUser } from '../login';
import { hashPassword } from '../password';
import { prisma } from '@deutschflow/database';
import { createSession } from '../session';
import { checkAuthRateLimit } from '../../security/auth-rate-limits';

jest.mock('@deutschflow/database', () => ({
  prisma: { user: { findUnique: jest.fn() } },
}));
jest.mock('../session', () => ({ createSession: jest.fn() }));
jest.mock('../../security/auth-rate-limits', () => ({ checkAuthRateLimit: jest.fn() }));

const mockedPrisma = prisma as unknown as { user: { findUnique: jest.Mock } };
const mockedCheckAuthRateLimit = checkAuthRateLimit as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  mockedCheckAuthRateLimit.mockReturnValue(true);
});

describe('loginUser', () => {
  it('returns the same generic error for a non-existent account as for a wrong password', async () => {
    const passwordHash = await hashPassword('correct-horse-1');
    mockedPrisma.user.findUnique.mockResolvedValueOnce(null);
    const forNonExistentUser = await loginUser(
      { email: 'nobody@example.com', password: 'whatever-1' },
      '127.0.0.1',
    );

    mockedPrisma.user.findUnique.mockResolvedValueOnce({
      id: 'user-1',
      passwordHash,
      deletedAt: null,
    });
    const forWrongPassword = await loginUser(
      { email: 'student@example.com', password: 'wrong-password-1' },
      '127.0.0.1',
    );

    expect(forNonExistentUser.success).toBe(false);
    expect(forWrongPassword.success).toBe(false);
    expect((forNonExistentUser as { error: string }).error).toBe(
      (forWrongPassword as { error: string }).error,
    );
  });

  it('rejects a soft-deleted account with the same generic error', async () => {
    const passwordHash = await hashPassword('correct-horse-1');
    mockedPrisma.user.findUnique.mockResolvedValue({
      id: 'user-1',
      passwordHash,
      deletedAt: new Date(),
    });

    const result = await loginUser(
      { email: 'student@example.com', password: 'correct-horse-1' },
      '127.0.0.1',
    );

    expect(result.success).toBe(false);
    expect(createSession).not.toHaveBeenCalled();
  });

  it('creates a session on valid credentials', async () => {
    const passwordHash = await hashPassword('correct-horse-1');
    mockedPrisma.user.findUnique.mockResolvedValue({
      id: 'user-1',
      passwordHash,
      deletedAt: null,
    });

    const result = await loginUser(
      { email: 'student@example.com', password: 'correct-horse-1' },
      '127.0.0.1',
    );

    expect(result.success).toBe(true);
    expect(createSession).toHaveBeenCalledWith('user-1');
  });

  it('is blocked by rate limiting before checking the password', async () => {
    mockedCheckAuthRateLimit.mockReturnValue(false);

    const result = await loginUser(
      { email: 'student@example.com', password: 'correct-horse-1' },
      '127.0.0.1',
    );

    expect(result.success).toBe(false);
    expect(mockedPrisma.user.findUnique).not.toHaveBeenCalled();
  });
});
