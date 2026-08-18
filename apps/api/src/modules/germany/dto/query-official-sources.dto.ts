import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { OfficialSourceTopic } from '@deutschflow/types';

export class QueryOfficialSourcesDto {
  @IsOptional()
  @IsEnum(OfficialSourceTopic)
  topic?: OfficialSourceTopic;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  language?: string;
}
