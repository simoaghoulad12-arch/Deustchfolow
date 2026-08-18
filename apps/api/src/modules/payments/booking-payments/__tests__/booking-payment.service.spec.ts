import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { BookingPaymentService, computeApplicationFeeCents } from '../booking-payment.service';
import type { PrismaService } from '../../../../common/prisma/prisma.service';
import type { StripeService } from '../../stripe/stripe.service';
import type { StripeCustomerService } from '../../customers/stripe-customer.service';
import type { ConnectAccountService } from '../../connect/connect-account.service';
import type { PaymentPolicyService } from '../../policy/payment-policy.service';

const offering = { id: 'offering-1', priceCents: 2000, currency: 'EUR', tutorId: 'tutor-1' };
const booking = { id: 'booking-1', studentId: 'student-1', tutorId: 'tutor-1', status: 'PENDING', offering };
const tutorAccount = { tutorId: 'tutor-1', stripeAccountId: 'acct_1' };
const defaultPolicy = { commissionBasisPoints: 2000, abandonedBookingTtlMinutes: 15 };

function buildPrismaMock(overrides?: {
  booking?: Partial<Record<string, jest.Mock>>;
  payment?: Partial<Record<string, jest.Mock>>;
  tutorConnectedAccount?: Partial<Record<string, jest.Mock>>;
}) {
  return {
    client: {
      booking: {
        findFirst: jest.fn().mockResolvedValue(booking),
        findMany: jest.fn().mockResolvedValue([]),
        update: jest.fn().mockResolvedValue({}),
        updateMany: jest.fn().mockResolvedValue({ count: 0 }),
        ...overrides?.booking,
      },
      payment: {
        findUnique: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue({}),
        update: jest.fn().mockResolvedValue({}),
        ...overrides?.payment,
      },
      tutorConnectedAccount: {
        findUnique: jest.fn().mockResolvedValue(tutorAccount),
        ...overrides?.tutorConnectedAccount,
      },
    },
  } as unknown as PrismaService;
}

function buildStripeMock(overrides?: { create?: jest.Mock; retrieve?: jest.Mock }) {
  return {
    client: {
      paymentIntents: {
        create: overrides?.create ?? jest.fn().mockResolvedValue({ id: 'pi_1', client_secret: 'secret_1' }),
        retrieve: overrides?.retrieve ?? jest.fn().mockResolvedValue({ client_secret: 'secret_retrieved' }),
      },
    },
  } as unknown as StripeService;
}

function buildStripeCustomersMock() {
  return { getOrCreateForUser: jest.fn().mockResolvedValue({ stripeCustomerId: 'cus_1' }) } as unknown as StripeCustomerService;
}

function buildConnectAccountsMock(isBookable = true) {
  return { isBookable: jest.fn().mockResolvedValue(isBookable) } as unknown as ConnectAccountService;
}

function buildPolicyMock(overrides?: Partial<typeof defaultPolicy>) {
  return { get: jest.fn().mockResolvedValue({ ...defaultPolicy, ...overrides }) } as unknown as PaymentPolicyService;
}

function buildService(deps?: {
  prisma?: PrismaService;
  stripe?: StripeService;
  stripeCustomers?: StripeCustomerService;
  connectAccounts?: ConnectAccountService;
  policy?: PaymentPolicyService;
}) {
  return new BookingPaymentService(
    deps?.prisma ?? buildPrismaMock(),
    deps?.stripe ?? buildStripeMock(),
    deps?.stripeCustomers ?? buildStripeCustomersMock(),
    deps?.connectAccounts ?? buildConnectAccountsMock(),
    deps?.policy ?? buildPolicyMock(),
  );
}

describe('computeApplicationFeeCents (pure function)', () => {
  it('computes 20% of 2000 cents as 400 cents', () => {
    expect(computeApplicationFeeCents(2000, 2000)).toBe(400);
  });

  it('rounds rather than truncating fractional cents', () => {
    expect(computeApplicationFeeCents(999, 2000)).toBe(200); // 199.8 -> 200
  });

  it('is 0 for a 0% commission rate', () => {
    expect(computeApplicationFeeCents(2000, 0)).toBe(0);
  });
});

