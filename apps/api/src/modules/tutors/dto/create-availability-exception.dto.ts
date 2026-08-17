import { IsBoolean, IsISO8601, IsOptional, IsString, MaxLength } from 'class-validator';

/** A concrete-date override (vacation/blocked time, or an explicit one-off opening) — stored as a real UTC instant range, unlike the recurring weekday+minute rules. */
export class CreateAvailabilityExceptionDto {
  @IsISO8601()
  startAt!: string;

  @IsISO8601()
  endAt!: string;

  @IsOptional()
  @IsBoolean()
  isBlocked?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}
