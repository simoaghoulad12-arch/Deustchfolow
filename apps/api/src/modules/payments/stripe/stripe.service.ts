import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';

const DEFAULT_API_VERSION = '2024-06-20' as Stripe.LatestApiVersion;

/**
 * The only file in this module allowed to import `stripe` directly —
 * every other payments service depends on this class, never the SDK.
 * Deliberately NOT behind a swappable-provider interface the way
 * AiProvider/DocumentStorageProvider are: there is no realistic second
 * EU-payments-and-Connect provider on the roadmap, and an interface with
 * exactly one implementation is the "unnecessary architecture" the
 * project has consistently avoided (see phase-6 quality-gate report §1).
 *
 * Client construction is lazy — importing/constructing this class must
 * never throw just because STRIPE_SECRET_KEY isn't set (tests, or a dev
 * environment that never exercises payments), only calling `client`
 * does. Mirrors ClaudeProvider's exact pattern for the same reason.
 */
@Injectable()
export class StripeService {
  private stripeClient: Stripe | null = null;

  /** The raw Stripe SDK client. Every payments service reads through
   * this getter rather than caching its own reference, so a missing
   * key always fails at the point of use with a clear message. */
  get client(): Stripe {
    if (!this.stripeClient) {
      const secretKey = process.env.STRIPE_SECRET_KEY;
      if (!secretKey) {
        throw new Error('Missing required environment variable: STRIPE_SECRET_KEY');
      }
      if (secretKey.startsWith('sk_live_')) {
        // Belt-and-suspenders: the Phase 6 approval is explicit —
        // TEST/SANDBOX only, no live keys, in this phase. A live key
        // making it into any non-production environment variable is a
        // configuration mistake this class refuses to act on silently.
        throw new Error(
          'STRIPE_SECRET_KEY is a live-mode key (sk_live_...). Phase 6 is TEST/SANDBOX only — use a sk_test_ key.',
        );
      }
      this.stripeClient = new Stripe(secretKey, { apiVersion: DEFAULT_API_VERSION });
    }
    return this.stripeClient;
  }

  /** The webhook signing secret for the main (platform) webhook endpoint. */
  get webhookSecret(): string {
    const secret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!secret) {
      throw new Error('Missing required environment variable: STRIPE_WEBHOOK_SECRET');
    }
    return secret;
  }

  /** The webhook signing secret for the separate Connect webhook endpoint. */
  get connectWebhookSecret(): string {
    const secret = process.env.STRIPE_CONNECT_WEBHOOK_SECRET;
    if (!secret) {
      throw new Error('Missing required environment variable: STRIPE_CONNECT_WEBHOOK_SECRET');
    }
    return secret;
  }

  /** True once every credential this module needs is present — used by
   * endpoints to fail with a clean, honest "payments not configured"
   * error rather than a confusing downstream Stripe SDK exception. */
  isConfigured(): boolean {
    return Boolean(process.env.STRIPE_SECRET_KEY);
  }
}
