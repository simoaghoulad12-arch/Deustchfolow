import { BadRequestException } from '@nestjs/common';
import { SubscriptionPlan } from '@deutschflow/types';
import { CheckoutService } from '../checkout.service';
import type { StripeService } from '../../stripe/stripe.service';
import type { StripeCustomerService } from '../../customers/stripe-customer.service';

const originalPremium = process.env.STRIPE_PRICE_ID_PREMIUM;
const originalAppUrl = process.env.APP_URL;

beforeEach(() => {
  process.env.STRIPE_PRICE_ID_PREMIUM = 'price_premium_test';
  process.env.APP_URL = 'http://localhost:3000';
});

afterAll(() => {
  if (originalPremium === undefined) delete process.env.STRIPE_PRICE_ID_PREMIUM;
  else process.env.STRIPE_PRICE_ID_PREMIUM = originalPremium;
  if (originalAppUrl === undefined) delete process.env.APP_URL;
  else process.env.APP_URL = originalAppUrl;
});

function buildStripeMock(createSpy?: jest.Mock) {
  return {
    client: {
      checkout: {
        sessions: { create: createSpy ?? jest.fn().mockResolvedValue({ url: 'https://checkout.stripe.com/test' }) },
      },
    },
  } as unknown as StripeService;
}

function buildStripeCustomersMock() {
  return {
    getOrCreateForUser: jest.fn().mockResolvedValue({ stripeCustomerId: 'cus_1' }),
  } as unknown as StripeCustomerService;
}

describe('CheckoutService', () => {
  describe('createSubscriptionCheckout', () => {
    it('creates a Stripe Checkout Session scoped to the calling user, in subscription mode', async () => {
      const createSpy = jest.fn().mockResolvedValue({ url: 'https://checkout.stripe.com/test' });
      const stripe = buildStripeMock(createSpy);
      const stripeCustomers = buildStripeCustomersMock();
      const service = new CheckoutService(stripe, stripeCustomers);

      const result = await service.createSubscriptionCheckout('user-1', SubscriptionPlan.PREMIUM);

      expect(stripeCustomers.getOrCreateForUser).toHaveBeenCalledWith('user-1');
      expect(createSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          mode: 'subscription',
          customer: 'cus_1',
          line_items: [{ price: 'price_premium_test', quantity: 1 }],
          client_reference_id: 'user-1',
        }),
      );
      expect(result).toEqual({ url: 'https://checkout.stripe.com/test' });
    });

    it('builds success/cancel URLs from APP_URL, pointing at the web app, never this API', async () => {
      const createSpy = jest.fn().mockResolvedValue({ url: 'https://checkout.stripe.com/test' });
      const stripe = buildStripeMock(createSpy);
      const service = new CheckoutService(stripe, buildStripeCustomersMock());

      await service.createSubscriptionCheckout('user-1', SubscriptionPlan.PREMIUM);

      const call = createSpy.mock.calls[0][0];
      expect(call.success_url).toMatch(/^http:\/\/localhost:3000\//);
      expect(call.cancel_url).toMatch(/^http:\/\/localhost:3000\//);
    });

    it('throws when Stripe unexpectedly returns no session URL', async () => {
      const stripe = buildStripeMock(jest.fn().mockResolvedValue({ url: null }));
      const service = new CheckoutService(stripe, buildStripeCustomersMock());

      await expect(service.createSubscriptionCheckout('user-1', SubscriptionPlan.PREMIUM)).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });
  });
});
