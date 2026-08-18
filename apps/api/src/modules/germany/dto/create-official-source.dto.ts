import { IsEnum, IsOptional, IsString, IsUrl, MaxLength, MinLength } from 'class-validator';
import { OfficialSourceTopic } from '@deutschflow/types';

export class CreateOfficialSourceDto {
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title!: string;

  @IsUrl()
  @MaxLength(500)
  url!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(200)
  authority!: string;

  @IsEnum(OfficialSourceTopic)
  topic!: OfficialSourceTopic;

  @IsString()
  @MaxLength(10)
  language!: string;

  /** ISO date string — when a human last confirmed this source is still accurate (spec: "aktualisierbar über eine Official-Source-Architektur"). */
  @IsOptional()
  @IsString()
  lastVerifiedAt?: string;
}
