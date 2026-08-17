import { IsEnum, IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';
import { CEFRLevel } from '@deutschflow/types';

export class WritingCorrectDto {
  @IsString()
  @MinLength(1)
  @MaxLength(4000) // absolute ceiling regardless of plan; the plan-specific limit is enforced in CorrectionService
  text!: string;

  @IsOptional()
  @IsUUID()
  lessonId?: string;

  @IsOptional()
  @IsEnum(CEFRLevel)
  targetLevel?: CEFRLevel;
}
