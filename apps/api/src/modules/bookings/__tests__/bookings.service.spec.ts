import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { BookingsService } from '../bookings.service';
import type { PrismaService } from '../../../common/prisma/prisma.service';
import type { TutorAvailabilityService } from '../../tutors/availability/tutor-availability.service';

const offering = {
  id: 'offering-1',
  tutorId: 'tutor-1',
  title: '30 Min. Konversation',
  durationMinutes: 30,
  priceCents: 2000,
  currency: 'EUR',
  isActive: true,
};

const futureStart = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

const booking = {
  id: 'booking-1',
  studentId: 'student-1',
  tutorId: 'tutor-1',
  offeringId: 'offering-1',
  startAt: new Date(futureStart),
  endAt: new Date(new Date(futureStart).getTime() + 30 * 60_000),
  studentTimezone: 'Europe/Berlin',
  status: 'PENDING',
  notes: null,
  cancellationReason: null,
};

function buildPrismaMock(overrides?: {
  offering?: Partial<Record<string, jest.Mock>>;
  booking?: Partial<Record<string, jest.Mock>>;
}) {
  return {
    client: {
      offering: {
        findUnique: jest.fn().mockResolvedValue(offering),
        ...overrides?.offering,
      },
      booking: {
        findFirst: jest.fn().mockResolvedValue(null),
        findMany: jest.fn().mockResolvedValue([booking]),
        create: jest.fn().mockResolvedValue(booking),
        update: jest.fn().mockResolvedValue(booking),
        ...overrides?.booking,
      },
    },
  } as unknown as PrismaService;
}

function buildAvailabilityMock(overrides?: Partial<Record<string, jest.Mock>>): TutorAvailabilityService {
  return {
    assertBookable: jest.fn().mockResolvedValue(undefined),
    ...overrides,
  } as unknown as TutorAvailabilityService;
}

