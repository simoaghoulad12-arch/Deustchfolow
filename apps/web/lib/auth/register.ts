import 'server-only';
import { prisma } from '@deutschflow/database';
import { UserRole, SubscriptionPlan, SubscriptionStatus } from '@deutschflow/types';
import { registerSchema } from './schemas';
import { hashPassword } from './password';
import { normalizeEmail } from './normalize-email';
import { generateToken, hashToken } from './tokens';
import { createSession } from './session';
import { checkAuthRateLimit } from '../security/auth-rate-limits';
import { emailService } from '../email/email-service';
import { requireEnv } from '../env';

export interface RegisterInput {
  email: string;
  password: string;
  passwordConfirmation: string;
}

export type RegisterResult = { success: true } | { success: false; error: string };

const VERIFICATION_TOKEN_TTL_MS = 24 * 60 * 60 * 1000;

export async function registerUser(input: RegisterInput, clientIp: string): Promise<RegisterResult> {
  if (!checkAuthRateLimit('register', clientIp)) {
    return {
      success: false,
      error: 'Zu viele Registrierungsversuche. Bitte versuche es später erneut.',
    };
  }

  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Ungültige Eingabe.' };
  }
  if (parsed.data.password !== parsed.data.passwordConfirmation) {
    return { success: false, error: 'Die Passwörter stimmen nicht überein.' };
  }

  const email = normalizeEmail(parsed.data.email);

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { success: false, error: 'Für diese E-Mail-Adresse existiert bereits ein Konto.' };
  }

  const passwordHash = await hashPassword(parsed.data.password);

  // role and plan are always server-decided — never read from client input.
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      role: UserRole.STUDENT,
      profile: { create: {} },
      learningProfile: { create: {} },
      subscriptions: {
        create: { plan: SubscriptionPlan.FREE, status: SubscriptionStatus.ACTIVE },
      },
    },
  });

  const rawToken = generateToken();
  await prisma.verificationToken.create({
    data: {
      identifier: email,
      tokenHash: hashToken(rawToken),
      expiresAt: new Date(Date.now() + VERIFICATION_TOKEN_TTL_MS),
    },
  });

  const verificationUrl = `${requireEnv('APP_URL')}/verify-email?token=${rawToken}`;
  await emailService.sendVerificationEmail(email, verificationUrl);

  await createSession(user.id);

  return { success: true };
}