describe('BookingPaymentService', () => {
  describe('createCheckout', () => {
    it('throws NotFoundException (never Forbidden) for a booking belonging to a different student', async () => {
      const prisma = buildPrismaMock({ booking: { findFirst: jest.fn().mockResolvedValue(null) } });
      const service = buildService({ prisma });

      await expect(service.createCheckout('someone-else', 'booking-1')).rejects.toBeInstanceOf(NotFoundException);
    });

    it('rejects a booking that is not PENDING', async () => {
      const prisma = buildPrismaMock({
        booking: { findFirst: jest.fn().mockResolvedValue({ ...booking, status: 'CONFIRMED' }) },
      });
      const service = buildService({ prisma });

      await expect(service.createCheckout('student-1', 'booking-1')).rejects.toBeInstanceOf(ConflictException);
    });

    it('rejects when the tutor is not Connect-bookable', async () => {
      const service = buildService({ connectAccounts: buildConnectAccountsMock(false) });

      await expect(service.createCheckout('student-1', 'booking-1')).rejects.toBeInstanceOf(BadRequestException);
    });

    it('creates a destination-charge PaymentIntent with the computed commission, an idempotency key, and persists the Payment row', async () => {
      const createSpy = jest.fn().mockResolvedValue({ id: 'pi_1', client_secret: 'secret_1' });
      const stripe = buildStripeMock({ create: createSpy });
      const prisma = buildPrismaMock();
      const service = buildService({ prisma, stripe });

      const result = await service.createCheckout('student-1', 'booking-1');

      expect(createSpy).toHaveBeenCalledWith(
        {
          amount: 2000,
          currency: 'eur',
          customer: 'cus_1',
          application_fee_amount: 400,
          transfer_data: { destination: 'acct_1' },
          automatic_payment_methods: { enabled: true },
          metadata: { bookingId: 'booking-1' },
        },
        { idempotencyKey: 'booking:booking-1:checkout' },
      );
      expect(prisma.client.payment.create).toHaveBeenCalledWith({
        data: {
          bookingId: 'booking-1',
          stripePaymentIntentId: 'pi_1',
          amountCents: 2000,
          applicationFeeCents: 400,
          currency: 'EUR',
          status: 'REQUIRES_PAYMENT_METHOD',
        },
      });
      expect(result).toEqual({ clientSecret: 'secret_1' });
    });

    it('re-fetches the client secret on a retry of an incomplete checkout, never creating a second PaymentIntent', async () => {
      const createSpy = jest.fn();
      const retrieveSpy = jest.fn().mockResolvedValue({ client_secret: 'secret_retrieved' });
      const prisma = buildPrismaMock({
        payment: {
          findUnique: jest
            .fn()
            .mockResolvedValue({ status: 'REQUIRES_PAYMENT_METHOD', stripePaymentIntentId: 'pi_existing' }),
        },
      });
      const stripe = buildStripeMock({ create: createSpy, retrieve: retrieveSpy });
      const service = buildService({ prisma, stripe });

      const result = await service.createCheckout('student-1', 'booking-1');

      expect(retrieveSpy).toHaveBeenCalledWith('pi_existing');
      expect(createSpy).not.toHaveBeenCalled();
      expect(result).toEqual({ clientSecret: 'secret_retrieved' });
    });

    it('rejects checkout for a booking that already has a completed/in-flight payment (double-payment prevention)', async () => {
      const prisma = buildPrismaMock({
        payment: { findUnique: jest.fn().mockResolvedValue({ status: 'SUCCEEDED', stripePaymentIntentId: 'pi_done' }) },
      });
      const service = buildService({ prisma });

      await expect(service.createCheckout('student-1', 'booking-1')).rejects.toBeInstanceOf(ConflictException);
    });
  });

  describe('upsertFromPaymentIntent', () => {
    it('logs and skips a PaymentIntent event with no bookingId metadata', async () => {
      const prisma = buildPrismaMock();
      const service = buildService({ prisma });

      await service.upsertFromPaymentIntent({ id: 'pi_1', status: 'succeeded', bookingId: undefined });

      expect(prisma.client.payment.update).not.toHaveBeenCalled();
    });

    it('logs and skips for a bookingId with no matching Payment row', async () => {
      const prisma = buildPrismaMock({ payment: { findUnique: jest.fn().mockResolvedValue(null) } });
      const service = buildService({ prisma });

      await service.upsertFromPaymentIntent({ id: 'pi_1', status: 'succeeded', bookingId: 'booking-1' });

      expect(prisma.client.payment.update).not.toHaveBeenCalled();
    });

    it('confirms the booking on a succeeded PaymentIntent', async () => {
      const prisma = buildPrismaMock({
        payment: { findUnique: jest.fn().mockResolvedValue({ id: 'payment-1', status: 'PROCESSING' }) },
      });
      const service = buildService({ prisma });

      await service.upsertFromPaymentIntent({ id: 'pi_1', status: 'succeeded', bookingId: 'booking-1' });

      expect(prisma.client.payment.update).toHaveBeenCalledWith({
        where: { id: 'payment-1' },
        data: { status: 'SUCCEEDED' },
      });
      expect(prisma.client.booking.update).toHaveBeenCalledWith({
        where: { id: 'booking-1' },
        data: { status: 'CONFIRMED' },
      });
    });

    it('cancels the booking on a canceled PaymentIntent', async () => {
      const prisma = buildPrismaMock({
        payment: { findUnique: jest.fn().mockResolvedValue({ id: 'payment-1', status: 'REQUIRES_PAYMENT_METHOD' }) },
      });
      const service = buildService({ prisma });

      await service.upsertFromPaymentIntent({ id: 'pi_1', status: 'canceled', bookingId: 'booking-1' });

      expect(prisma.client.booking.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'booking-1' }, data: expect.objectContaining({ status: 'CANCELLED' }) }),
      );
    });

    it('does not touch Booking.status for an in-progress (processing) PaymentIntent status', async () => {
      const prisma = buildPrismaMock({
        payment: { findUnique: jest.fn().mockResolvedValue({ id: 'payment-1', status: 'REQUIRES_CONFIRMATION' }) },
      });
      const service = buildService({ prisma });

      await service.upsertFromPaymentIntent({ id: 'pi_1', status: 'processing', bookingId: 'booking-1' });

      expect(prisma.client.booking.update).not.toHaveBeenCalled();
    });

    it('logs and skips an unrecognized Stripe PaymentIntent status rather than crashing', async () => {
      const prisma = buildPrismaMock({
        payment: { findUnique: jest.fn().mockResolvedValue({ id: 'payment-1', status: 'PROCESSING' }) },
      });
      const service = buildService({ prisma });

      await service.upsertFromPaymentIntent({ id: 'pi_1', status: 'some_future_status', bookingId: 'booking-1' });

      expect(prisma.client.payment.update).not.toHaveBeenCalled();
    });
  });

  describe('releaseAbandonedBookings', () => {
    const now = new Date('2026-01-01T12:00:00Z');
    const oldEnough = new Date('2026-01-01T11:00:00Z'); // 60 min old
    const tooRecent = new Date('2026-01-01T11:55:00Z'); // 5 min old

    it('releases a PENDING booking with no Payment row at all, past the TTL', async () => {
      const prisma = buildPrismaMock({
        booking: { findMany: jest.fn().mockResolvedValue([{ id: 'b1', createdAt: oldEnough, payment: null }]) },
      });
      const service = buildService({ prisma });

      const count = await service.releaseAbandonedBookings(now);

      expect(count).toBe(1);
      expect(prisma.client.booking.updateMany).toHaveBeenCalledWith({
        where: { id: { in: ['b1'] } },
        data: expect.objectContaining({ status: 'CANCELLED' }),
      });
    });

    it('releases a PENDING booking whose payment never left REQUIRES_PAYMENT_METHOD, past the TTL', async () => {
      const prisma = buildPrismaMock({
        booking: {
          findMany: jest
            .fn()
            .mockResolvedValue([{ id: 'b1', createdAt: oldEnough, payment: { status: 'REQUIRES_PAYMENT_METHOD' } }]),
        },
      });
      const service = buildService({ prisma });

      const count = await service.releaseAbandonedBookings(now);

      expect(count).toBe(1);
    });

    it('does not release a booking still within the TTL window', async () => {
      const prisma = buildPrismaMock({
        booking: { findMany: jest.fn().mockResolvedValue([{ id: 'b1', createdAt: tooRecent, payment: null }]) },
      });
      const service = buildService({ prisma });

      const count = await service.releaseAbandonedBookings(now);

      expect(count).toBe(0);
      expect(prisma.client.booking.updateMany).not.toHaveBeenCalled();
    });

    it('does not release a booking whose payment already succeeded (should never be PENDING, but defensive)', async () => {
      const prisma = buildPrismaMock({
        booking: {
          findMany: jest.fn().mockResolvedValue([{ id: 'b1', createdAt: oldEnough, payment: { status: 'SUCCEEDED' } }]),
        },
      });
      const service = buildService({ prisma });

      const count = await service.releaseAbandonedBookings(now);

      expect(count).toBe(0);
    });

    it('uses the TTL from PaymentPolicy, not a hardcoded value', async () => {
      const prisma = buildPrismaMock({
        booking: { findMany: jest.fn().mockResolvedValue([{ id: 'b1', createdAt: tooRecent, payment: null }]) },
      });
      const policy = buildPolicyMock({ abandonedBookingTtlMinutes: 2 }); // 5 min old > 2 min TTL
      const service = buildService({ prisma, policy });

      const count = await service.releaseAbandonedBookings(now);

      expect(count).toBe(1);
    });
  });
});
