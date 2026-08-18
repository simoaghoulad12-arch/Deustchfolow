import { IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

export class SendTutorMessageDto {
  @IsString()
  @MinLength(1)
  @MaxLength(4000) // absolute ceiling regardless of plan; the plan-specific limit is enforced in TutorService
  message!: string;

  @IsOptional()
  @IsUUID()
  sessionId?: string;

  @IsOptional()
  @IsUUID()
  lessonId?: string;

  /** Starts a new session as a Real-Life Simulation run (spec section 15) — ignored when sessionId is also given (an existing session keeps whatever it was started with). */
  @IsOptional()
  @IsUUID()
  simulationId?: string;
}
