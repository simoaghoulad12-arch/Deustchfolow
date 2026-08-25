import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import type { UpdatePaymentPolicyDto } from '../dto/update-payment-policy.dto';

const POLICY_ROW_ID = 'default';

/**
 * The configurable business rules the Phase 6 approval explicitly
 * required NOT be hardcoded: commission rate, SUPPORT's refund
 * authority limit, the subscription past-due grace period, and the
 * abandoned-booking TTL. Every consumer across the payments module
 * calls `get()` — none of these are `const` in application code.
 *
 * The row is created with schema defaults on first read if it doesn't
 * exist yet (a fresh database has none) rather than requiring a seed
 * step — this is config, not content, so there is no "empty policy"
 * state a caller should ever have to handle.
 */
@Injectable()
export class PaymentPolicyService {
  constructor(private readonly prisma: PrismaService) {}

  async get() {
    const existing = await this.prisma.client.paymentPolicy.findUnique({
      where: { id: POLICY_ROW_ID },
    });
    if (existing) return existing;

    return this.prisma.client.paymentPolicy.create({
      data: { id: POLICY_ROW_ID },
    });
  }

  /** ADMIN-only (enforced at the controller) — see Phase 6.10. */
  async update(dto: UpdatePaymentPolicyDto, updatedByUserId: string) {
    await this.get(); // ensures the row exists before update touches it

    return this.prisma.client.paymentPolicy.update({
      where: { id: POLICY_ROW_ID },
      data: {
        ...(dto.commissionBasisPoints !== undefined
          ? { commissionBasisPoints: dto.commissionBasisPoints }
          : {}),
        ...(dto.supportRefundLimitCents !== undefined
          ? { supportRefundLimitCents: dto.supportRefundLimitCents }
          : {}),
        ...(dto.pastDueGracePeriodDays !== undefined
          ? { pastDueGracePeriodDays: dto.pastDueGracePeriodDays }
          : {}),
        ...(dto.abandonedBookingTtlMinutes !== undefined
          ? { abandonedBookingTtlMinutes: dto.abandonedBookingTtlMinutes }
          : {}),
        ...(dto.premiumWeeklyLiveMinutes !== undefined
          ? { premiumWeeklyLiveMinutes: dto.premiumWeeklyLiveMinutes }
          : {}),
        ...(dto.proWeeklyLiveMinutes !== undefined
          ? { proWeeklyLiveMinutes: dto.proWeeklyLiveMinutes }
          : {}),
        updatedByUserId,
      },
    });
  }
}
