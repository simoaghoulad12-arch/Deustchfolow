import { BadRequestException, NotFoundException } from '@nestjs/common';
import { TutorAvailabilityService } from '../tutor-availability.service';
import type { PrismaService } from '../../../../common/prisma/prisma.service';

const rule = {
  id: 'rule-1',
  tutorId: 'tutor-1',
  weekday: 1,
  startMinute: 540,
  endMinute: 600,
  createdAt: new Date(),
};

const exception = {
  id: 'exception-1',
  tutorId: 'tutor-1',
  startAt: new Date('2026-09-01T00:00:00Z'),
  endAt: new Date('2026-09-02T00:00:00Z'),
  isBlocked: true,
  reason: 'Urlaub',
  createdAt: new Date(),
};

function buildPrismaMock(overrides?: {
  tutorProfile?: Partial<Record<string, jest.Mock>>;
  tutorAvailabilityRule?: Partial<Record<string, jest.Mock>>;
  tutorAvailabilityException?: Partial<Record<string, jest.Mock>>;
  booking?: Partial<Record<string, jest.Mock>>;
}) {
  return {
    client: {
      tutorProfile: {
        findUnique: jest.fn().mockResolvedValue({ userId: 'tutor-1', timezone: 'Europe/Berlin', isActive: true }),
        ...overrides?.tutorProfile,
      },
      tutorAvailabilityRule: {
        findMany: jest.fn().mockResolvedValue([rule]),
        create: jest.fn().mockResolvedValue(rule),
        findFirst: jest.fn().mockResolvedValue(rule),
        delete: jest.fn().mockResolvedValue(rule),
        ...overrides?.tutorAvailabilityRule,
      },
      tutorAvailabilityException: {
        findMany: jest.fn().mockResolvedValue([]),
        create: jest.fn().mockResolvedValue(exception),
        findFirst: jest.fn().mockResolvedValue(exception),
        delete: jest.fn().mockResolvedValue(exception),
        ...overrides?.tutorAvailabilityException,
      },
      booking: {
        findMany: jest.fn().mockResolvedValue([]),
        ...overrides?.booking,
      },
    },
  } as unknown as PrismaService;
}

