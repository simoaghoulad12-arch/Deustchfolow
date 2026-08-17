import { ArrayMaxSize, IsArray, IsEnum, IsInt, IsOptional, IsString, Max, MaxLength, Min, MinLength } from 'class-validator';
import { CEFRLevel, TutorSpecialty } from '@deutschflow/types';

export class CreateOfferingDto {
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsEnum(TutorSpecialty)
  category!: TutorSpecialty;

  @IsInt()
  @Min(15)
  @Max(180)
  durationMinutes!: number;

  /** Integer minor units (cents) — never a float. No payment processing yet (Phase 6). */
  @IsInt()
  @Min(0)
  @Max(100_000)
  priceCents!: number;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(5)
  @IsEnum(CEFRLevel, { each: true })
  cefrLevels?: CEFRLevel[];
}
