import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { computeFreeSlots, isSlotWithinRules, overlapsBusyRange } from './availability-slots';
import type { CreateAvailabilityRuleDto } from '../dto/create-availability-rule.dto';
import type { CreateAvailabilityExceptionDto } from '../dto/create-availability-exception.dto';
import type { QueryAvailabilityDto } from '../dto/query-availability.dto';

const DEFAULT_SLOT_DURATION_MINUTES = 30;

/** Bookings that still hold a timeslot — the same status set the double-booking EXCLUDE constraint (Phase 5.4) treats as "active". */
const ACTIVE_BOOKING_STATUSES = ['PENDING', 'CONFIRMED'] as const;

@Injectable()
export class TutorAvailabilityService {
  constructor(private readonly prisma: PrismaService) {}

  async listOwnRules(tutorId: string) {
    return this.prisma.client.tutorAvailabilityRule.findMany({
      where: { tutorId },
      orderBy: [{ weekday: 'asc' }, { startMinute: 'asc' }],
    });
  }

  async createRule(tutorId: string, dto: CreateAvailabilityRuleDto) {
    await this.assertTutorProfileExists(tutorId);
    if (dto.endMinute <= dto.startMinute) {
      throw new BadRequestException('endMinute must be after startMinute.');
    }

    return this.prisma.client.tutorAvailabilityRule.create({
      data: {
        tutorId,
        weekday: dto.weekday,
        startMinute: dto.startMinute,
        endMinute: dto.endMinute,
      },
    });
  }

  async deleteRule(tutorId: string, ruleId: string): Promise<void> {
    const rule = await this.prisma.client.tutorAvailabilityRule.findFirst({
      where: { id: ruleId, tutorId },
    });
    if (!rule) {
      throw new NotFoundException('Availability rule not found.');
    }
    await this.prisma.client.tutorAvailabilityRule.delete({ where: { id: ruleId } });
  }

  async listOwnExceptions(tutorId: string) {
    return this.prisma.client.tutorAvailabilityException.findMany({
      where: { tutorId },
      orderBy: { startAt: 'asc' },
    });
  }

  async createException(tutorId: string, dto: CreateAvailabilityExceptionDto) {
    await this.assertTutorProfileExists(tutorId);
    const startAt = new Date(dto.startAt);
    const endAt = new Date(dto.endAt);
    if (endAt <= startAt) {
      throw new BadRequestException('endAt must be after startAt.');
    }

    return this.prisma.client.tutorAvailabilityException.create({
      data: {
        tutorId,
        startAt,
        endAt,
        isBlocked: dto.isBlocked ?? true,
        reason: dto.reason,
      },
    });
  }

  async deleteException(tutorId: string, exceptionId: string): Promise<void> {
    const exception = await this.prisma.client.tutorAvailabilityException.findFirst({
      where: { id: exceptionId, tutorId },
    });
    if (!exception) {
      throw new NotFoundException('Availability exception not found.');
    }
    await this.prisma.client.tutorAvailabilityException.delete({ where: { id: exceptionId } });
  }

  /** Public: resolves a tutor's recurring rules + busy ranges (blocked exceptions and active bookings) into concrete free UTC slots for the requested range. */
  async findFreeSlots(tutorId: string, query: QueryAvailabilityDto) {
    const profile = await this.prisma.client.tutorProfile.findUnique({ where: { userId: tutorId } });
    if (!profile || !profile.isActive) {
      throw new NotFoundException('Tutor not found.');
    }

    const from = new Date(query.from);
    const to = new Date(query.to);

    const [rules, blockedExceptions, activeBookings] = await Promise.all([
      this.prisma.client.tutorAvailabilityRule.findMany({ where: { tutorId } }),
      this.prisma.client.tutorAvailabilityException.findMany({
        where: { tutorId, isBlocked: true, startAt: { lt: to }, endAt: { gt: from } },
      }),
      this.prisma.client.booking.findMany({
        where: {
          tutorId,
          status: { in: [...ACTIVE_BOOKING_STATUSES] },
          startAt: { lt: to },
          endAt: { gt: from },
        },
      }),
    ]);

    const busyRanges = [
      ...blockedExceptions.map((e) => ({ start: e.startAt, end: e.endAt })),
      ...activeBookings.map((b) => ({ start: b.startAt, end: b.endAt })),
    ];

    return computeFreeSlots({
      timezone: profile.timezone,
      rules: rules.map((r) => ({ weekday: r.weekday, startMinute: r.startMinute, endMinute: r.endMinute })),
      busyRanges,
      from,
      to,
      durationMinutes: query.durationMinutes ?? DEFAULT_SLOT_DURATION_MINUTES,
    });
  }

  /**
   * Booking-time validation: the requested [startAt, endAt) must fall
   * inside one of the tutor's recurring rules and must not overlap a
   * blocked exception. This is the "server-side check" half of
   * double-booking prevention (spec section 6) — the other half is the
   * database EXCLUDE constraint on the bookings table, which this method
   * does not (and cannot) replace: it only rejects requests outside the
   * tutor's declared hours, not concurrent requests for the same slot.
   */
  async assertBookable(tutorId: string, startAt: Date, endAt: Date): Promise<void> {
    const profile = await this.prisma.client.tutorProfile.findUnique({ where: { userId: tutorId } });
    if (!profile || !profile.isActive) {
      throw new NotFoundException('Tutor not found.');
    }

    const [rules, blockedExceptions] = await Promise.all([
      this.prisma.client.tutorAvailabilityRule.findMany({ where: { tutorId } }),
      this.prisma.client.tutorAvailabilityException.findMany({
        where: { tutorId, isBlocked: true, startAt: { lt: endAt }, endAt: { gt: startAt } },
      }),
    ]);

    const withinRules = isSlotWithinRules({
      timezone: profile.timezone,
      rules: rules.map((r) => ({ weekday: r.weekday, startMinute: r.startMinute, endMinute: r.endMinute })),
      startAt,
      endAt,
    });
    if (!withinRules) {
      throw new BadRequestException('Der gewählte Zeitraum liegt außerhalb der Verfügbarkeit des Tutors.');
    }

    if (overlapsBusyRange(blockedExceptions.map((e) => ({ start: e.startAt, end: e.endAt })), startAt, endAt)) {
      throw new BadRequestException('Der gewählte Zeitraum ist blockiert.');
    }
  }

  private async assertTutorProfileExists(tutorId: string): Promise<void> {
    const profile = await this.prisma.client.tutorProfile.findUnique({ where: { userId: tutorId } });
    if (!profile) {
      throw new NotFoundException('Create a tutor profile before managing availability.');
    }
  }
}
