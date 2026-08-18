import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import type { CreateReviewDto } from './dto/create-review.dto';

/** DTO allowlist for the reviewing student — never the full User row (same lesson as BookingsService's BOOKING_INCLUDE, see ADR section 9). */
const REVIEW_INCLUDE = {
  student: { select: { id: true, profile: { select: { displayName: true, avatarUrl: true } } } },
} as const;

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Only the booking's own student may review it, only once, and only
   * after the session is COMPLETED (spec section 9). Ownership is
   * checked via a combined (id, studentId) lookup — a booking belonging
   * to a different student, or that doesn't exist at all, is always a
   * 404, never a 403 (same IDOR-defense convention as the rest of the
   * codebase).
   */
  async create(studentId: string, bookingId: string, dto: CreateReviewDto) {
    const booking = await this.prisma.client.booking.findFirst({
      where: { id: bookingId, studentId },
    });
    if (!booking) {
      throw new NotFoundException('Booking not found.');
    }
    if (booking.status !== 'COMPLETED') {
      throw new ConflictException('Nur abgeschlossene Sessions können bewertet werden.');
    }

    const existing = await this.prisma.client.review.findUnique({ where: { bookingId } });
    if (existing) {
      throw new ConflictException('Diese Buchung wurde bereits bewertet.');
    }

    return this.prisma.client.review.create({
      data: {
        bookingId,
        studentId,
        tutorId: booking.tutorId,
        rating: dto.rating,
        comment: dto.comment,
      },
      include: REVIEW_INCLUDE,
    });
  }

  /** Public — part of a tutor's marketplace profile. Hidden (moderated) reviews never appear here, same filter TutorProfilesService's rating aggregate uses. */
  async findVisibleForTutor(tutorId: string) {
    return this.prisma.client.review.findMany({
      where: { tutorId, isHidden: false },
      include: REVIEW_INCLUDE,
      orderBy: { createdAt: 'desc' },
    });
  }
}
