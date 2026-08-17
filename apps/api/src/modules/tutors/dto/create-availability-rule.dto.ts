import { IsInt, Max, Min } from 'class-validator';

/** Weekday + minute-of-day, local to the tutor's own TutorProfile.timezone — never UTC (see availability-slots.ts). */
export class CreateAvailabilityRuleDto {
  /** 0 = Sunday .. 6 = Saturday. */
  @IsInt()
  @Min(0)
  @Max(6)
  weekday!: number;

  @IsInt()
  @Min(0)
  @Max(1439)
  startMinute!: number;

  @IsInt()
  @Min(1)
  @Max(1440)
  endMinute!: number;
}
