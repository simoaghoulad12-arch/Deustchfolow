import type { EmailMessage, EmailProvider } from '../types';

/**
 * Development-only transport: writes the email to the server log instead
 * of sending it. This is transparent dev tooling (a developer reads the
 * link from the log to continue a flow locally), not a fake "pretend it
 * sent" success path — no email provider is simulated.
 */
export class ConsoleEmailProvider implements EmailProvider {
  async send(message: EmailMessage): Promise<void> {
    // eslint-disable-next-line no-console
    console.warn(
      `\n[DEV EMAIL] an=${message.to}\nBetreff: ${message.subject}\n\n${message.text}\n`,
    );
  }
}
