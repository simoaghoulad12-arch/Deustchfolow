import { StripeService } from '../stripe.service';

describe('StripeService', () => {
  const originalSecretKey = process.env.STRIPE_SECRET_KEY;
  const originalWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const originalConnectWebhookSecret = process.env.STRIPE_CONNECT_WEBHOOK_SECRET;

  afterEach(() => {
    if (originalSecretKey === undefined) delete process.env.STRIPE_SECRET_KEY;
    else process.env.STRIPE_SECRET_KEY = originalSecretKey;
    if (originalWebhookSecret === undefined) delete process.env.STRIPE_WEBHOOK_SECRET;
    else process.env.STRIPE_WEBHOOK_SECRET = originalWebhookSecret;
    if (originalConnectWebhookSecret === undefined) delete process.env.STRIPE_CONNECT_WEBHOOK_SECRET;
    else process.env.STRIPE_CONNECT_WEBHOOK_SECRET = originalConnectWebhookSecret;
  });

  describe('client', () => {
    it('never throws on construction alone, even with no key configured', () => {
      delete process.env.STRIPE_SECRET_KEY;
      expect(() => new StripeService()).not.toThrow();
    });

    it('throws a clear error only when the client is actually accessed without a key', () => {
      delete process.env.STRIPE_SECRET_KEY;
      const service = new StripeService();
      expect(() => service.client).toThrow(/STRIPE_SECRET_KEY/);
    });

    it('refuses a live-mode key even if one is somehow configured (TEST/SANDBOX only this phase)', () => {
      process.env.STRIPE_SECRET_KEY = 'sk_live_something';
      const service = new StripeService();
      expect(() => service.client).toThrow(/TEST\/SANDBOX only/);
    });

    it('constructs a real client for a test-mode key', () => {
      process.env.STRIPE_SECRET_KEY = 'sk_test_abc123';
      const service = new StripeService();
      expect(service.client).toBeDefined();
      expect(service.client.customers).toBeDefined();
    });

    it('reuses the same client instance across calls (does not reconstruct per access)', () => {
      process.env.STRIPE_SECRET_KEY = 'sk_test_abc123';
      const service = new StripeService();
      expect(service.client).toBe(service.client);
    });
  });

  describe('webhookSecret / connectWebhookSecret', () => {
    it('throws when STRIPE_WEBHOOK_SECRET is missing', () => {
      delete process.env.STRIPE_WEBHOOK_SECRET;
      const service = new StripeService();
      expect(() => service.webhookSecret).toThrow(/STRIPE_WEBHOOK_SECRET/);
    });

    it('throws when STRIPE_CONNECT_WEBHOOK_SECRET is missing', () => {
      delete process.env.STRIPE_CONNECT_WEBHOOK_SECRET;
      const service = new StripeService();
      expect(() => service.connectWebhookSecret).toThrow(/STRIPE_CONNECT_WEBHOOK_SECRET/);
    });

    it('returns the configured secrets', () => {
      process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test';
      process.env.STRIPE_CONNECT_WEBHOOK_SECRET = 'whsec_connect_test';
      const service = new StripeService();
      expect(service.webhookSecret).toBe('whsec_test');
      expect(service.connectWebhookSecret).toBe('whsec_connect_test');
    });
  });

  describe('isConfigured', () => {
    it('is false with no secret key', () => {
      delete process.env.STRIPE_SECRET_KEY;
      expect(new StripeService().isConfigured()).toBe(false);
    });

    it('is true once a secret key is present', () => {
      process.env.STRIPE_SECRET_KEY = 'sk_test_abc123';
      expect(new StripeService().isConfigured()).toBe(true);
    });
  });
});
