import 'server-only';
import type { EmailProvider } from './types';
import { ConsoleEmailProvider } from './providers/console-provider';

/**
 * Provider-abstract email layer. No concrete production provider
 * (Postmark/SES/Resend/...) is wired up in Phase 2 — only the dev
 * transport. Resolution is lazy (on first send, not at module load) so
 * that importing this module never throws during `next build`, where
 * NODE_ENV is also "production".
 */
function resolveProvider(): EmailProvider {
  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'No production EmailProvider configured. Wire a real provider in ' +
        'apps/web/lib/email/email-service.ts before deploying — the dev ' +
        'ConsoleEmailProvider must never run in production.',
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
