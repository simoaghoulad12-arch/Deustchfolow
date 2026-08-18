import { SubscriptionPlan, SubscriptionStatus } from '@deutschflow/types';
import { isEntitledStatus, mapStripeStatusToLocal, planForPriceId, priceIdForPlan } from '../subscription-mapping';

describe('subscription-mapping (pure functions, no Prisma/Stripe SDK)', () => {
  describe('mapStripeStatusToLocal', () => {
    it.each([
      ['incomplete', SubscriptionStatus.INCOMPLETE],
      ['incomplete_expired', SubscriptionStatus.INCOMPLETE_EXPIRED],
      ['trialing', SubscriptionStatus.TRIALING],
      ['active', SubscriptionStatus.ACTIVE],
      ['past_due', SubscriptionStatus.PAST_DUE],
      ['canceled', SubscriptionStatus.CANCELED],
      ['unpaid', SubscriptionStatus.UNPAID],
    ])('maps Stripe status "%s" to %s', (stripeStatus, expected) => {
      expect(mapStripeStatusToLocal(stripeStatus)).toBe(expected);
    });

    it('throws on an unrecognized status rather than silently defaulting', () => {
      expect(() => mapStripeStatusToLocal('some_future_stripe_status')).toThrow(/Unrecognized/);
    });
  });

  describe('priceIdForPlan / planForPriceId', () => {
    const originalPremium = process.env.STRIPE_PRICE_ID_PREMIUM;
    const originalPro = process.env.STRIPE_PRICE_ID_PRO;

    afterEach(() => {
      if (originalPremium === undefined) delete process.env.STRIPE_PRICE_ID_PREMIUM;
      else process.env.STRIPE_PRICE_ID_PREMIUM = originalPremium;
      if (originalPro === undefined) delete process.env.STRIPE_PRICE_ID_PRO;
      else process.env.STRIPE_PRICE_ID_PRO = originalPro;
    });

    it('throws for FREE — it is never checked out against Stripe', () => {
      expect(() => priceIdForPlan(SubscriptionPlan.FREE)).toThrow(/never checked out/);
    });

    it('throws a clear error when the env var is missing', () => {
      delete process.env.STRIPE_PRICE_ID_PREMIUM;
      expect(() => priceIdForPlan(SubscriptionPlan.PREMIUM)).toThrow(/STRIPE_PRICE_ID_PREMIUM/);
    });

    it('round-trips plan -> price id -> plan', () => {
      process.env.STRIPE_PRICE_ID_PREMIUM = 'price_premium_test';
      process.env.STRIPE_PRICE_ID_PRO = 'price_pro_test';

      expect(priceIdForPlan(SubscriptionPlan.PREMIUM)).toBe('price_premium_test');
      expect(priceIdForPlan(SubscriptionPlan.PRO)).toBe('price_pro_test');
      expect(planForPriceId('price_premium_test')).toBe(SubscriptionPlan.PREMIUM);
      expect(planForPriceId('price_pro_test')).toBe(SubscriptionPlan.PRO);
    });

    it('returns null (never fabricates a plan) for an unrecognized price id', () => {
      process.env.STRIPE_PRICE_ID_PREMIUM = 'price_premium_test';
      expect(planForPriceId('price_unknown')).toBeNull();
    });
  });

  describe('isEntitledStatus', () => {
    it('is true for ACTIVE and TRIALING only', () => {
      expect(isEntitledStatus(SubscriptionStatus.ACTIVE)).toBe(true);
      expect(isEntitledStatus(SubscriptionStatus.TRIALING)).toBe(true);
    });

    it('is false for PAST_DUE (grace period is a separate, explicit check)', () => {
      expect(isEntitledStatus(SubscriptionStatus.PAST_DUE)).toBe(false);
    });

    it.each([SubscriptionStatus.CANCELED, SubscriptionStatus.UNPAID, SubscriptionStatus.INCOMPLETE, SubscriptionStatus.INCOMPLETE_EXPIRED])(
      'is false for %s',
      (status) => {
        expect(isEntitledStatus(status)).toBe(false);
      },
    );
  });
});
