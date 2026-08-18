import { IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class InitiateRefundDto {
  @IsInt()
  @Min(1)
  @Max(10_000_000) // sanity ceiling, not a business rule — see PaymentPolicy for the actual authority limits
  amountCents!: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}
