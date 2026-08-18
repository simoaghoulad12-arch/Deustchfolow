import { TutorPayoutService } from '../tutor-payout.service';
import type { PrismaService } from '../../../../common/prisma/prisma.service';

const existingAccount = { tutorId: 'tutor-1', stripeAccountId: 'acct_1' };

function buildPrismaMock(overrides?: {
  tutorConnectedAccount?: Partial<Record<string, jest.Mock>>;
  payment?: Partial<Record<string, jest.Mock>>;
  tutorPayout?: Partial<Record<string, jest.Mock>>;
}) {
  return {
    client: {
      tutorConnectedAccount: {
        findUnique: jest.fn().mockResolvedValue(existingAccount),
        ...overrides?.tutorConnectedAccount,
      },
      payment: {
        findFirst: jest.fn().mockResolvedValue(null),
        ...overrides?.payment,
      },
      tutorPayout: {
        upsert: jest.fn().mockResolvedValue({}),
        findMany: jest.fn().mockResolvedValue([]),
        ...overrides?.tutorPayout,
      },
    },
  } as unknown as PrismaService;
}

function buildService(prisma: PrismaService) {
  return new TutorPayoutService(prisma);
}

describe('TutorPayoutService', () => {
  describe('recordTransfer', () => {
    it('logs and skips when the event has no destination account id', async () => {
      const prisma = buildPrismaMock();
      const service = buildService(prisma);

      await service.recordTransfer({
        stripeTransferId: 'tr_1',
        stripeAccountId: undefined,
        sourceChargeId: 'ch_1',
        amountCents: 1000,
        currency: 'eur',
      });

      expect(prisma.client.tutorPayout.upsert).not.toHaveBeenCalled();
    });

    it('logs and skips when the destination account is not a known TutorConnectedAccount', async () => {
      const prisma = buildPrismaMock({ tutorConnectedAccount: { findUnique: jest.fn().mockResolvedValue(null) } });
      const service = buildService(prisma);

      await service.recordTransfer({
        stripeTransferId: 'tr_1',
        stripeAccountId: 'acct_unknown',
        sourceChargeId: 'ch_1',
        amountCents: 1000,
        currency: 'eur',
      });

      expect(prisma.client.tutorPayout.upsert).not.toHaveBeenCalled();
    });

    it('upserts a PENDING TutorPayout row keyed by stripeTransferId, correlated to the Payment via sourceChargeId', async () => {
      const prisma = buildPrismaMock({
        payment: { findFirst: jest.fn().mockResolvedValue({ id: 'payment-1' }) },
      });
      const service = buildService(prisma);

      await service.recordTransfer({
        stripeTransferId: 'tr_1',
        stripeAccountId: 'acct_1',
        sourceChargeId: 'ch_1',
        amountCents: 4500,
        currency: 'eur',
      });

      expect(prisma.client.payment.findFirst).toHaveBeenCalledWith({ where: { stripeChargeId: 'ch_1' } });
      expect(prisma.client.tutorPayout.upsert).toHaveBeenCalledWith({
        where: { stripeTransferId: 'tr_1' },
        create: {
          tutorId: 'tutor-1',
          paymentId: 'payment-1',
          stripeTransferId: 'tr_1',
          amountCents: 4500,
          currency: 'EUR',
          status: 'PENDING',
        },
        update: {},
      });
    });

    it('records with paymentId undefined when no sourceChargeId is present or no matching Payment is found', async () => {
      const prisma = buildPrismaMock();
      const service = buildService(prisma);

      await service.recordTransfer({
        stripeTransferId: 'tr_2',
        stripeAccountId: 'acct_1',
        sourceChargeId: undefined,
        amountCents: 1000,
        currency: 'eur',
      });

      expect(prisma.client.payment.findFirst).not.toHaveBeenCalled();
      expect(prisma.client.tutorPayout.upsert).toHaveBeenCalledWith(
        expect.objectContaining({ create: expect.objectContaining({ paymentId: undefined }) }),
      );
    });

    it('is idempotent on redelivery (same stripeTransferId upserts, never creates a duplicate row)', async () => {
      const prisma = buildPrismaMock();
      const service = buildService(prisma);

      await service.recordTransfer({
        stripeTransferId: 'tr_1',
        stripeAccountId: 'acct_1',
        sourceChargeId: undefined,
        amountCents: 1000,
        currency: 'eur',
      });
      await service.recordTransfer({
        stripeTransferId: 'tr_1',
        stripeAccountId: 'acct_1',
        sourceChargeId: undefined,
        amountCents: 1000,
        currency: 'eur',
      });

      expect(prisma.client.tutorPayout.upsert).toHaveBeenCalledTimes(2);
      expect((prisma.client.tutorPayout.upsert as jest.Mock).mock.calls[0][0].where).toEqual({ stripeTransferId: 'tr_1' });
      expect((prisma.client.tutorPayout.upsert as jest.Mock).mock.calls[1][0].where).toEqual({ stripeTransferId: 'tr_1' });
    });
  });

  describe('recordPayoutOutcome', () => {
    it('logs and skips when the event has no account id', async () => {
      const prisma = buildPrismaMock();
      const service = buildService(prisma);

      await service.recordPayoutOutcome({
        stripePayoutId: 'po_1',
        stripeAccountId: undefined,
        amountCents: 9900,
        currency: 'eur',
        status: 'PAID',
      });

      expect(prisma.client.tutorPayout.upsert).not.toHaveBeenCalled();
    });

    it('logs and skips for an unknown connected account', async () => {
      const prisma = buildPrismaMock({ tutorConnectedAccount: { findUnique: jest.fn().mockResolvedValue(null) } });
      const service = buildService(prisma);

      await service.recordPayoutOutcome({
        stripePayoutId: 'po_1',
        stripeAccountId: 'acct_unknown',
        amountCents: 9900,
        currency: 'eur',
        status: 'PAID',
      });

      expect(prisma.client.tutorPayout.upsert).not.toHaveBeenCalled();
    });

    it('upserts a TutorPayout row keyed by stripePayoutId with the reported status', async () => {
      const prisma = buildPrismaMock();
      const service = buildService(prisma);

      await service.recordPayoutOutcome({
        stripePayoutId: 'po_1',
        stripeAccountId: 'acct_1',
        amountCents: 9900,
        currency: 'eur',
        status: 'PAID',
      });

      expect(prisma.client.tutorPayout.upsert).toHaveBeenCalledWith({
        where: { stripePayoutId: 'po_1' },
        create: {
          tutorId: 'tutor-1',
          stripePayoutId: 'po_1',
          amountCents: 9900,
          currency: 'EUR',
          status: 'PAID',
        },
        update: { status: 'PAID' },
      });
    });

    it('applies a later FAILED status to an already-recorded payout (upsert update path)', async () => {
      const prisma = buildPrismaMock();
      const service = buildService(prisma);

      await service.recordPayoutOutcome({
        stripePayoutId: 'po_1',
        stripeAccountId: 'acct_1',
        amountCents: 9900,
        currency: 'eur',
        status: 'FAILED',
      });

      expect(prisma.client.tutorPayout.upsert).toHaveBeenCalledWith(
        expect.objectContaining({ update: { status: 'FAILED' } }),
      );
    });
  });

  describe('getPayoutsForTutor', () => {
    it('scopes the query to the given tutorId and orders newest first', async () => {
      const prisma = buildPrismaMock();
      const service = buildService(prisma);

      await service.getPayoutsForTutor('tutor-1');

      expect(prisma.client.tutorPayout.findMany).toHaveBeenCalledWith({
        where: { tutorId: 'tutor-1' },
        orderBy: { createdAt: 'desc' },
      });
    });
  });
});
