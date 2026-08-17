import { ArrayMaxSize, IsArray, IsEnum, IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
import { CEFRLevel, TutorSpecialty } from '@deutschflow/types';

/**
 * Full-replace upsert (PUT semantics, not PATCH) — simpler than merge
 * logic for a profile with no field that must survive being omitted.
 * `timezone` is required on every call; validated against the IANA
 * database in TutorProfilesService (class-validator can't check that).
 */
export class UpsertTutorProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  headline?: string;

  @IsOptional()
  @IsString()
  @MaxLength(4000)
  aboutMe?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @IsString({ each: true })
  languages?: string[];

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(5)
  @IsEnum(CEFRLevel, { each: true })
  teachingLevels?: CEFRLevel[];

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(7)
  @IsEnum(TutorSpecialty, { each: true })
  specialties?: TutorSpecialty[];

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(60)
  yearsExperience?: number;

  @IsString()
  @MaxLength(64)
  timezone!: string;
}