describe('BookingsService', () => {
  describe('create', () => {
    it('rejects an invalid IANA timezone before touching the database', async () => {
      const prisma = buildPrismaMock();
      const availability = buildAvailabilityMock();
      const service = new BookingsService(prisma, availability);

      await expect(
        service.create('student-1', { offeringId: 'offering-1', startAt: futureStart, studentTimezone: 'Not/AZone' }),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(prisma.client.booking.create).not.toHaveBeenCalled();
    });

    it('throws NotFoundException for a nonexistent or inactive offering', async () => {
      const prisma = buildPrismaMock({ offering: { findUnique: jest.fn().mockResolvedValue(null) } });
      const availability = buildAvailabilityMock();
      const service = new BookingsService(prisma, availability);

      await expect(
        service.create('student-1', {
          offeringId: 'offering-1',
          startAt: futureStart,
          studentTimezone: 'Europe/Berlin',
        }),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('rejects a tutor booking their own offering', async () => {
      const prisma = buildPrismaMock();
      const availability = buildAvailabilityMock();
      const service = new BookingsService(prisma, availability);

      await expect(
        service.create('tutor-1', {
          offeringId: 'offering-1',
          startAt: futureStart,
          studentTimezone: 'Europe/Berlin',
        }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('rejects a startAt in the past', async () => {
      const prisma = buildPrismaMock();
      const availability = buildAvailabilityMock();
      const service = new BookingsService(prisma, availability);

      await expect(
        service.create('student-1', {
          offeringId: 'offering-1',
          startAt: new Date(Date.now() - 60_000).toISOString(),
          studentTimezone: 'Europe/Berlin',
        }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('delegates availability-window validation to TutorAvailabilityService.assertBookable', async () => {
      const prisma = buildPrismaMock();
      const availability = buildAvailabilityMock();
      const service = new BookingsService(prisma, availability);

      await service.create('student-1', {
        offeringId: 'offering-1',
        startAt: futureStart,
        studentTimezone: 'Europe/Berlin',
      });

      expect(availability.assertBookable).toHaveBeenCalledWith('tutor-1', expect.any(Date), expect.any(Date));
    });

    it('propagates a BadRequestException from assertBookable (slot outside declared hours)', async () => {
      const prisma = buildPrismaMock();
      const availability = buildAvailabilityMock({
        assertBookable: jest.fn().mockRejectedValue(new BadRequestException('outside hours')),
      });
      const service = new BookingsService(prisma, availability);

      await expect(
        service.create('student-1', {
          offeringId: 'offering-1',
          startAt: futureStart,
          studentTimezone: 'Europe/Berlin',
        }),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(prisma.client.booking.create).not.toHaveBeenCalled();
    });

    it('returns a friendly 409 when an overlapping active booking already exists (pre-check)', async () => {
      const prisma = buildPrismaMock({ booking: { findFirst: jest.fn().mockResolvedValue(booking) } });
      const availability = buildAvailabilityMock();
      const service = new BookingsService(prisma, availability);

      await expect(
        service.create('student-1', {
          offeringId: 'offering-1',
          startAt: futureStart,
          studentTimezone: 'Europe/Berlin',
        }),
      ).rejects.toBeInstanceOf(ConflictException);
      expect(prisma.client.booking.create).not.toHaveBeenCalled();
    });

    it('translates a DB EXCLUDE-constraint violation into a 409 (the race-condition backstop)', async () => {
      const prisma = buildPrismaMock({
        booking: {
          findFirst: jest.fn().mockResolvedValue(null),
          create: jest
            .fn()
            .mockRejectedValue(new Error('conflicting key value violates exclusion constraint "bookings_no_overlapping_active_ranges"')),
        },
      });
      const availability = buildAvailabilityMock();
      const service = new BookingsService(prisma, availability);

      await expect(
        service.create('student-1', {
          offeringId: 'offering-1',
          startAt: futureStart,
          studentTimezone: 'Europe/Berlin',
        }),
      ).rejects.toBeInstanceOf(ConflictException);
    });

    it('creates the booking as PENDING, scoped to the calling student and the offering tutor', async () => {
      const prisma = buildPrismaMock();
      const availability = buildAvailabilityMock();
      const service = new BookingsService(prisma, availability);

      await service.create('student-1', {
        offeringId: 'offering-1',
        startAt: futureStart,
        studentTimezone: 'Europe/Berlin',
      });

      expect(prisma.client.booking.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ studentId: 'student-1', tutorId: 'tutor-1', offeringId: 'offering-1' }),
        }),
      );
    });
  });

  describe('confirm', () => {
    it('throws NotFoundException (never Forbidden) for a booking belonging to a different tutor', async () => {
      const prisma = buildPrismaMock({ booking: { findFirst: jest.fn().mockResolvedValue(null) } });
      const service = new BookingsService(prisma, buildAvailabilityMock());

      await expect(service.confirm('tutor-2', 'booking-1')).rejects.toBeInstanceOf(NotFoundException);
    });

    it('rejects confirming a booking that is not PENDING', async () => {
      const prisma = buildPrismaMock({
        booking: { findFirst: jest.fn().mockResolvedValue({ ...booking, status: 'CONFIRMED' }) },
      });
      const service = new BookingsService(prisma, buildAvailabilityMock());

      await expect(service.confirm('tutor-1', 'booking-1')).rejects.toBeInstanceOf(ConflictException);
      expect(prisma.client.booking.update).not.toHaveBeenCalled();
    });

    it('confirms a PENDING booking owned by the calling tutor', async () => {
      const prisma = buildPrismaMock({ booking: { findFirst: jest.fn().mockResolvedValue(booking) } });
      const service = new BookingsService(prisma, buildAvailabilityMock());

      await service.confirm('tutor-1', 'booking-1');

      expect(prisma.client.booking.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'booking-1' }, data: { status: 'CONFIRMED' } }),
      );
    });
  });

  describe('cancel', () => {
    it('throws NotFoundException when the caller is neither the student nor the tutor', async () => {
      const prisma = buildPrismaMock({ booking: { findFirst: jest.fn().mockResolvedValue(null) } });
      const service = new BookingsService(prisma, buildAvailabilityMock());

      await expect(service.cancel('someone-else', 'booking-1', {})).rejects.toBeInstanceOf(NotFoundException);
    });

    it('allows the student to cancel their own PENDING booking', async () => {
      const prisma = buildPrismaMock({ booking: { findFirst: jest.fn().mockResolvedValue(booking) } });
      const service = new BookingsService(prisma, buildAvailabilityMock());

      await service.cancel('student-1', 'booking-1', { reason: 'Termin passt nicht mehr' });

      expect(prisma.client.booking.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { status: 'CANCELLED', cancellationReason: 'Termin passt nicht mehr' } }),
      );
    });

    it('allows the tutor to cancel a booking owned by them', async () => {
      const prisma = buildPrismaMock({ booking: { findFirst: jest.fn().mockResolvedValue(booking) } });
      const service = new BookingsService(prisma, buildAvailabilityMock());

      await service.cancel('tutor-1', 'booking-1', {});

      expect(prisma.client.booking.update).toHaveBeenCalled();
    });

    it('rejects cancelling an already-completed booking', async () => {
      const prisma = buildPrismaMock({
        booking: { findFirst: jest.fn().mockResolvedValue({ ...booking, status: 'COMPLETED' }) },
      });
      const service = new BookingsService(prisma, buildAvailabilityMock());

      await expect(service.cancel('student-1', 'booking-1', {})).rejects.toBeInstanceOf(ConflictException);
    });
  });

  describe('complete', () => {
    it('rejects completing a booking whose session has not ended yet', async () => {
      const futureBooking = { ...booking, status: 'CONFIRMED', endAt: new Date(Date.now() + 60_000) };
      const prisma = buildPrismaMock({ booking: { findFirst: jest.fn().mockResolvedValue(futureBooking) } });
      const service = new BookingsService(prisma, buildAvailabilityMock());

      await expect(service.complete('tutor-1', 'booking-1')).rejects.toBeInstanceOf(BadRequestException);
    });

    it('completes a CONFIRMED booking whose session has ended', async () => {
      const pastBooking = { ...booking, status: 'CONFIRMED', endAt: new Date(Date.now() - 60_000) };
      const prisma = buildPrismaMock({ booking: { findFirst: jest.fn().mockResolvedValue(pastBooking) } });
      const service = new BookingsService(prisma, buildAvailabilityMock());

      await service.complete('tutor-1', 'booking-1');

      expect(prisma.client.booking.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { status: 'COMPLETED' } }),
      );
    });

    it('rejects completing a booking that was never confirmed', async () => {
      const prisma = buildPrismaMock({ booking: { findFirst: jest.fn().mockResolvedValue(booking) } });
      const service = new BookingsService(prisma, buildAvailabilityMock());

      await expect(service.complete('tutor-1', 'booking-1')).rejects.toBeInstanceOf(ConflictException);
    });
  });

  describe('markNoShow', () => {
    it('rejects marking no-show before the session has started', async () => {
      const futureBooking = { ...booking, status: 'CONFIRMED', startAt: new Date(Date.now() + 60_000) };
      const prisma = buildPrismaMock({ booking: { findFirst: jest.fn().mockResolvedValue(futureBooking) } });
      const service = new BookingsService(prisma, buildAvailabilityMock());

      await expect(service.markNoShow('tutor-1', 'booking-1')).rejects.toBeInstanceOf(BadRequestException);
    });

    it('marks a started CONFIRMED booking as NO_SHOW', async () => {
      const startedBooking = { ...booking, status: 'CONFIRMED', startAt: new Date(Date.now() - 60_000) };
      const prisma = buildPrismaMock({ booking: { findFirst: jest.fn().mockResolvedValue(startedBooking) } });
      const service = new BookingsService(prisma, buildAvailabilityMock());

      await service.markNoShow('tutor-1', 'booking-1');

      expect(prisma.client.booking.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { status: 'NO_SHOW' } }),
      );
    });
  });

  describe('findOwnAsStudent / findOwnAsTutor', () => {
    it('scopes the student query to studentId', async () => {
      const prisma = buildPrismaMock();
      const service = new BookingsService(prisma, buildAvailabilityMock());

      await service.findOwnAsStudent('student-1');

      expect(prisma.client.booking.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { studentId: 'student-1' } }),
      );
    });

    it('scopes the tutor query to tutorId', async () => {
      const prisma = buildPrismaMock();
      const service = new BookingsService(prisma, buildAvailabilityMock());

      await service.findOwnAsTutor('tutor-1');

      expect(prisma.client.booking.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { tutorId: 'tutor-1' } }),
      );
    });
  });
});
