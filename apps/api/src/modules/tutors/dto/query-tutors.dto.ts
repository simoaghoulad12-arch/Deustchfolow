import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
import { CEFRLevel, TutorSpecialty } from '@deutschflow/types';

export class QueryTutorsDto {
  @IsOptional()
  @IsEnum(CEFRLevel)
  level?: CEFRLevel;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  language?: string;

  @IsOptional()
  @IsEnum(TutorSpecialty)
  specialty?: TutorSpecialty;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  maxPriceCents?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  minRating?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  skip?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  take?: number;
}
