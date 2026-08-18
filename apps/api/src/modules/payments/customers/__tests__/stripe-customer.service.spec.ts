import { NotFoundException } from '@nestjs/common';
import { StripeCustomerService } from '../stripe-customer.service';
import type { PrismaService } from '../../../../common/prisma/prisma.service';
import type { StripeService } from '../../stripe/stripe.service';

const user = { id: 'user-1', email: 'student@example.com' };
const existingRow = { userId: 'user-1', stripeCustomerId: 'cus_existing', createdAt: new Date() };

function buildPrismaMock(overrides?: {
  stripeCustomer?: Partial<Record<string, jest.Mock>>;
  user?: Partial<Record<string, jest.Mock>>;
}) {
  return {
    client: {
      stripeCustomer: {
        findUnique: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue({ ...existingRow, stripeCustomerId: 'cus_new' }),
        ...overrides?.stripeCustomer,
      },
      user: {
        findUnique: jest.fn().mockResolvedValue(user),
        ...overrides?.user,
      },
    },
  } as unknown as PrismaService;
}

function buildStripeMock(createImpl?: jest.Mock) {
  return {
    client: {
      customers: {
        create: createImpl ?? jest.fn().mockResolvedValue({ id: 'cus_new' }),
      },
    },
  } as unknown as StripeService;
}

describe('StripeCustomerService', () => {
  describe('getOrCreateForUser', () => {
    it('returns the existing row without calling Stripe when one already exists', async () => {
      const prisma = buildPrismaMock({
        stripeCustomer: { findUnique: jest.fn().mockResolvedValue(existingRow) },
      });
      const stripe = buildStripeMock();
      const service = new StripeCustomerService(prisma, stripe);

      const result = await service.getOrCreateForUser('user-1');

      expect(result).toEqual({ stripeCustomerId: 'cus_existing' });
      expect(stripe.client.customers.create).not.toHaveBeenCalled();
      expect(prisma.client.stripeCustomer.create).not.toHaveBeenCalled();
    });

    it('throws NotFoundException for a nonexistent user rather than calling Stripe', async () => {
      const prisma = buildPrismaMock({ user: { findUnique: jest.fn().mockResolvedValue(null) } });
      const stripe = buildStripeMock();
      const service = new StripeCustomerService(prisma, stripe);

      await expect(service.getOrCreateForUser('nope')).rejects.toBeInstanceOf(NotFoundException);
      expect(stripe.client.customers.create).not.toHaveBeenCalled();
    });

    it('creates a Stripe Customer with the user email and userId metadata, then persists the local row', async () => {
      const createSpy = jest.fn().mockResolvedValue({ id: 'cus_new' });
      const prisma = buildPrismaMock();
      const stripe = buildStripeMock(createSpy);
      const service = new StripeCustomerService(prisma, stripe);

      const result = await service.getOrCreateForUser('user-1');

      expect(createSpy).toHaveBeenCalledWith({
        email: 'student@example.com',
        metadata: { userId: 'user-1' },
      });
      expect(prisma.client.stripeCustomer.create).toHaveBeenCalledWith({
        data: { userId: 'user-1', stripeCustomerId: 'cus_new' },
      });
      expect(result).toEqual({ stripeCustomerId: 'cus_new' });
    });
  });

  describe('findForUser', () => {
    it('returns null when no Stripe customer exists yet, without touching Stripe', async () => {
      const prisma = buildPrismaMock();
      const stripe = buildStripeMock();
      const service = new StripeCustomerService(prisma, stripe);

      const result = await service.findForUser('user-1');

      expect(result).toBeNull();
      expect(stripe.client.customers.create).not.toHaveBeenCalled();
    });

    it('returns the existing customer id', async () => {
      const prisma = buildPrismaMock({
        stripeCustomer: { findUnique: jest.fn().mockResolvedValue(existingRow) },
      });
      const stripe = buildStripeMock();
      const service = new StripeCustomerService(prisma, stripe);

      const result = await service.findForUser('user-1');

      expect(result).toEqual({ stripeCustomerId: 'cus_existing' });
    });
  });
});
