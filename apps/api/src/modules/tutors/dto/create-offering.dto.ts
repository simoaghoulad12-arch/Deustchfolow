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

  /** Integer minor units (cents) — never a float. Min 50 (EUR 0.50) —
   * Stripe's documented minimum charge amount for EUR; a lower value
   * would be rejected at checkout time instead of at creation time
   * (Phase 6.5 audit finding). */
  @IsInt()
  @Min(50)
  @Max(100_000)
  priceCents!: number;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(5)
  @IsEnum(CEFRLevel, { each: true })
  cefrLevels?: CEFRLevel[];
}