describe('TutorAvailabilityService', () => {
  describe('createRule', () => {
    it('requires a tutor profile to exist first', async () => {
      const prisma = buildPrismaMock({ tutorProfile: { findUnique: jest.fn().mockResolvedValue(null) } });
      const service = new TutorAvailabilityService(prisma);

      await expect(
        service.createRule('tutor-1', { weekday: 1, startMinute: 540, endMinute: 600 }),
      ).rejects.toBeInstanceOf(NotFoundException);
      expect(prisma.client.tutorAvailabilityRule.create).not.toHaveBeenCalled();
    });

    it('rejects an endMinute that is not after startMinute', async () => {
      const prisma = buildPrismaMock();
      const service = new TutorAvailabilityService(prisma);

      await expect(
        service.createRule('tutor-1', { weekday: 1, startMinute: 600, endMinute: 540 }),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(prisma.client.tutorAvailabilityRule.create).not.toHaveBeenCalled();
    });

    it('creates the rule scoped to the calling tutor id', async () => {
      const prisma = buildPrismaMock();
      const service = new TutorAvailabilityService(prisma);

      await service.createRule('tutor-1', { weekday: 1, startMinute: 540, endMinute: 600 });

      expect(prisma.client.tutorAvailabilityRule.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ tutorId: 'tutor-1' }) }),
      );
    });
  });

  describe('deleteRule', () => {
    it('throws NotFoundException (never Forbidden) when the rule belongs to a different tutor', async () => {
      const prisma = buildPrismaMock({
        tutorAvailabilityRule: { findFirst: jest.fn().mockResolvedValue(null) },
      });
      const service = new TutorAvailabilityService(prisma);

      await expect(service.deleteRule('tutor-2', 'rule-1')).rejects.toBeInstanceOf(NotFoundException);
      expect(prisma.client.tutorAvailabilityRule.delete).not.toHaveBeenCalled();
    });

    it('scopes the ownership lookup to (id, tutorId) together before deleting', async () => {
      const prisma = buildPrismaMock();
      const service = new TutorAvailabilityService(prisma);

      await service.deleteRule('tutor-1', 'rule-1');

      expect(prisma.client.tutorAvailabilityRule.findFirst).toHaveBeenCalledWith({
        where: { id: 'rule-1', tutorId: 'tutor-1' },
      });
      expect(prisma.client.tutorAvailabilityRule.delete).toHaveBeenCalledWith({ where: { id: 'rule-1' } });
    });
  });

  describe('createException', () => {
    it('rejects an endAt that is not after startAt', async () => {
      const prisma = buildPrismaMock();
      const service = new TutorAvailabilityService(prisma);

      await expect(
        service.createException('tutor-1', {
          startAt: '2026-09-02T00:00:00.000Z',
          endAt: '2026-09-01T00:00:00.000Z',
        }),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(prisma.client.tutorAvailabilityException.create).not.toHaveBeenCalled();
    });

    it('defaults isBlocked to true (vacation/blocked-time is the common case)', async () => {
      const prisma = buildPrismaMock();
      const service = new TutorAvailabilityService(prisma);

      await service.createException('tutor-1', {
        startAt: '2026-09-01T00:00:00.000Z',
        endAt: '2026-09-02T00:00:00.000Z',
      });

      expect(prisma.client.tutorAvailabilityException.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ isBlocked: true }) }),
      );
    });
  });

  describe('deleteException', () => {
    it('throws NotFoundException when the exception belongs to a different tutor', async () => {
      const prisma = buildPrismaMock({
        tutorAvailabilityException: { findFirst: jest.fn().mockResolvedValue(null) },
      });
      const service = new TutorAvailabilityService(prisma);

      await expect(service.deleteException('tutor-2', 'exception-1')).rejects.toBeInstanceOf(
        NotFoundException,
      );
      expect(prisma.client.tutorAvailabilityException.delete).not.toHaveBeenCalled();
    });
  });

  describe('findFreeSlots', () => {
    it('throws NotFoundException for a nonexistent tutor', async () => {
      const prisma = buildPrismaMock({ tutorProfile: { findUnique: jest.fn().mockResolvedValue(null) } });
      const service = new TutorAvailabilityService(prisma);

      await expect(
        service.findFreeSlots('nope', { from: '2026-08-17T00:00:00.000Z', to: '2026-08-18T00:00:00.000Z' }),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('throws NotFoundException for a deactivated tutor', async () => {
      const prisma = buildPrismaMock({
        tutorProfile: {
          findUnique: jest
            .fn()
            .mockResolvedValue({ userId: 'tutor-1', timezone: 'Europe/Berlin', isActive: false }),
        },
      });
      const service = new TutorAvailabilityService(prisma);

      await expect(
        service.findFreeSlots('tutor-1', { from: '2026-08-17T00:00:00.000Z', to: '2026-08-18T00:00:00.000Z' }),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('feeds the tutor timezone, rules, and combined busy ranges (exceptions + active bookings) into computeFreeSlots', async () => {
      const prisma = buildPrismaMock({
        tutorAvailabilityException: {
          findMany: jest.fn().mockResolvedValue([exception]),
        },
        booking: {
          findMany: jest.fn().mockResolvedValue([
            { startAt: new Date('2026-08-17T09:00:00Z'), endAt: new Date('2026-08-17T09:30:00Z') },
          ]),
        },
      });
      const service = new TutorAvailabilityService(prisma);

      const slots = await service.findFreeSlots('tutor-1', {
        from: '2026-08-17T00:00:00.000Z',
        to: '2026-08-24T00:00:00.000Z',
      });

      expect(Array.isArray(slots)).toBe(true);
      expect(prisma.client.booking.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ tutorId: 'tutor-1', status: { in: ['PENDING', 'CONFIRMED'] } }),
        }),
      );
    });

    it('only excludes blocked exceptions, not open/non-blocking ones, from the availability window', async () => {
      const prisma = buildPrismaMock();
      const service = new TutorAvailabilityService(prisma);

      await service.findFreeSlots('tutor-1', {
        from: '2026-08-17T00:00:00.000Z',
        to: '2026-08-24T00:00:00.000Z',
      });

      expect(prisma.client.tutorAvailabilityException.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ isBlocked: true }) }),
      );
    });
  });

  describe('assertBookable', () => {
    // rule fixture: Monday (weekday 1), 09:00-10:00 Europe/Berlin.
    // 2026-08-17 is a Monday; Berlin is UTC+2 (CEST) in August.
    const withinRule = {
      start: new Date('2026-08-17T07:15:00.000Z'), // 09:15 Berlin
      end: new Date('2026-08-17T07:45:00.000Z'), // 09:45 Berlin
    };
    const outsideRule = {
      start: new Date('2026-08-17T11:00:00.000Z'), // 13:00 Berlin
      end: new Date('2026-08-17T11:30:00.000Z'),
    };

    it('throws NotFoundException for a nonexistent tutor', async () => {
      const prisma = buildPrismaMock({ tutorProfile: { findUnique: jest.fn().mockResolvedValue(null) } });
      const service = new TutorAvailabilityService(prisma);

      await expect(service.assertBookable('nope', withinRule.start, withinRule.end)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('resolves without throwing for a slot inside a declared rule window', async () => {
      const prisma = buildPrismaMock();
      const service = new TutorAvailabilityService(prisma);

      await expect(
        service.assertBookable('tutor-1', withinRule.start, withinRule.end),
      ).resolves.toBeUndefined();
    });

    it('throws BadRequestException for a slot outside any declared rule window', async () => {
      const prisma = buildPrismaMock();
      const service = new TutorAvailabilityService(prisma);

      await expect(service.assertBookable('tutor-1', outsideRule.start, outsideRule.end)).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });

    it('throws BadRequestException for a slot overlapping a blocked exception, even inside a rule window', async () => {
      const prisma = buildPrismaMock({
        tutorAvailabilityException: {
          findMany: jest.fn().mockResolvedValue([
            {
              ...exception,
              startAt: new Date('2026-08-17T00:00:00.000Z'),
              endAt: new Date('2026-08-18T00:00:00.000Z'),
            },
          ]),
        },
      });
      const service = new TutorAvailabilityService(prisma);

      await expect(service.assertBookable('tutor-1', withinRule.start, withinRule.end)).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });
  });
});
