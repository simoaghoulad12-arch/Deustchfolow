import { IsEnum, IsOptional } from 'class-validator';
import { CEFRLevel, CareerModuleType } from '@deutschflow/types';

export class QueryCareerModulesDto {
  @IsOptional()
  @IsEnum(CareerModuleType)
  type?: CareerModuleType;

  @IsOptional()
  @IsEnum(CEFRLevel)
  cefrLevel?: CEFRLevel;
}
