import { IsISO8601, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateBookingDto {
  @IsUUID()
  offeringId!: string;

  /** UTC instant the session starts — the client resolves this from the tutor's advertised local slot before sending it. */
  @IsISO8601()
  startAt!: string;

  /** The booking student's own IANA timezone — display-only, never used for overlap/authorization logic (see Booking.studentTimezone). */
  @IsString()
  @MaxLength(64)
  studentTimezone!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;
}
