import { requestPasswordReset, resetPassword } from '../password-reset';
import { prisma } from '@deutschflow/database';
import { destroyAllSessions } from '../session';
import { emailService } from '../../email/email-service';
import { checkAuthRateLimit } from '../../security/auth-rate-limits';
import { hashToken } from '../tokens';

jest.mock('@deutschflow/database', () => ({
  prisma: {
    user: { findUnique: jest.fn(), update: jest.fn() },
    passwordResetToken: { create: jest.fn(), findUnique: jest.fn(), update: jest.fn() },
    $transaction: jest.fn(),
  },
}));
jest.mock('../session', () => ({ destroyAllSessions: jest.fn() }));
jest.mock('../../email/email-service', () => ({
  emailService: { sendPasswordResetEmail: jest.fn() },
}));
jest.mock('../../security/auth-rate-limits', () => ({ checkAuthRateLimit: jest.fn() }));

const mockedPrisma = prisma as unknown as {
  user: { findUnique: jest.Mock; update: jest.Mock };
  passwordResetToken: { create: jest.Mock; findUnique: jest.Mock; update: jest.Mock };
  $transaction: jest.Mock;
};
const mockedCheckAuthRateLimit = checkAuthRateLimit as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  mockedCheckAuthRateLimit.mockReturnValue(true);
  mockedPrisma.$transaction.mockImplementation((ops: unknown[]) => Promise.all(ops as never[]));
});

describe('requestPasswordReset', () => {
  it('reports success whether or not the account exists (no enumeration)', async () => {
    mockedPrisma.user.findUnique.mockResolvedValueOnce(null);
    const forUnknownEmail = await requestPasswordReset(
      { email: 'nobody@example.com' },
      '127.0.0.1',
    );

    mockedPrisma.user.findUnique.mockResolvedValueOnce({ id: 'user-1', deletedAt: null });
    const forKnownEmail = await requestPasswordReset(
      { email: 'student@example.com' },
      '127.0.0.1',
    );

    expect(forUnknownEmail).toEqual({ success: true });
    expect(forKnownEmail).toEqual({ success: true });
  });

  it('only sends an email when the account actually exists', async () => {
    mockedPrisma.user.findUnique.mockResolvedValue(null);
    await requestPasswordReset({ email: 'nobody@example.com' }, '127.0.0.1');
    expect(emailService.sendPasswordResetEmail).not.toHaveBeenCalled();
  });
});

describe('resetPassword', () => {
  it('rejects an unknown token', async () => {
    mockedPrisma.passwordResetToken.findUnique.mockResolvedValue(null);

    const result = await resetPassword({
      token: 'nonexistent-token',
      password: 'new-password-1',
      passwordConfirmation: 'new-password-1',
    });

    expect(result.success).toBe(false);
    expect(mockedPrisma.user.update).not.toHaveBeenCalled();
  });

  it('rejects an already-used token (single use)', async () => {
    mockedPrisma.passwordResetToken.findUnique.mockResolvedValue({
      id: 'reset-1',
      userId: 'user-1',
      usedAt: new Date(),
      expiresAt: new Date(Date.now() + 60_000),
    });

    const result = await resetPassword({
      token: 'already-used-token',
      password: 'new-password-1',
      passwordConfirmation: 'new-password-1',
    });

    expect(result.success).toBe(false);
    expect(mockedPrisma.$transaction).not.toHaveBeenCalled();
  });

  it('rejects an expired token', async () => {
    mockedPrisma.passwordResetToken.findUnique.mockResolvedValue({
      id: 'reset-1',
      userId: 'user-1',
      usedAt: null,
      expiresAt: new Date(Date.now() - 60_000),
    });

    const result = await resetPassword({
      token: 'expired-token',
      password: 'new-password-1',
      passwordConfirmation: 'new-password-1',
    });

    expect(result.success).toBe(false);
  });

  it('resets the password and invalidates all sessions for a valid token', async () => {
    mockedPrisma.passwordResetToken.findUnique.mockResolvedValue({
      id: 'reset-1',
      userId: 'user-1',
      usedAt: null,
      expiresAt: new Date(Date.now() + 60_000),
      tokenHash: hashToken('valid-token'),
    });

    const result = await resetPassword({
      token: 'valid-token',
      password: 'new-password-1',
      passwordConfirmation: 'new-password-1',
    });

    expect(result.success).toBe(true);
    expect(destroyAllSessions).toHaveBeenCalledWith('user-1');
  });

  it('rejects mismatched password confirmation without consuming the token', async () => {
    const result = await resetPassword({
      token: 'some-token',
      password: 'new-password-1',
      passwordConfirmation: 'different-password-1',
    });

    expect(result.success).toBe(false);
    expect(mockedPrisma.passwordResetToken.findUnique).not.toHaveBeenCalled();
  });
});
