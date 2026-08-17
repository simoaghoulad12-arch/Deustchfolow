import { IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class SubmitAttemptDto {
  /** Selected Option id for option-graded exercises, or free text otherwise. */
  @IsString()
  @MaxLength(2000)
  answer!: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(3_600_000) // 1 hour — guards against bogus client-supplied durations
  timeSpentMs?: number;
}
