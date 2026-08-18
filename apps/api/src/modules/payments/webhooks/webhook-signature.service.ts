import { BadRequestException, Injectable } from '@nestjs/common';
import type Stripe from 'stripe';
import { StripeService } from '../stripe/stripe.service';

export type WebhookEndpointKind = 'platform' | 'connect';

/**
 * The entire "Stripe-Webhooks müssen serverseitig verifiziert werden"
 * requirement lives in this one method. `stripe.webhooks.constructEvent`
 * recomputes the HMAC-SHA256 signature over the raw payload bytes using
 * our webhook signing secret and compares it against the
 * `stripe-signature` header — a forged request (any payload not
 * actually signed by Stripe) throws here, before any table is ever
 * touched. This is the payments-domain equivalent of
 * `verifyServiceToken()`: never trust the body, verify a signature
 * server-side first.
 */
@Injectable()
export class WebhookSignatureService {
  constructor(private readonly stripe: StripeService) {}

  verifyAndParse(rawBody: Buffer, signatureHeader: string | undefined, kind: WebhookEndpointKind): Stripe.Event {
    if (!signatureHeader) {
      throw new BadRequestException('Missing stripe-signature header.');
    }

    const secret = kind === 'platform' ? this.stripe.webhookSecret : this.stripe.connectWebhookSecret;

    try {
      return this.stripe.client.webhooks.constructEvent(rawBody, signatureHeader, secret);
    } catch {
      // Deliberately no error detail from the underlying exception in
      // the response — a signature-verification failure tells an
      // attacker nothing about why it failed.
      throw new BadRequestException('Webhook signature verification failed.');
    }
  }
}
