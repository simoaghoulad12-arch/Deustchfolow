import { BadRequestException, ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { RefundInitiatorRole } from '@deutschflow/types';
import { RefundService } from '../refund.service';
import type { PrismaService } from '../../../../common/prisma/prisma.service';
import type { StripeService } from '../../stripe/stripe.service';
import type { PaymentPolicyService } from '../../policy/payment-policy.service';

const succeededPayment = { id: 'payment-1', bookingId: 'booking-1', amountCents: 2000, status: 'SUCCEEDED', stripePaymentIntentId: 'pi_1' };
const defaultPolicy = { supportRefundLimitCents: 500 };
const createdRefund = { id: 'refund-1', paymentId: 'payment-1', amountCents: 2000, status: 'PENDING' };

function buildPrismaMock(overrides?: {
  payment?: Partial<Record<string, jest.Mock>>;
  refund?: Partial<Record<string, jest.Mock>>;
  booking?: Partial<Record<string, jest.Mock>>;
}) {
  const client: Record<string, unknown> = {
    payment: {
      findUnique: jest.fn().mockResolvedValue(succeededPayment),
      update: jest.fn().mockResolvedValue({}),
      ...overrides?.payment,
    },
    refund: {
      create: jest.fn().mockResolvedValue(createdRefund),
      findUnique: jest.fn().mockResolvedValue(createdRefund),
      update: jest.fn().mockResolvedValue({}),
      aggregate: jest.fn().mockResolvedValue({ _sum: { amountCents: 0 } }),
      ...overrides?.refund,
    },
    booking: {
      update: jest.fn().mockResolvedValue({}),
      ...overrides?.booking,
    },
  };
  // initiateRefund runs its balance/limit checks + local Refund.create
  // inside a $transaction — the mock invokes the callback with the same
  // mocked client, which is enough to exercise the real branch logic
  // (real Postgres SERIALIZABLE conflict behavior is not something a
  // unit test can simulate; that guarantee is the database's, tested by
  // the transaction actually being issued with the right isolation
  // level, not re-proven here).
  client.$transaction = jest.fn((fn: (tx: typeof client) => unknown) => fn(client));
  return { client } as unknown as PrismaService;
}

function buildStripeMock(createSpy?: jest.Mock) {
  return {
    client: {
      refunds: { create: createSpy ?? jest.fn().mockResolvedValue({ id: 're_1', status: 'succeeded' }) },
    },
  } as unknown as StripeService;
}

function buildPolicyMock(overrides?: Partial<typeof defaultPolicy>) {
  return { get: jest.fn().mockResolvedValue({ ...defaultPolicy, ...overrides }) } as unknown as PaymentPolicyService;
}

function buildService(deps?: { prisma?: PrismaService; stripe?: StripeService; policy?: PaymentPolicyService }) {
  return new RefundService(deps?.prisma ?? buildPrismaMock(), deps?.stripe ?? buildStripeMock(), deps?.policy ?? buildPolicyMock());
}

describe('RefundService', () => {
  describe('initiateRefund', () => {
    it('throws NotFoundException for a nonexistent payment', async () => {
      const prisma = buildPrismaMock({ payment: { findUnique: jest.fn().mockResolvedValue(null) } });
      const service = buildService({ prisma });

      await expect(
        service.initiateRefund('admin-1', RefundInitiatorRole.ADMIN, 'nope', 500, undefined),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('rejects a payment that is not in a refundable status', async () => {
      const prisma = buildPrismaMock({
        payment: { findUnique: jest.fn().mockResolvedValue({ ...succeededPayment, status: 'REQUIRES_PAYMENT_METHOD' }) },
      });
      const service = buildService({ prisma });

      await expect(
        service.initiateRefund('admin-1', RefundInitiatorRole.ADMIN, 'payment-1', 500, undefined),
      ).rejects.toBeInstanceOf(ConflictException);
    });

    it('rejects an amount exceeding the remaining refundable balance', async () => {
      const prisma = buildPrismaMock({ refund: { aggregate: jest.fn().mockResolvedValue({ _sum: { amountCents: 1500 } }) } });
      const service = buildService({ prisma });

      // remaining = 2000 - 1500 = 500; requesting 600 should fail
      await expect(
        service.initiateRefund('admin-1', RefundInitiatorRole.ADMIN, 'payment-1', 600, undefined),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('rejects SUPPORT initiating above the configured limit — no pending-approval row, just rejected', async () => {
      const prisma = buildPrismaMock();
      const policy = buildPolicyMock({ supportRefundLimitCents: 500 });
      const service = buildService({ prisma, policy });

      await expect(
        service.initiateRefund('support-1', RefundInitiatorRole.SUPPORT, 'payment-1', 1000, undefined),
      ).rejects.toBeInstanceOf(ForbiddenException);
      expect(prisma.client.refund.create).not.toHaveBeenCalled();
    });

    it('allows SUPPORT to initiate within the configured limit', async () => {
      const prisma = buildPrismaMock();
      const policy = buildPolicyMock({ supportRefundLimitCents: 500 });
      const service = buildService({ prisma, policy });

      await service.initiateRefund('support-1', RefundInitiatorRole.SUPPORT, 'payment-1', 500, undefined);

      expect(prisma.client.refund.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ requiredAdminApproval: false }) }),
      );
    });

    it('rejects a SUPPORT refund that would cumulatively exceed the limit across multiple prior SUPPORT refunds on the same payment', async () => {
      // Two prior SUPPORT refunds already committed 400 cents; limit is
      // 500. This request (200 cents) is individually within the limit
      // but would push the SUPPORT-cumulative total to 600 — must be
      // rejected even though no single request exceeds the limit alone.
      const aggregate = jest.fn().mockResolvedValue({ _sum: { amountCents: 0 } });
      // First call: committed-balance check (all roles) -> 400 already refunded.
      // Second call: cumulative SUPPORT-only check -> same 400, all by SUPPORT.
      aggregate.mockResolvedValueOnce({ _sum: { amountCents: 400 } });
      aggregate.mockResolvedValueOnce({ _sum: { amountCents: 400 } });
      const prisma = buildPrismaMock({ refund: { aggregate } });
      const policy = buildPolicyMock({ supportRefundLimitCents: 500 });
      const service = buildService({ prisma, policy });

      await expect(
        service.initiateRefund('support-1', RefundInitiatorRole.SUPPORT, 'payment-1', 200, undefined),
      ).rejects.toBeInstanceOf(ForbiddenException);
      expect(prisma.client.refund.create).not.toHaveBeenCalled();
    });

    it('allows a SUPPORT refund whose cumulative total (with prior SUPPORT refunds) stays within the limit', async () => {
      // Default covers applyRefundOutcome's post-Stripe-success sum check;
      // the two explicit once-values cover prepareRefund's balance and
      // cumulative-SUPPORT checks specifically.
      const aggregate = jest.fn().mockResolvedValue({ _sum: { amountCents: 500 } });
      aggregate.mockResolvedValueOnce({ _sum: { amountCents: 300 } }); // committed-balance check
      aggregate.mockResolvedValueOnce({ _sum: { amountCents: 300 } }); // cumulative SUPPORT check
      const prisma = buildPrismaMock({ refund: { aggregate } });
      const policy = buildPolicyMock({ supportRefundLimitCents: 500 });
      const service = buildService({ prisma, policy });

      await service.initiateRefund('support-1', RefundInitiatorRole.SUPPORT, 'payment-1', 200, undefined);

      expect(prisma.client.refund.create).toHaveBeenCalled();
    });

    it('runs the balance/limit checks and refund creation inside a SERIALIZABLE transaction', async () => {
      const prisma = buildPrismaMock();
      const service = buildService({ prisma });

      await service.initiateRefund('admin-1', RefundInitiatorRole.ADMIN, 'payment-1', 500, undefined);

      expect(prisma.client.$transaction).toHaveBeenCalledWith(
        expect.any(Function),
        expect.objectContaining({ isolationLevel: 'Serializable' }),
      );
    });

    it('maps a Postgres serialization conflict (P2034) to a clean 409 Conflict', async () => {
      const { Prisma } = jest.requireActual('@deutschflow/database');
      const conflictError = new Prisma.PrismaClientKnownRequestError('Transaction conflict', {
        code: 'P2034',
        clientVersion: '5.0.0',
      });
      const prisma = buildPrismaMock();
      (prisma.client.$transaction as jest.Mock).mockRejectedValueOnce(conflictError);
      const service = buildService({ prisma });

      await expect(
        service.initiateRefund('admin-1', RefundInitiatorRole.ADMIN, 'payment-1', 500, undefined),
      ).rejects.toBeInstanceOf(ConflictException);
    });

    it('allows ADMIN to initiate above the SUPPORT limit, recording requiredAdminApproval=true for audit', async () => {
      const prisma = buildPrismaMock();
      const policy = buildPolicyMock({ supportRefundLimitCents: 500 });
      const service = buildService({ prisma, policy });

      await service.initiateRefund('admin-1', RefundInitiatorRole.ADMIN, 'payment-1', 2000, undefined);

      expect(prisma.client.refund.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ requiredAdminApproval: true, initiatedByRole: 'ADMIN' }) }),
      );
    });

    it('calls Stripe with an idempotency key derived from the local refund id', async () => {
      const createSpy = jest.fn().mockResolvedValue({ id: 're_1', status: 'succeeded' });
      const stripe = buildStripeMock(createSpy);
      const service = buildService({ stripe });

      await service.initiateRefund('admin-1', RefundInitiatorRole.ADMIN, 'payment-1', 2000, undefined);

      expect(createSpy).toHaveBeenCalledWith(
        { payment_intent: 'pi_1', amount: 2000 },
        { idempotencyKey: 'refund:refund-1' },
      );
    });

    it('sets Payment and Booking to REFUND_PENDING immediately for a full refund of the remaining balance', async () => {
      const prisma = buildPrismaMock();
      const service = buildService({ prisma });

      await service.initiateRefund('admin-1', RefundInitiatorRole.ADMIN, 'payment-1', 2000, undefined);

      expect(prisma.client.payment.update).toHaveBeenCalledWith({
        where: { id: 'payment-1' },
        data: { status: 'REFUND_PENDING' },
      });
      expect(prisma.client.booking.update).toHaveBeenCalledWith({
        where: { id: 'booking-1' },
        data: { status: 'REFUND_PENDING' },
      });
    });

    it('does NOT touch Booking.status for a partial refund', async () => {
      const prisma = buildPrismaMock();
      const service = buildService({ prisma });

      await service.initiateRefund('admin-1', RefundInitiatorRole.ADMIN, 'payment-1', 500, undefined);

      expect(prisma.client.booking.update).not.toHaveBeenCalled();
    });
  });

  describe('upsertFromStripeRefund (webhook-driven)', () => {
    it('logs and skips an unknown Stripe refund id', async () => {
      const prisma = buildPrismaMock({ refund: { findUnique: jest.fn().mockResolvedValue(null) } });
      const service = buildService({ prisma });

      await service.upsertFromStripeRefund('re_unknown', 'succeeded');

      expect(prisma.client.refund.update).not.toHaveBeenCalled();
    });

    it('marks the payment REFUNDED once total succeeded refunds reach the full amount', async () => {
      const prisma = buildPrismaMock({
        refund: {
          findUnique: jest.fn().mockResolvedValue({ id: 'refund-1', paymentId: 'payment-1' }),
          aggregate: jest.fn().mockResolvedValue({ _sum: { amountCents: 2000 } }),
        },
      });
      const service = buildService({ prisma });

      await service.upsertFromStripeRefund('re_1', 'succeeded');

      expect(prisma.client.payment.update).toHaveBeenCalledWith({ where: { id: 'payment-1' }, data: { status: 'REFUNDED' } });
      expect(prisma.client.booking.update).toHaveBeenCalledWith({ where: { id: 'booking-1' }, data: { status: 'REFUNDED' } });
    });

    it('marks the payment PARTIALLY_REFUNDED when total succeeded refunds are still less than the full amount', async () => {
      const prisma = buildPrismaMock({
        refund: {
          findUnique: jest.fn().mockResolvedValue({ id: 'refund-1', paymentId: 'payment-1' }),
          aggregate: jest.fn().mockResolvedValue({ _sum: { amountCents: 500 } }),
        },
      });
      const service = buildService({ prisma });

      await service.upsertFromStripeRefund('re_1', 'succeeded');

      expect(prisma.client.payment.update).toHaveBeenCalledWith({ where: { id: 'payment-1' }, data: { status: 'PARTIALLY_REFUNDED' } });
      expect(prisma.client.booking.update).not.toHaveBeenCalled();
    });

    it('records a FAILED refund without reverting Payment/Booking automatically (documented limitation)', async () => {
      const prisma = buildPrismaMock({
        refund: { findUnique: jest.fn().mockResolvedValue({ id: 'refund-1', paymentId: 'payment-1' }) },
      });
      const service = buildService({ prisma });

      await service.upsertFromStripeRefund('re_1', 'failed');

      expect(prisma.client.refund.update).toHaveBeenCalledWith({
        where: { id: 'refund-1' },
        data: { stripeRefundId: 're_1', status: 'FAILED' },
      });
      expect(prisma.client.payment.update).not.toHaveBeenCalled();
    });

    it('logs and skips an unrecognized Stripe refund status rather than crashing', async () => {
      const prisma = buildPrismaMock({
        refund: { findUnique: jest.fn().mockResolvedValue({ id: 'refund-1', paymentId: 'payment-1' }) },
      });
      const service = buildService({ prisma });

      await service.upsertFromStripeRefund('re_1', 'some_future_status');

      expect(prisma.client.refund.update).not.toHaveBeenCalled();
    });
  });

  describe('recordDispute', () => {
    it('logs and skips for an unrecognized PaymentIntent id', async () => {
      const prisma = buildPrismaMock({ payment: { findUnique: jest.fn().mockResolvedValue(null) } });
      const service = buildService({ prisma });

      await service.recordDispute('pi_unknown', 'needs_response');

      expect(prisma.client.payment.update).not.toHaveBeenCalled();
    });

    it('sets disputedAt the first time a dispute is recorded', async () => {
      const prisma = buildPrismaMock({
        payment: { findUnique: jest.fn().mockResolvedValue({ ...succeededPayment, disputedAt: null }) },
      });
      const service = buildService({ prisma });

      await service.recordDispute('pi_1', 'needs_response');

      const call = (prisma.client.payment.update as jest.Mock).mock.calls[0][0];
      expect(call.data.disputedAt).toBeInstanceOf(Date);
      expect(call.data.disputeStatus).toBe('needs_response');
    });

    it('does not reset disputedAt on a later status update, but does update disputeStatus', async () => {
      const originalDisputedAt = new Date('2026-01-01T00:00:00Z');
      const prisma = buildPrismaMock({
        payment: { findUnique: jest.fn().mockResolvedValue({ ...succeededPayment, disputedAt: originalDisputedAt }) },
      });
      const service = buildService({ prisma });

      await service.recordDispute('pi_1', 'won');

      const call = (prisma.client.payment.update as jest.Mock).mock.calls[0][0];
      expect(call.data.disputedAt).toEqual(originalDisputedAt);
      expect(call.data.disputeStatus).toBe('won');
    });
  });
});
