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
}
