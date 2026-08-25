import 'reflect-metadata';
import { randomUUID } from 'node:crypto';
import { ConflictException } from '@nestjs/common';
import { PrismaService } from '../src/common/prisma/prisma.service';
import { TutorAvailabilityService } from '../src/modules/tutors/availability/tutor-availability.service';
import { BookingsService } from '../src/modules/bookings/bookings.service';
import { PaymentPolicyService } from '../src/modules/payments/policy/payment-policy.service';
import { LiveLessonQuotaService } from '../src/modules/payments/live-lessons/live-lesson-quota.service';

/**
 * Manual, opt-in proof that the double-booking guarantee (spec section
 * 6: "Extrem wichtig ... Client-seitige Prüfung reicht NICHT aus") holds
 * under REAL concurrent requests against a REAL Postgres database — not
 * just mocked-Prisma unit tests (those only prove the service logic;
 * they cannot prove a race condition is actually closed at the DB
 * level). Never runs in CI (CI is deliberately DB-free, see
 * .github/workflows/ci.yml) — this mirrors the manual-verification
 * pattern established for AI in Phase 4.5 (`ai:eval` / `ai:real-test`).
 *
 * Fires CONCURRENCY concurrent BookingsService.create() calls, all for
 * the exact same tutor/offering/timeslot, and asserts exactly one
 * succeeds while the rest are rejected with a 409 (ConflictException) —
 * proving the PostgreSQL EXCLUDE constraint (not just application code)
 * is what closes the race.
 *
 * Run with: pnpm --filter @deutschflow/api booking:verify-concurrency
 */

const CONCURRENCY = 8;

async function main(): Promise<void> {
  const prisma = new PrismaService();
  const availability = new TutorAvailabilityService(prisma);
  const paymentPolicy = new PaymentPolicyService(prisma);
  const liveLessonQuota = new LiveLessonQuotaService(prisma, paymentPolicy);
  const bookings = new BookingsService(prisma, availability, liveLessonQuota);

  console.log(`[verify-booking-concurrency] Setting up fixtures against ${maskDbUrl()}...`);

  const tutorId = randomUUID();
  const studentIds = Array.from({ length: CONCURRENCY }, () => randomUUID());
  const offeringId = randomUUID();

  // Next Monday, 09:00 local Berlin time — guaranteed inside the rule
  // window created below, and guaranteed in the future.
  const startAt = nextMonday9am();

  try {
    await prisma.client.user.create({
      data: { id: tutorId, email: `verify-concurrency-tutor-${tutorId}@example.com`, passwordHash: 'x', role: 'TUTOR' },
    });
    await Promise.all(
      studentIds.map((id) =>
        prisma.client.user.create({
          data: { id, email: `verify-concurrency-student-${id}@example.com`, passwordHash: 'x', role: 'STUDENT' },
        }),
      ),
    );
    await prisma.client.tutorProfile.create({
      data: { userId: tutorId, languages: ['Deutsch'], teachingLevels: [], specialties: [], timezone: 'Europe/Berlin' },
    });
    await prisma.client.tutorAvailabilityRule.create({
      data: { tutorId, weekday: startAt.getUTCDay(), startMinute: 0, endMinute: 1439 },
    });
    await prisma.client.offering.create({
      data: {
        id: offeringId,
        tutorId,
        title: 'Concurrency-Test-Slot',
        category: 'CONVERSATION',
        durationMinutes: 30,
        priceCents: 1000,
      },
    });

    console.log(
      `[verify-booking-concurrency] Firing ${CONCURRENCY} concurrent booking requests for the same ` +
        `${startAt.toISOString()} slot (different students, same tutor/offering)...`,
    );

    const results = await Promise.allSettled(
      studentIds.map((studentId) =>
        bookings.create(studentId, {
          offeringId,
          startAt: startAt.toISOString(),
          studentTimezone: 'Europe/Berlin',
        }),
      ),
    );

    const succeeded = results.filter((r) => r.status === 'fulfilled');
    const failed = results.filter(
      (r): r is PromiseRejectedResult => r.status === 'rejected',
    );
    const conflictFailures = failed.filter((r) => r.reason instanceof ConflictException);
    const unexpectedFailures = failed.filter((r) => !(r.reason instanceof ConflictException));

    console.log(
      `[verify-booking-concurrency] Result: ${succeeded.length} succeeded, ${failed.length} rejected ` +
        `(${conflictFailures.length} expected 409 Conflict, ${unexpectedFailures.length} unexpected errors).`,
    );
    for (const failure of unexpectedFailures) {
      console.error('[verify-booking-concurrency] Unexpected rejection reason:', failure.reason);
    }

    const activeBookings = await prisma.client.booking.count({
      where: { tutorId, status: { in: ['PENDING', 'CONFIRMED'] } },
    });
    console.log(`[verify-booking-concurrency] Active bookings for the slot in the DB: ${activeBookings}.`);

    if (succeeded.length === 1 && activeBookings === 1 && unexpectedFailures.length === 0) {
      console.log('[verify-booking-concurrency] PASS — exactly one booking won the race, DB constraint holds.');
      process.exitCode = 0;
    } else {
      console.error(
        `[verify-booking-concurrency] FAIL — expected exactly 1 successful booking, 1 active DB row, and 0 ` +
          `unexpected errors; got ${succeeded.length} successes, ${activeBookings} active rows, ` +
          `${unexpectedFailures.length} unexpected errors.`,
      );
      process.exitCode = 1;
    }
  } finally {
    console.log('[verify-booking-concurrency] Cleaning up fixtures...');
    await prisma.client.booking.deleteMany({ where: { tutorId } });
    await prisma.client.offering.deleteMany({ where: { tutorId } });
    await prisma.client.tutorAvailabilityRule.deleteMany({ where: { tutorId } });
    await prisma.client.tutorProfile.deleteMany({ where: { userId: tutorId } });
    await prisma.client.user.deleteMany({ where: { id: { in: [tutorId, ...studentIds] } } });
    await prisma.client.$disconnect();
  }
}

function nextMonday9am(): Date {
  const now = new Date();
  const daysUntilMonday = ((1 - now.getUTCDay() + 7) % 7 || 7) + 7; // 2 Mondays out, safely in the future
  const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + daysUntilMonday, 7, 0, 0));
  return date;
}

function maskDbUrl(): string {
  const url = process.env.DATABASE_URL ?? '(not set)';
  return url.replace(/:\/\/[^@]+@/, '://***:***@');
}

main().catch((error) => {
  console.error('[verify-booking-concurrency] Unexpected error:', error);
  process.exitCode = 1;
});
