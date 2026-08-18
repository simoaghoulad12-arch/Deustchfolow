import { ArrayMaxSize, IsArray, IsBoolean, IsEnum, IsInt, IsOptional, IsString, Max, MaxLength, Min, MinLength } from 'class-validator';
import { CEFRLevel, TutorSpecialty } from '@deutschflow/types';

/** All fields optional — genuine partial update (unlike the profile's full-replace PUT), since an offering has many independent, individually-toggleable fields (e.g. flipping `isActive` shouldn't require resending the whole offering). */
export class UpdateOfferingDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @IsEnum(TutorSpecialty)
  category?: TutorSpecialty;

  @IsOptional()
  @IsInt()
  @Min(15)
  @Max(180)
  durationMinutes?: number;

  /** Min 50 (EUR 0.50) — see CreateOfferingDto. */
  @IsOptional()
  @IsInt()
  @Min(50)
  @Max(100_000)
  priceCents?: number;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(5)
  @IsEnum(CEFRLevel, { each: true })
  cefrLevels?: CEFRLevel[];

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
