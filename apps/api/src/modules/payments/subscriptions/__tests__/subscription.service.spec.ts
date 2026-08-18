import { NotFoundException } from '@nestjs/common';
import { SubscriptionService } from '../subscription.service';
import type { PrismaService } from '../../../../common/prisma/prisma.service';
import type { StripeService } from '../../stripe/stripe.service';
import type { StripeCustomerService } from '../../customers/stripe-customer.service';

const originalPremium = process.env.STRIPE_PRICE_ID_PREMIUM;
const originalPro = process.env.STRIPE_PRICE_ID_PRO;

beforeEach(() => {
  process.env.STRIPE_PRICE_ID_PREMIUM = 'price_premium_test';
  process.env.STRIPE_PRICE_ID_PRO = 'price_pro_test';
});

afterAll(() => {
  if (originalPremium === undefined) delete process.env.STRIPE_PRICE_ID_PREMIUM;
  else process.env.STRIPE_PRICE_ID_PREMIUM = originalPremium;
  if (originalPro === undefined) delete process.env.STRIPE_PRICE_ID_PRO;
  else process.env.STRIPE_PRICE_ID_PRO = originalPro;
});

function buildPrismaMock(overrides?: { subscription?: Partial<Record<string, jest.Mock>> }) {
  return {
    client: {
      subscription: {
        findUnique: jest.fn().mockResolvedValue(null),
        findFirst: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue({}),
        update: jest.fn().mockResolvedValue({}),
        ...overrides?.subscription,
      },
    },
  } as unknown as PrismaService;
}

function buildStripeCustomersMock(userId: string | null = 'user-1') {
  return {
    findUserIdByStripeCustomerId: jest.fn().mockResolvedValue(userId),
  } as unknown as StripeCustomerService;
}

function buildStripeMock(updateSpy?: jest.Mock) {
  return {
    client: {
      subscriptions: { update: updateSpy ?? jest.fn().mockResolvedValue({}) },
    },
  } as unknown as StripeService;
}

const baseEventData = {
  id: 'sub_123',
  status: 'active',
  customer: 'cus_1',
  currentPeriodEnd: 1_800_000_000,
  cancelAtPeriodEnd: false,
  priceId: 'price_premium_test',
};

