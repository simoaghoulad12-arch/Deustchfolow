import { BadRequestException } from '@nestjs/common';
import Stripe from 'stripe';
import { WebhookSignatureService } from '../webhook-signature.service';
import { StripeService } from '../../stripe/stripe.service';

const originalSecretKey = process.env.STRIPE_SECRET_KEY;
const originalWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
const originalConnectWebhookSecret = process.env.STRIPE_CONNECT_WEBHOOK_SECRET;

const PLATFORM_SECRET = 'whsec_platform_test_secret';
const CONNECT_SECRET = 'whsec_connect_test_secret';

beforeEach(() => {
  process.env.STRIPE_SECRET_KEY = 'sk_test_abc123';
  process.env.STRIPE_WEBHOOK_SECRET = PLATFORM_SECRET;
  process.env.STRIPE_CONNECT_WEBHOOK_SECRET = CONNECT_SECRET;
});

afterAll(() => {
  if (originalSecretKey === undefined) delete process.env.STRIPE_SECRET_KEY;
  else process.env.STRIPE_SECRET_KEY = originalSecretKey;
  if (originalWebhookSecret === undefined) delete process.env.STRIPE_WEBHOOK_SECRET;
  else process.env.STRIPE_WEBHOOK_SECRET = originalWebhookSecret;
  if (originalConnectWebhookSecret === undefined) delete process.env.STRIPE_CONNECT_WEBHOOK_SECRET;
  else process.env.STRIPE_CONNECT_WEBHOOK_SECRET = originalConnectWebhookSecret;
});

const samplePayload = JSON.stringify({
  id: 'evt_test_123',
  object: 'event',
  type: 'customer.subscription.updated',
});

/**
 * Uses Stripe's own `generateTestHeaderString` to produce a REAL,
 * correctly-signed header — this exercises the actual HMAC verification
 * path (`constructEvent`), not a mock of it. A test suite that only
 * ever mocks `constructEvent` would never actually prove signature
 * verification works.
 */
describe('WebhookSignatureService (real Stripe signature crypto, no network)', () => {
  function buildService() {
    return new WebhookSignatureService(new StripeService());
  }

  it('rejects a request with no stripe-signature header', () => {
    const service = buildService();
    expect(() => service.verifyAndParse(Buffer.from(samplePayload), undefined, 'platform')).toThrow(
      BadRequestException,
    );
  });

  it('rejects a forged payload with a bogus signature', () => {
    const service = buildService();
    expect(() =>
      service.verifyAndParse(Buffer.from(samplePayload), 't=1,v1=not-a-real-signature', 'platform'),
    ).toThrow(BadRequestException);
  });

  it('rejects a genuinely-signed payload verified against the WRONG secret (connect payload sent to the platform endpoint)', () => {
    const service = buildService();
    const header = Stripe.webhooks.generateTestHeaderString({ payload: samplePayload, secret: CONNECT_SECRET });

    expect(() => service.verifyAndParse(Buffer.from(samplePayload), header, 'platform')).toThrow(
      BadRequestException,
    );
  });

  it('accepts a payload correctly signed with the platform secret, verified against the platform endpoint', () => {
    const service = buildService();
    const header = Stripe.webhooks.generateTestHeaderString({ payload: samplePayload, secret: PLATFORM_SECRET });

    const event = service.verifyAndParse(Buffer.from(samplePayload), header, 'platform');

    expect(event.id).toBe('evt_test_123');
    expect(event.type).toBe('customer.subscription.updated');
  });

  it('accepts a payload correctly signed with the connect secret, verified against the connect endpoint', () => {
    const service = buildService();
    const header = Stripe.webhooks.generateTestHeaderString({ payload: samplePayload, secret: CONNECT_SECRET });

    const event = service.verifyAndParse(Buffer.from(samplePayload), header, 'connect');

    expect(event.id).toBe('evt_test_123');
  });

  it('rejects a payload correctly signed but tampered with after signing (integrity, not just header presence)', () => {
    const service = buildService();
    const header = Stripe.webhooks.generateTestHeaderString({ payload: samplePayload, secret: PLATFORM_SECRET });
    const tamperedPayload = samplePayload.replace('customer.subscription.updated', 'customer.subscription.deleted');

    expect(() => service.verifyAndParse(Buffer.from(tamperedPayload), header, 'platform')).toThrow(
      BadRequestException,
    );
  });

  it('rejects a stale timestamp beyond Stripe default tolerance (replay protection)', () => {
    const service = buildService();
    const fiveMinutesAgo = Math.floor(Date.now() / 1000) - 60 * 6;
    const header = Stripe.webhooks.generateTestHeaderString({
      payload: samplePayload,
      secret: PLATFORM_SECRET,
      timestamp: fiveMinutesAgo,
    });

    expect(() => service.verifyAndParse(Buffer.from(samplePayload), header, 'platform')).toThrow(
      BadRequestException,
    );
  });
});
