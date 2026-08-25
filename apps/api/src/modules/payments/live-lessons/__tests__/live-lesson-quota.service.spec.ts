import { ConflictException } from '@nestjs/common';
import { SubscriptionPlan } from '@deutschflow/types';
import { LiveLessonQuotaService } from '../live-lesson-quota.service';
import type { PrismaService } from '../../../../common/prisma/prisma.service';
import type { PaymentPolicyService } from '../../policy/payment-policy.service';

const defaultPolicy = { premiumWeeklyLiveMinutes: 60, proWeeklyLiveMinutes: 120 };

function buildPrismaMock(overrides?: {
  liveLessonQuotaConsumption?: Partial<Record<string, jest.Mock>>;
}) {
  const client: Record<string, unknown> = {
    liveLessonQuotaConsumption: {
      aggregate: jest.fn().mockResolvedValue({ _sum: { minutesConsumed: 0 } }),
      findUnique: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockImplementation(({ data }: { data: unknown }) => Promise.resolve({ id: 'consumption-1', ...(data as object) })),
      updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      ...overrides?.liveLessonQuotaConsumption,
    },
  };
  // tryConsumeForBooking runs its read-then-write inside a $transaction —
  // the mock invokes the callback with the same mocked client, same
  // pattern as RefundService's tests (real SERIALIZABLE conflict
  // behavior is the database's guarantee, not something a unit test can
  // simulate; we only prove the transaction is issued with the right
  // isolation level).
  client.$transaction = jest.fn((fn: (tx: typeof client) => unknown) => fn(client));
  return { client } as unknown as PrismaService;
}

function buildPolicyMock(overrides?: Partial<typeof defaultPolicy>) {
  return { get: jest.fn().mockResolvedValue({ ...defaultPolicy, ...overrides }) } as unknown as PaymentPolicyService;
}

function buildService(deps?: { prisma?: PrismaService; policy?: PaymentPolicyService }) {
  return new LiveLessonQuotaService(deps?.prisma ?? buildPrismaMock(), deps?.policy ?? buildPolicyMock());
}

