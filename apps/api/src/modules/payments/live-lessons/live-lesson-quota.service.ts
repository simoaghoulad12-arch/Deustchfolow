import { ConflictException, Injectable } from '@nestjs/common';
import { Prisma } from '@deutschflow/database';
import { SubscriptionPlan } from '@deutschflow/types';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { PaymentPolicyService } from '../policy/payment-policy.service';
import { getQuotaWeekStart } from './quota-week';

export interface LiveLessonQuotaSummary {
  weekStart: Date;
  totalMinutes: number;
  usedMinutes: number;
  remainingMinutes: number;
}

/**
 * PRO/MAX weekly live-lesson quota (Phase 7, §5). Deliberately does NOT
 * depend on EntitlementsService — every method takes the caller's
 * already-resolved `plan` as a parameter instead of looking it up
 * itself. EntitlementsModule imports PaymentPolicyModule (which this
 * service also depends on), so this service living inside PaymentsModule
 * and also depending on EntitlementsService would create a circular
 * module import; taking `plan` as a parameter keeps the dependency
 * graph a DAG (see payment-policy.module.ts for the full reasoning).
 *
 * The weekly minutes-per-plan figures are never hardcoded here — they
 * are read from PaymentPolicyService on every call (Phase 7 §5:
 * "Die exakten PRO/MAX-Stundenzahlen nicht hardcoden").
 */
@Injectable()
export class LiveLessonQuotaService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly paymentPolicy: PaymentPolicyService,
  ) {}

  async getWeeklyQuotaMinutes(plan: SubscriptionPlan): Promise<number> {
    const policy = await this.paymentPolicy.get();
    if (plan === SubscriptionPlan.PREMIUM) return policy.premiumWeeklyLiveMinutes;
    if (plan === SubscriptionPlan.PRO) return policy.proWeeklyLiveMinutes;
    return 0; // FREE has no live-lesson quota.
  }

  async getQuotaSummary(
    userId: string,
    plan: SubscriptionPlan,
    atDate: Date = new Date(),
  ): Promise<LiveLessonQuotaSummary> {
    const weekStart = getQuotaWeekStart(atDate);
    const totalMinutes = await this.getWeeklyQuotaMinutes(plan);
    const usedMinutes = await this.sumActiveMinutes(this.prisma.client, userId, weekStart);
    return {
      weekStart,
      totalMinutes,
      usedMinutes,
      remainingMinutes: Math.max(0, totalMinutes - usedMinutes),
    };
  }

  /**
   * Atomically checks and, if it fits, consumes quota for a booking —
   * same Serializable-transaction-plus-P2034-mapping pattern as
   * RefundService's cumulative-limit check (Phase 6.5), so two
   * concurrent booking attempts can never jointly overdraw the same
   * week's quota. Idempotent on `bookingId` (unique in the schema): a
   * retried call against a booking that already has an ACTIVE
   * consumption row returns that row unchanged rather than double-
   * counting it. Returns `null` — not an error — when the plan has no
   * quota at all or the remaining quota doesn't cover `minutesNeeded`;
   * the caller is expected to fall back to the existing paid Stripe
   * booking-checkout flow in that case.
   */
  async tryConsumeForBooking(params: {
    userId: string;
    plan: SubscriptionPlan;
    bookingId: string;
    startAt: Date;
    minutesNeeded: number;
  }) {
    const { userId, plan, bookingId, startAt, minutesNeeded } = params;
    const totalMinutes = await this.getWeeklyQuotaMinutes(plan);
    if (totalMinutes <= 0) return null;

    const weekStart = getQuotaWeekStart(startAt);

    try {
      return await this.prisma.client.$transaction(
        async (tx) => {
          const existing = await tx.liveLessonQuotaConsumption.findUnique({ where: { bookingId } });
          if (existing) return existing.status === 'ACTIVE' ? existing : null;

          const usedMinutes = await this.sumActiveMinutes(tx, userId, weekStart);
          if (usedMinutes + minutesNeeded > totalMinutes) return null;

          return tx.liveLessonQuotaConsumption.create({
            data: { userId, bookingId, minutesConsumed: minutesNeeded, weekStart, status: 'ACTIVE' },
          });
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
      );
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2034') {
        throw new ConflictException(
          'Kontingent-Zuordnung konnte aufgrund eines gleichzeitigen Zugriffs nicht verarbeitet werden. Bitte erneut versuchen.',
        );
      }
      throw error;
    }
  }

  /**
   * Releases quota consumed by a cancelled booking — flips the row to
   * RELEASED rather than deleting it, so consumption history stays
   * auditable while no longer counting against the week's used total.
   * Idempotent: releasing a booking with no ACTIVE consumption row
   * (never quota-covered, or already released) is a silent no-op, safe
   * to call from every cancellation path unconditionally.
   */
  async releaseForBooking(bookingId: string): Promise<void> {
    await this.prisma.client.liveLessonQuotaConsumption.updateMany({
      where: { bookingId, status: 'ACTIVE' },
      data: { status: 'RELEASED' },
    });
  }

  private async sumActiveMinutes(
    client: Prisma.TransactionClient | PrismaService['client'],
    userId: string,
    weekStart: Date,
  ): Promise<number> {
    const result = await client.liveLessonQuotaConsumption.aggregate({
      where: { userId, weekStart, status: 'ACTIVE' },
      _sum: { minutesConsumed: true },
    });
    return result._sum.minutesConsumed ?? 0;
  }
}
