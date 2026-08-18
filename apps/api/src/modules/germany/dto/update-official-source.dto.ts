import { IsBoolean, IsEnum, IsOptional, IsString, IsUrl, MaxLength, MinLength } from 'class-validator';
import { OfficialSourceTopic } from '@deutschflow/types';

export class UpdateOfficialSourceDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsUrl()
  @MaxLength(500)
  url?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  authority?: string;

  @IsOptional()
  @IsEnum(OfficialSourceTopic)
  topic?: OfficialSourceTopic;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  language?: string;

  @IsOptional()
  @IsString()
  lastVerifiedAt?: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
