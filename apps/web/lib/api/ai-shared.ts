import 'server-only';

export type AiActionResult<T> = { ok: true; data: T } | { ok: false; message: string };

/**
 * NestJS's default HttpException body is `{ statusCode, message, error }`
 * (`message` is a string[] for class-validator failures, a string
 * otherwise). Used to surface a real message for e.g. the daily AI usage
 * limit or entitlement errors, instead of the generic `null`-on-failure
 * convention the read-only `lib/api/*.ts` files use elsewhere.
 */
export async function parseAiErrorMessage(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { message?: string | string[] };
    if (Array.isArray(body.message)) return body.message.join(' ');
    if (typeof body.message === 'string') return body.message;
  } catch {
    // No JSON body — fall through to the generic message.
  }
  return 'Etwas ist schiefgelaufen. Bitte versuche es erneut.';
}
