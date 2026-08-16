import 'server-only';
import { prisma } from '@deutschflow/database';
import { requestPasswordResetSchema, resetPasswordSchema } from './schemas';
import { hashPassword } from './password';
import { normalizeEmail } from './normalize-email';
import { generateToken, hashToken } from './tokens';
import { destroyAllSessions } from './session';
import { checkAuthRateLimit } from '../security/auth-rate-limits';
import { emailService } from '../email/email-service';
import { requireEnv } from '../env';

const RESET_TOKEN_TTL_MS = 30 * 60 * 1000;
const GENERIC_RESET_ERROR = 'Dieser Link ist ungültig oder abgelaufen.';

/** Always succeeds from the caller's point of view — never reveals whether the email exists. */
export async function requestPasswordReset(
  input: { email: string },
  clientIp: string,
): Promise<{ success: true }> {
  const parsed = requestPasswordResetSchema.safeParse(input);
  if (!parsed.success) {
    return { success: true };
  }

  const email = normalizeEmail(parsed.data.email);

  const ipAllowed = checkAuthRateLimit('passwordResetRequest', clientIp);
  const emailAllowed = checkAuthRateLimit('passwordResetRequest', email);
  if (!ipAllowed || !emailAllowed) {
    return { success: true };
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (user && !user.deletedAt) {
    const rawToken = generateToken();
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash: hashToken(rawToken),
        expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS),
      },
    });

    const resetUrl = `${requireEnv('APP_URL')}/reset-password?token=${rawToken}`;
    await emailService.sendPasswordResetEmail(email, resetUrl);
  }

  return { success: true };
}

export type ResetPasswordResult = { success: true } | { success: false; error: string };

export async function resetPassword(input: {
  token: string;
  password: string;
  passwordConfirmation: string;
}): Promise<ResetPasswordResult> {
  const parsed = resetPasswordSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: GENERIC_RESET_ERROR };
  }
  if (parsed.data.password !== parsed.data.passwordConfirmation) {
    return { success: false, error: 'Die Passwörter stimmen nicht überein.' };
  }

  const tokenHash = hashToken(parsed.data.token);
  const resetToken = await prisma.passwordResetToken.findUnique({ where: { tokenHash } });

  if (!resetToken || resetToken.usedAt || resetToken.expiresAt < new Date()) {
    return { success: false, error: GENERIC_RESET_ERROR };
  }

  const passwordHash = await hashPassword(parsed.data.password);

  await prisma.$transaction([
    prisma.user.update({ where: { id: resetToken.userId }, data: { passwordHash } }),
    prisma.passwordResetToken.update({ where: { id: resetToken.id }, data: { usedAt: new Date() } }),
  ]);

  // A password reset must invalidate any session an attacker (or the user
  // on another device) might already hold.
  await destroyAllSessions(resetToken.userId);

  return { success: true };
}
