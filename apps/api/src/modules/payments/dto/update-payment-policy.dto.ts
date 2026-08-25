import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class UpdatePaymentPolicyDto {
  /** Basis points, 0-10000 (0%-100%). */
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10000)
  commissionBasisPoints?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  supportRefundLimitCents?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  pastDueGracePeriodDays?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  abandonedBookingTtlMinutes?: number;

  /** Weekly live-lesson minutes included in the PREMIUM plan ("Pro"). 0 disables the quota. */
  @IsOptional()
  @IsInt()
  @Min(0)
  premiumWeeklyLiveMinutes?: number;

  /** Weekly live-lesson minutes included in the PRO plan ("Max"). 0 disables the quota. */
  @IsOptional()
  @IsInt()
  @Min(0)
  proWeeklyLiveMinutes?: number;
}
