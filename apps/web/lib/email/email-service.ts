import 'server-only';
import type { EmailProvider } from './types';
import { ConsoleEmailProvider } from './providers/console-provider';
import { ResendEmailProvider } from './providers/resend-provider';

/**
 * Provider-abstract email layer. Resend is used whenever RESEND_API_KEY and
 * EMAIL_FROM are set; otherwise development falls back to the console
 * transport and production refuses to send. Resolution is lazy (on first
 * send, not at module load) so that importing this module never throws
 * during `next build`, where NODE_ENV is also "production".
 */
export function resolveProvider(env: NodeJS.ProcessEnv = process.env): EmailProvider {
  if (env.RESEND_API_KEY && env.EMAIL_FROM) {
    return new ResendEmailProvider(env.RESEND_API_KEY, env.EMAIL_FROM);
  }
  if (env.NODE_ENV === 'production') {
    throw new Error(
      'No production EmailProvider configured. Set RESEND_API_KEY and EMAIL_FROM — ' +
        'the dev ConsoleEmailProvider must never run in production.',
    );
  }
  return new ConsoleEmailProvider();
}

class EmailService {
  private provider: EmailProvider | null = null;

  private getProvider(): EmailProvider {
    if (!this.provider) {
      this.provider = resolveProvider();
    }
    return this.provider;
  }

  async sendVerificationEmail(to: string, verificationUrl: string): Promise<void> {
    await this.getProvider().send({
      to,
      subject: 'Bestätige deine E-Mail-Adresse — DeutschFlow',
      text:
        `Willkommen bei DeutschFlow!\n\n` +
        `Bitte bestätige deine E-Mail-Adresse über diesen Link:\n${verificationUrl}\n\n` +
        `Der Link ist 24 Stunden gültig.`,
    });
  }

  async sendPasswordResetEmail(to: string, resetUrl: string): Promise<void> {
    await this.getProvider().send({
      to,
      subject: 'Passwort zurücksetzen — DeutschFlow',
      text:
        `Du hast das Zurücksetzen deines Passworts angefordert.\n\n` +
        `Link zum Zurücksetzen:\n${resetUrl}\n\n` +
        `Der Link ist 30 Minuten gültig. Falls du das nicht warst, kannst du diese E-Mail ignorieren.`,
    });
  }
}

export const emailService = new EmailService();
