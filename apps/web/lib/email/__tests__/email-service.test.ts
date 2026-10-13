import { resolveProvider } from '../email-service';
import { ConsoleEmailProvider } from '../providers/console-provider';
import { ResendEmailProvider } from '../providers/resend-provider';

describe('email provider resolution', () => {
  it('uses Resend when key and sender are configured', () => {
    expect(resolveProvider({ NODE_ENV: 'production', RESEND_API_KEY: 'k', EMAIL_FROM: 'a@b.de' } as NodeJS.ProcessEnv)).toBeInstanceOf(ResendEmailProvider);
  });

  it('refuses to fall back to the console in production', () => {
    expect(() => resolveProvider({ NODE_ENV: 'production' } as NodeJS.ProcessEnv)).toThrow(/RESEND_API_KEY/);
  });

  it('logs to the console in development', () => {
    expect(resolveProvider({ NODE_ENV: 'development' } as NodeJS.ProcessEnv)).toBeInstanceOf(ConsoleEmailProvider);
  });
});

describe('ResendEmailProvider', () => {
  it('posts the message to the Resend API', async () => {
    const fetchImpl = jest.fn().mockResolvedValue({ ok: true });
    await new ResendEmailProvider('key', 'DeutschFlow <hi@x.de>', fetchImpl as unknown as typeof fetch).send({ to: 'u@x.de', subject: 'S', text: 'T' });
    const [url, init] = fetchImpl.mock.calls[0];
    expect(url).toBe('https://api.resend.com/emails');
    expect(init.headers.Authorization).toBe('Bearer key');
    expect(JSON.parse(init.body)).toEqual({ from: 'DeutschFlow <hi@x.de>', to: ['u@x.de'], subject: 'S', text: 'T' });
  });

  it('throws when Resend rejects the email', async () => {
    const fetchImpl = jest.fn().mockResolvedValue({ ok: false, status: 403, text: async () => 'domain not verified' });
    await expect(new ResendEmailProvider('key', 'a@b.de', fetchImpl as unknown as typeof fetch).send({ to: 'u@x.de', subject: 'S', text: 'T' })).rejects.toThrow(/403/);
  });
});