describe('LiveLessonQuotaService', () => {
  describe('getWeeklyQuotaMinutes', () => {
    it('reads the PREMIUM ("Pro") minutes from PaymentPolicyService — never a hardcoded constant', async () => {
      const policy = buildPolicyMock({ premiumWeeklyLiveMinutes: 90 });
      const service = buildService({ policy });

      expect(await service.getWeeklyQuotaMinutes(SubscriptionPlan.PREMIUM)).toBe(90);
      expect(policy.get).toHaveBeenCalled();
    });

    it('reads the PRO ("Max") minutes from PaymentPolicyService', async () => {
      const policy = buildPolicyMock({ proWeeklyLiveMinutes: 240 });
      const service = buildService({ policy });

      expect(await service.getWeeklyQuotaMinutes(SubscriptionPlan.PRO)).toBe(240);
    });

    it('grants FREE no live-lesson quota at all', async () => {
      const service = buildService();

      expect(await service.getWeeklyQuotaMinutes(SubscriptionPlan.FREE)).toBe(0);
    });
  });

  describe('getQuotaSummary', () => {
    it('computes remaining minutes as total minus used, for the ISO week containing atDate', async () => {
      const prisma = buildPrismaMock({
        liveLessonQuotaConsumption: { aggregate: jest.fn().mockResolvedValue({ _sum: { minutesConsumed: 20 } }) },
      });
      const service = buildService({ prisma });

      const summary = await service.getQuotaSummary('user-1', SubscriptionPlan.PREMIUM, new Date('2026-08-26T10:00:00.000Z'));

      expect(summary).toEqual({
        weekStart: new Date('2026-08-24T00:00:00.000Z'),
        totalMinutes: 60,
        usedMinutes: 20,
        remainingMinutes: 40,
      });
    });

    it('never reports negative remaining minutes even if usage somehow exceeds the quota', async () => {
      const prisma = buildPrismaMock({
        liveLessonQuotaConsumption: { aggregate: jest.fn().mockResolvedValue({ _sum: { minutesConsumed: 999 } }) },
      });
      const service = buildService({ prisma });

      const summary = await service.getQuotaSummary('user-1', SubscriptionPlan.PREMIUM);

      expect(summary.remainingMinutes).toBe(0);
    });
  });

  describe('tryConsumeForBooking', () => {
    const baseParams = {
      userId: 'user-1',
      plan: SubscriptionPlan.PREMIUM,
      bookingId: 'booking-1',
      startAt: new Date('2026-08-26T10:00:00.000Z'),
      minutesNeeded: 30,
    };

    it('returns null without touching the database when the plan has no quota (FREE)', async () => {
      const prisma = buildPrismaMock();
      const service = buildService({ prisma });

      const result = await service.tryConsumeForBooking({ ...baseParams, plan: SubscriptionPlan.FREE });

      expect(result).toBeNull();
      expect(prisma.client.$transaction).not.toHaveBeenCalled();
    });

    it('consumes quota and creates a consumption row when it fits within the weekly total', async () => {
      const prisma = buildPrismaMock({
        liveLessonQuotaConsumption: { aggregate: jest.fn().mockResolvedValue({ _sum: { minutesConsumed: 0 } }) },
      });
      const service = buildService({ prisma });

      const result = await service.tryConsumeForBooking(baseParams);

      expect(result).toEqual(
        expect.objectContaining({
          userId: 'user-1',
          bookingId: 'booking-1',
          minutesConsumed: 30,
          weekStart: new Date('2026-08-24T00:00:00.000Z'),
          status: 'ACTIVE',
        }),
      );
    });

    it('returns null — not an error — when the remaining quota does not cover the booking', async () => {
      const prisma = buildPrismaMock({
        liveLessonQuotaConsumption: { aggregate: jest.fn().mockResolvedValue({ _sum: { minutesConsumed: 45 } }) }, // 45 used, 60 total, 30 needed -> 75 > 60
      });
      const service = buildService({ prisma });

      const result = await service.tryConsumeForBooking(baseParams);

      expect(result).toBeNull();
      expect(prisma.client.liveLessonQuotaConsumption.create).not.toHaveBeenCalled();
    });

    it('is idempotent — a booking that already has an ACTIVE consumption row is returned unchanged, never double-consumed', async () => {
      const existing = { id: 'consumption-1', bookingId: 'booking-1', status: 'ACTIVE', minutesConsumed: 30 };
      const prisma = buildPrismaMock({
        liveLessonQuotaConsumption: { findUnique: jest.fn().mockResolvedValue(existing) },
      });
      const service = buildService({ prisma });

      const result = await service.tryConsumeForBooking(baseParams);

      expect(result).toBe(existing);
      expect(prisma.client.liveLessonQuotaConsumption.create).not.toHaveBeenCalled();
    });

    it('does not resurrect a RELEASED (cancelled) consumption row for the same booking', async () => {
      const released = { id: 'consumption-1', bookingId: 'booking-1', status: 'RELEASED', minutesConsumed: 30 };
      const prisma = buildPrismaMock({
        liveLessonQuotaConsumption: { findUnique: jest.fn().mockResolvedValue(released) },
      });
      const service = buildService({ prisma });

      const result = await service.tryConsumeForBooking(baseParams);

      expect(result).toBeNull();
      expect(prisma.client.liveLessonQuotaConsumption.create).not.toHaveBeenCalled();
    });

    it('runs the check-then-consume inside a SERIALIZABLE transaction — race-safe against concurrent bookings', async () => {
      const prisma = buildPrismaMock();
      const service = buildService({ prisma });

      await service.tryConsumeForBooking(baseParams);

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

      await expect(service.tryConsumeForBooking(baseParams)).rejects.toBeInstanceOf(ConflictException);
    });
  });

  describe('releaseForBooking', () => {
    it('flips only the ACTIVE consumption row for that booking to RELEASED', async () => {
      const prisma = buildPrismaMock();
      const service = buildService({ prisma });

      await service.releaseForBooking('booking-1');

      expect(prisma.client.liveLessonQuotaConsumption.updateMany).toHaveBeenCalledWith({
        where: { bookingId: 'booking-1', status: 'ACTIVE' },
        data: { status: 'RELEASED' },
      });
    });

    it('is idempotent — releasing a booking with no ACTIVE row is a silent no-op', async () => {
      const prisma = buildPrismaMock({
        liveLessonQuotaConsumption: { updateMany: jest.fn().mockResolvedValue({ count: 0 }) },
      });
      const service = buildService({ prisma });

      await expect(service.releaseForBooking('booking-never-quota-covered')).resolves.toBeUndefined();
    });
  });
});