describe('SubscriptionService', () => {
  describe('upsertFromStripeSubscription', () => {
    it('logs and skips (never crashes, never fabricates a plan) for an unrecognized price id', async () => {
      const prisma = buildPrismaMock();
      const service = new SubscriptionService(prisma, buildStripeMock(), buildStripeCustomersMock());

      await service.upsertFromStripeSubscription({ ...baseEventData, priceId: 'price_unknown' });

      expect(prisma.client.subscription.create).not.toHaveBeenCalled();
      expect(prisma.client.subscription.update).not.toHaveBeenCalled();
    });

    it('logs and skips for a Stripe customer with no local user mapping', async () => {
      const prisma = buildPrismaMock();
      const service = new SubscriptionService(prisma, buildStripeMock(), buildStripeCustomersMock(null));

      await service.upsertFromStripeSubscription(baseEventData);

      expect(prisma.client.subscription.create).not.toHaveBeenCalled();
    });

    it('creates a new row for a subscription id never seen before', async () => {
      const prisma = buildPrismaMock();
      const service = new SubscriptionService(prisma, buildStripeMock(), buildStripeCustomersMock('user-1'));

      await service.upsertFromStripeSubscription(baseEventData);

      expect(prisma.client.subscription.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: 'user-1',
          stripeSubscriptionId: 'sub_123',
          plan: 'PREMIUM',
          status: 'ACTIVE',
          stripePriceId: 'price_premium_test',
          cancelAtPeriodEnd: false,
          pastDueSince: null,
        }),
      });
    });

    it('updates the existing row keyed by stripeSubscriptionId, never creating a duplicate', async () => {
      const prisma = buildPrismaMock({
        subscription: { findUnique: jest.fn().mockResolvedValue({ id: 'row-1', status: 'ACTIVE', pastDueSince: null }) },
      });
      const service = new SubscriptionService(prisma, buildStripeMock(), buildStripeCustomersMock('user-1'));

      await service.upsertFromStripeSubscription({ ...baseEventData, status: 'past_due' });

      expect(prisma.client.subscription.create).not.toHaveBeenCalled();
      expect(prisma.client.subscription.update).toHaveBeenCalledWith({
        where: { id: 'row-1' },
        data: expect.objectContaining({ status: 'PAST_DUE' }),
      });
    });

    it('sets pastDueSince the first time status becomes PAST_DUE', async () => {
      const prisma = buildPrismaMock({
        subscription: { findUnique: jest.fn().mockResolvedValue({ id: 'row-1', status: 'ACTIVE', pastDueSince: null }) },
      });
      const service = new SubscriptionService(prisma, buildStripeMock(), buildStripeCustomersMock('user-1'));

      await service.upsertFromStripeSubscription({ ...baseEventData, status: 'past_due' });

      const call = (prisma.client.subscription.update as jest.Mock).mock.calls[0][0];
      expect(call.data.pastDueSince).toBeInstanceOf(Date);
    });

    it('does not reset pastDueSince on a redelivered webhook for an already-PAST_DUE subscription', async () => {
      const originalPastDueSince = new Date('2026-01-01T00:00:00Z');
      const prisma = buildPrismaMock({
        subscription: {
          findUnique: jest.fn().mockResolvedValue({ id: 'row-1', status: 'PAST_DUE', pastDueSince: originalPastDueSince }),
        },
      });
      const service = new SubscriptionService(prisma, buildStripeMock(), buildStripeCustomersMock('user-1'));

      await service.upsertFromStripeSubscription({ ...baseEventData, status: 'past_due' });

      const call = (prisma.client.subscription.update as jest.Mock).mock.calls[0][0];
      expect(call.data.pastDueSince).toEqual(originalPastDueSince);
    });

    it('clears pastDueSince once status moves away from PAST_DUE (successful retry)', async () => {
      const prisma = buildPrismaMock({
        subscription: {
          findUnique: jest
            .fn()
            .mockResolvedValue({ id: 'row-1', status: 'PAST_DUE', pastDueSince: new Date('2026-01-01T00:00:00Z') }),
        },
      });
      const service = new SubscriptionService(prisma, buildStripeMock(), buildStripeCustomersMock('user-1'));

      await service.upsertFromStripeSubscription({ ...baseEventData, status: 'active' });

      const call = (prisma.client.subscription.update as jest.Mock).mock.calls[0][0];
      expect(call.data.pastDueSince).toBeNull();
    });
  });

  describe('requestCancelAtPeriodEnd', () => {
    it('throws NotFoundException when the user has no paid subscription', async () => {
      const prisma = buildPrismaMock({ subscription: { findFirst: jest.fn().mockResolvedValue(null) } });
      const stripe = buildStripeMock();
      const service = new SubscriptionService(prisma, stripe, buildStripeCustomersMock());

      await expect(service.requestCancelAtPeriodEnd('user-1')).rejects.toBeInstanceOf(NotFoundException);
      expect(stripe.client.subscriptions.update).not.toHaveBeenCalled();
    });

    it('calls Stripe to set cancel_at_period_end, without writing local status/cancelAtPeriodEnd itself', async () => {
      const prisma = buildPrismaMock({
        subscription: {
          findFirst: jest.fn().mockResolvedValue({ id: 'row-1', stripeSubscriptionId: 'sub_123' }),
        },
      });
      const updateSpy = jest.fn().mockResolvedValue({});
      const stripe = buildStripeMock(updateSpy);
      const service = new SubscriptionService(prisma, stripe, buildStripeCustomersMock());

      await service.requestCancelAtPeriodEnd('user-1');

      expect(updateSpy).toHaveBeenCalledWith('sub_123', { cancel_at_period_end: true });
      expect(prisma.client.subscription.update).not.toHaveBeenCalled();
    });
  });

  describe('getCurrentForUser', () => {
    it('scopes the lookup to the given userId, most recent first', async () => {
      const prisma = buildPrismaMock();
      const service = new SubscriptionService(prisma, buildStripeMock(), buildStripeCustomersMock());

      await service.getCurrentForUser('user-1');

      expect(prisma.client.subscription.findFirst).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        orderBy: { createdAt: 'desc' },
      });
    });
  });
});
