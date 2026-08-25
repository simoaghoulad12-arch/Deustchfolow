import { PaymentPolicyService } from '../payment-policy.service';
import type { PrismaService } from '../../../../common/prisma/prisma.service';

const defaultPolicy = {
  id: 'default',
  commissionBasisPoints: 2000,
  supportRefundLimitCents: 5000,
  pastDueGracePeriodDays: 7,
  abandonedBookingTtlMinutes: 15,
  premiumWeeklyLiveMinutes: 60,
  proWeeklyLiveMinutes: 120,
  updatedAt: new Date(),
  updatedByUserId: null,
};

function buildPrismaMock(overrides?: Partial<Record<string, jest.Mock>>) {
  return {
    client: {
      paymentPolicy: {
        findUnique: jest.fn().mockResolvedValue(defaultPolicy),
        create: jest.fn().mockResolvedValue(defaultPolicy),
        update: jest.fn().mockResolvedValue(defaultPolicy),
        ...overrides,
      },
    },
  } as unknown as PrismaService;
}

describe('PaymentPolicyService', () => {
  describe('get', () => {
    it('returns the existing policy row when one exists', async () => {
      const prisma = buildPrismaMock();
      const service = new PaymentPolicyService(prisma);

      const policy = await service.get();

      expect(policy).toEqual(defaultPolicy);
      expect(prisma.client.paymentPolicy.create).not.toHaveBeenCalled();
    });

    it('creates the row with schema defaults when none exists yet (no separate seed step required)', async () => {
      const prisma = buildPrismaMock({ findUnique: jest.fn().mockResolvedValue(null) });
      const service = new PaymentPolicyService(prisma);

      await service.get();

      expect(prisma.client.paymentPolicy.create).toHaveBeenCalledWith({ data: { id: 'default' } });
    });
  });

  describe('update', () => {
    it('only updates the fields provided, leaving others untouched', async () => {
      const prisma = buildPrismaMock();
      const service = new PaymentPolicyService(prisma);

      await service.update({ commissionBasisPoints: 1500 }, 'admin-1');

      expect(prisma.client.paymentPolicy.update).toHaveBeenCalledWith({
        where: { id: 'default' },
        data: { commissionBasisPoints: 1500, updatedByUserId: 'admin-1' },
      });
    });

    it('records who made the change', async () => {
      const prisma = buildPrismaMock();
      const service = new PaymentPolicyService(prisma);

      await service.update({ pastDueGracePeriodDays: 10 }, 'admin-2');

      expect(prisma.client.paymentPolicy.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ updatedByUserId: 'admin-2' }) }),
      );
    });

    it('updates the PRO/MAX weekly live-lesson quotas — never hardcoded elsewhere', async () => {
      const prisma = buildPrismaMock();
      const service = new PaymentPolicyService(prisma);

      await service.update({ premiumWeeklyLiveMinutes: 90, proWeeklyLiveMinutes: 180 }, 'admin-3');

      expect(prisma.client.paymentPolicy.update).toHaveBeenCalledWith({
        where: { id: 'default' },
        data: { premiumWeeklyLiveMinutes: 90, proWeeklyLiveMinutes: 180, updatedByUserId: 'admin-3' },
      });
    });
  });
});
