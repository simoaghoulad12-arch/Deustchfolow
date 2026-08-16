import { registerUser } from '../register';
import { prisma } from '@deutschflow/database';
import { createSession } from '../session';
import { emailService } from '../../email/email-service';
import { checkAuthRateLimit } from '../../security/auth-rate-limits';

jest.mock('@deutschflow/database', () => ({
  prisma: {
    user: { findUnique: jest.fn(), create: jest.fn() },
    verificationToken: { create: jest.fn() },
  },
}));
jest.mock('../session', () => ({ createSession: jest.fn() }));
jest.mock('../../email/email-service', () => ({
  emailService: { sendVerificationEmail: jest.fn() },
}));
jest.mock('../../security/auth-rate-limits', () => ({ checkAuthRateLimit: jest.fn() }));

const mockedPrisma = prisma as unknown as {
  user: { findUnique: jest.Mock; create: jest.Mock };
  verificationToken: { create: jest.Mock };
};
const mockedCheckAuthRateLimit = checkAuthRateLimit as jest.Mock;

const validInput = {
  email: 'Student@Example.com',
  password: 'correct-horse-1',
  passwordConfirmation: 'correct-horse-1',
};

beforeEach(() => {
  jest.clearAllMocks();
  mockedCheckAuthRateLimit.mockReturnValue(true);
  mockedPrisma.user.findUnique.mockResolvedValue(null);
  mockedPrisma.user.create.mockResolvedValue({ id: 'new-user-id', email: 'student@example.com' });
});

describe('registerUser', () => {
  it('always creates the user with role STUDENT and plan FREE — these are never read from input', async () => {
    await registerUser(validInput, '127.0.0.1');

    expect(mockedPrisma.user.create).toHaveBeenCalledTimes(1);
    const createArgs = mockedPrisma.user.create.mock.calls[0][0];
    expect(createArgs.data.role).toBe('STUDENT');
    expect(createArgs.data.subscriptions.create.plan).toBe('FREE');
  });

  it('rejects the whole request outright if it contains unexpected fields like role or plan (mass assignment defense)', async () => {
    const inputWithSmuggledFields = {
      ...validInput,
      role: 'ADMIN',
      plan: 'PRO',
    } as typeof validInput;

    const result = await registerUser(inputWithSmuggledFields, '127.0.0.1');

    expect(result.success).toBe(false);
    expect(mockedPrisma.user.create).not.toHaveBeenCalled();
  });

  it('normalizes email to lowercase before storing', async () => {
    await registerUser(validInput, '127.0.0.1');

    const createArgs = mockedPrisma.user.create.mock.calls[0][0];
    expect(createArgs.data.email).toBe('student@example.com');
  });

  it('rejects registration when the email is already taken', async () => {
    mockedPrisma.user.findUnique.mockResolvedValue({ id: 'existing-user' });

    const result = await registerUser(validInput, '127.0.0.1');

    expect(result.success).toBe(false);
    expect(mockedPrisma.user.create).not.toHaveBeenCalled();
  });

  it('rejects registration when passwords do not match', async () => {
    const result = await registerUser(
      { ...validInput, passwordConfirmation: 'different-password-1' },
      '127.0.0.1',
    );

    expect(result.success).toBe(false);
    expect(mockedPrisma.user.create).not.toHaveBeenCalled();
  });

  it('rejects registration when the password is too weak', async () => {
    const result = await registerUser(
      { ...validInput, password: 'short', passwordConfirmation: 'short' },
      '127.0.0.1',
    );

    expect(result.success).toBe(false);
    expect(mockedPrisma.user.create).not.toHaveBeenCalled();
  });

  it('is blocked by rate limiting before touching the database', async () => {
    mockedCheckAuthRateLimit.mockReturnValue(false);

    const result = await registerUser(validInput, '127.0.0.1');

    expect(result.success).toBe(false);
    expect(mockedPrisma.user.findUnique).not.toHaveBeenCalled();
    expect(mockedPrisma.user.create).not.toHaveBeenCalled();
  });

  it('creates a session and sends a verification email on success', async () => {
    const result = await registerUser(validInput, '127.0.0.1');

    expect(result.success).toBe(true);
    expect(createSession).toHaveBeenCalledWith('new-user-id');
    expect(emailService.sendVerificationEmail).toHaveBeenCalledTimes(1);
  });
});
