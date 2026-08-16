import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { CEFRLevel } from '@deutschflow/types';

export class UpdateLearningProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  nativeLanguage?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  explanationLanguage?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  timezone?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  learningGoal?: string | null;

  @IsOptional()
  @IsEnum(CEFRLevel)
  currentLevel?: CEFRLevel | null;

  @IsOptional()
  @IsEnum(CEFRLevel)
  targetLevel?: CEFRLevel | null;
}
