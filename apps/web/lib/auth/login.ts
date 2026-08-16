import 'server-only';
import bcrypt from 'bcryptjs';
import { prisma } from '@deutschflow/database';
import { loginSchema } from './schemas';
import { verifyPassword, BCRYPT_COST_FACTOR } from './password';
import { normalizeEmail } from './normalize-email';
import { createSession } from './session';
import { checkAuthRateLimit } from '../security/auth-rate-limits';

export interface LoginInput {
  email: string;
  password: string;
}

export type LoginResult = { success: true } | { success: false; error: string };

const GENERIC_LOGIN_ERROR = 'E-Mail oder Passwort ist falsch.';
const RATE_LIMIT_ERROR = 'Zu viele Anmeldeversuche. Bitte versuche es später erneut.';

/**
 * Hashed once at module load and compared against whenever no real user is
 * found, so `bcrypt.compare` always runs — closing the timing side-channel
 * that would otherwise let an attacker infer whether an email is
 * registered from response latency alone (bcrypt against a real hash is
 * deliberately slow; skipping it for "user not found" would make that
 * case measurably faster).
 */
const DUMMY_PASSWORD_HASH = bcrypt.hashSync(
  'dummy-password-for-constant-time-comparison',
  BCRYPT_COST_FACTOR,
);

export async function loginUser(input: LoginInput, clientIp: string): Promise<LoginResult> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: GENERIC_LOGIN_ERROR };
  }

  const email = normalizeEmail(parsed.data.email);

  if (!checkAuthRateLimit('login', clientIp) || !checkAuthRateLimit('loginPerAccount', email)) {
    return { success: false, error: RATE_LIMIT_ERROR };
  }

  const user = await prisma.user.findUnique({ where: { email } });
  const isActiveUser = Boolean(user) && !user!.deletedAt;

  const passwordToCheckAgainst = isActiveUser ? user!.passwordHash : DUMMY_PASSWORD_HASH;
  const passwordIsValid = await verifyPassword(parsed.data.password, passwordToCheckAgainst);

  if (!isActiveUser || !passwordIsValid) {
    return { success: false, error: GENERIC_LOGIN_ERROR };
  }

  await createSession(user!.id);
  return { success: true };
}
