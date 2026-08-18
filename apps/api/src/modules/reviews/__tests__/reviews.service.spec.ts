import { ConflictException, NotFoundException } from '@nestjs/common';
import { ReviewsService } from '../reviews.service';
import type { PrismaService } from '../../../common/prisma/prisma.service';

const completedBooking = {
  id: 'booking-1',
  studentId: 'student-1',
  tutorId: 'tutor-1',
  offeringId: 'offering-1',
  status: 'COMPLETED',
};

const review = {
  id: 'review-1',
  bookingId: 'booking-1',
  studentId: 'student-1',
  tutorId: 'tutor-1',
  rating: 5,
  comment: 'Sehr hilfreich!',
  isHidden: false,
  createdAt: new Date(),
};

function buildPrismaMock(overrides?: {
  booking?: Partial<Record<string, jest.Mock>>;
  review?: Partial<Record<string, jest.Mock>>;
}) {
  return {
    client: {
      booking: {
        findFirst: jest.fn().mockResolvedValue(completedBooking),
        ...overrides?.booking,
      },
      review: {
        findUnique: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue(review),
        findMany: jest.fn().mockResolvedValue([review]),
        ...overrides?.review,
      },
    },
  } as unknown as PrismaService;
}

describe('ReviewsService', () => {
  describe('create', () => {
    it('throws NotFoundException (never Forbidden) when the booking belongs to a different student', async () => {
      const prisma = buildPrismaMock({ booking: { findFirst: jest.fn().mockResolvedValue(null) } });
      const service = new ReviewsService(prisma);

      await expect(service.create('someone-else', 'booking-1', { rating: 5 })).rejects.toBeInstanceOf(
        NotFoundException,
      );
      expect(prisma.client.review.create).not.toHaveBeenCalled();
    });

    it('scopes the booking lookup to (id, studentId) together, never id alone', async () => {
      const prisma = buildPrismaMock();
      const service = new ReviewsService(prisma);

      await service.create('student-1', 'booking-1', { rating: 5 });

      expect(prisma.client.booking.findFirst).toHaveBeenCalledWith({
        where: { id: 'booking-1', studentId: 'student-1' },
      });
    });

    it('rejects reviewing a booking that is not COMPLETED', async () => {
      const prisma = buildPrismaMock({
        booking: { findFirst: jest.fn().mockResolvedValue({ ...completedBooking, status: 'CONFIRMED' }) },
      });
      const service = new ReviewsService(prisma);

      await expect(service.create('student-1', 'booking-1', { rating: 5 })).rejects.toBeInstanceOf(
        ConflictException,
      );
      expect(prisma.client.review.create).not.toHaveBeenCalled();
    });

    it('rejects a second review for the same booking', async () => {
      const prisma = buildPrismaMock({ review: { findUnique: jest.fn().mockResolvedValue(review) } });
      const service = new ReviewsService(prisma);

      await expect(service.create('student-1', 'booking-1', { rating: 3 })).rejects.toBeInstanceOf(
        ConflictException,
      );
      expect(prisma.client.review.create).not.toHaveBeenCalled();
    });

    it('creates the review scoped to the calling student and the booking tutor', async () => {
      const prisma = buildPrismaMock();
      const service = new ReviewsService(prisma);

      await service.create('student-1', 'booking-1', { rating: 4, comment: 'Gut' });

      expect(prisma.client.review.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            bookingId: 'booking-1',
            studentId: 'student-1',
            tutorId: 'tutor-1',
            rating: 4,
            comment: 'Gut',
          }),
        }),
      );
    });
  });

  describe('findVisibleForTutor', () => {
    it('only returns non-hidden reviews', async () => {
      const prisma = buildPrismaMock();
      const service = new ReviewsService(prisma);

      await service.findVisibleForTutor('tutor-1');

      expect(prisma.client.review.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { tutorId: 'tutor-1', isHidden: false } }),
      );
    });
  });
});
