import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { IANAZone } from 'luxon';
import { PrismaService } from '../../common/prisma/prisma.service';
import { TutorAvailabilityService } from '../tutors/availability/tutor-availability.service';
import type { CreateBookingDto } from './dto/create-booking.dto';
import type { CancelBookingDto } from './dto/cancel-booking.dto';

/** Statuses that still occupy a timeslot — mirrors the WHERE clause on the DB-level EXCLUDE constraint (see migration + ADR). */
const ACTIVE_STATUSES = ['PENDING', 'CONFIRMED'] as const;

/**
 * Postgres SQLSTATE for an exclusion-constraint violation. Prisma does
 * not recognize EXCLUDE constraints as a known error type (there is no
 * dedicated P20xx code for it), so a violation surfaces as a raw
 * PrismaClientUnknownRequestError whose message embeds the underlying pg
 * error text — this is the belt-and-suspenders backstop for the race a
 * concurrent request can still slip past the pre-check below.
 */
const EXCLUSION_VIOLATION_MARKER = 'bookings_no_overlapping_active_ranges';

/**
 * DTO allowlist for the User rows nested under a booking (spec section
 * 18: "DTO Allowlist" for every new resource) — a booking is visible to
 * both its student and its tutor, so the *other* party's User row must
 * never leak sensitive fields (passwordHash, email, deletedAt, ...) to
 * whichever side is reading it. Only display-name/avatar are ever safe
 * to show the counterparty.
 */
const BOOKING_INCLUDE = {
  offering: true,
  tutor: {
    select: {
      userId: true,
      user: { select: { id: true, profile: { select: { displayName: true, avatarUrl: true } } } },
    },
  },
  student: {
    select: { id: true, profile: { select: { displayName: true, avatarUrl: true } } },
  },
  /** Presence only (id) — lets the student UI know whether "Bewerten" should still be offered, without exposing the review itself here. */
  review: { select: { id: true } },
} as const;

@Injectable()
export class BookingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly availabilityService: TutorAvailabilityService,
  ) {}

  async create(studentId: string, dto: CreateBookingDto) {
    if (!IANAZone.isValidZone(dto.studentTimezone)) {
      throw new BadRequestException(`"${dto.studentTimezone}" is not a valid IANA timezone.`);
    }

    const offering = await this.prisma.client.offering.findUnique({ where: { id: dto.offeringId } });
    if (!offering || !offering.isActive) {
      throw new NotFoundException('Offering not found.');
    }
    if (offering.tutorId === studentId) {
      throw new BadRequestException('Du kannst keine Buchung bei dir selbst vornehmen.');
    }

    const startAt = new Date(dto.startAt);
    if (Number.isNaN(startAt.getTime()) || startAt.getTime() <= Date.now()) {
      throw new BadRequestException('startAt must be a valid, future instant.');
    }
    const endAt = new Date(startAt.getTime() + offering.durationMinutes * 60_000);

    // 1/2 of double-booking prevention: reject requests outside the
    // tutor's declared hours or inside a blocked exception.
    await this.availabilityService.assertBookable(offering.tutorId, startAt, endAt);

    // Friendly pre-check — gives a clean 409 in the common (non-racing)
    // case. Not itself sufficient: see the DB EXCLUDE constraint catch
    // below, which is the actual race-condition-proof guarantee (spec
    // section 6 — "Client-seitige Prüfung reicht NICHT aus").
    const conflicting = await this.prisma.client.booking.findFirst({
      where: {
        tutorId: offering.tutorId,
        status: { in: [...ACTIVE_STATUSES] },
        startAt: { lt: endAt },
        endAt: { gt: startAt },
      },
    });
    if (conflicting) {
      throw new ConflictException('Dieser Zeitraum ist bereits belegt.');
    }

    try {
      const booking = await this.prisma.client.booking.create({
        data: {
          studentId,
          tutorId: offering.tutorId,
          offeringId: offering.id,
          startAt,
          endAt,
          studentTimezone: dto.studentTimezone,
          notes: dto.notes,
        },
        include: BOOKING_INCLUDE,
      });
      return booking;
    } catch (error) {
      if (error instanceof Error && error.message.includes(EXCLUSION_VIOLATION_MARKER)) {
        throw new ConflictException('Dieser Zeitraum ist bereits belegt.');
      }
      throw error;
    }
  }

  async findOwnAsStudent(studentId: string) {
    return this.prisma.client.booking.findMany({
      where: { studentId },
      include: BOOKING_INCLUDE,
      orderBy: { startAt: 'desc' },
    });
  }

  async findOwnAsTutor(tutorId: string) {
    return this.prisma.client.booking.findMany({
      where: { tutorId },
      include: BOOKING_INCLUDE,
      orderBy: { startAt: 'desc' },
    });
  }

  async confirm(tutorId: string, bookingId: string) {
    const booking = await this.findOwnedByTutor(tutorId, bookingId);
    if (booking.status !== 'PENDING') {
      throw new ConflictException('Nur ausstehende Buchungen können bestätigt werden.');
    }
    return this.prisma.client.booking.update({
      where: { id: bookingId },
      data: { status: 'CONFIRMED' },
      include: BOOKING_INCLUDE,
    });
  }

  /** Either the booking's student or its tutor may cancel — both are "owners" of the cancellation decision. */
  async cancel(userId: string, bookingId: string, dto: CancelBookingDto) {
    const booking = await this.prisma.client.booking.findFirst({
      where: { id: bookingId, OR: [{ studentId: userId }, { tutorId: userId }] },
    });
    if (!booking) {
      throw new NotFoundException('Booking not found.');
    }
    if (!ACTIVE_STATUSES.includes(booking.status as (typeof ACTIVE_STATUSES)[number])) {
      throw new ConflictException('Diese Buchung kann nicht mehr storniert werden.');
    }

    return this.prisma.client.booking.update({
      where: { id: bookingId },
      data: { status: 'CANCELLED', cancellationReason: dto.reason },
      include: BOOKING_INCLUDE,
    });
  }

  async complete(tutorId: string, bookingId: string) {
    const booking = await this.findOwnedByTutor(tutorId, bookingId);
    if (booking.status !== 'CONFIRMED') {
      throw new ConflictException('Nur bestätigte Buchungen können abgeschlossen werden.');
    }
    if (booking.endAt.getTime() > Date.now()) {
      throw new BadRequestException('Die Session hat noch nicht geendet.');
    }
    return this.prisma.client.booking.update({
      where: { id: bookingId },
      data: { status: 'COMPLETED' },
      include: BOOKING_INCLUDE,
    });
  }

  async markNoShow(tutorId: string, bookingId: string) {
    const booking = await this.findOwnedByTutor(tutorId, bookingId);
    if (booking.status !== 'CONFIRMED') {
      throw new ConflictException('Nur bestätigte Buchungen können als "nicht erschienen" markiert werden.');
    }
    if (booking.startAt.getTime() > Date.now()) {
      throw new BadRequestException('Die Session hat noch nicht begonnen.');
    }
    return this.prisma.client.booking.update({
      where: { id: bookingId },
      data: { status: 'NO_SHOW' },
      include: BOOKING_INCLUDE,
    });
  }

  /** Ownership: always a 404, never a 403 — same IDOR-defense convention as OfferingsService.assertOwnedByTutor. */
  private async findOwnedByTutor(tutorId: string, bookingId: string) {
    const booking = await this.prisma.client.booking.findFirst({ where: { id: bookingId, tutorId } });
    if (!booking) {
      throw new NotFoundException('Booking not found.');
    }
    return booking;
  }
}
