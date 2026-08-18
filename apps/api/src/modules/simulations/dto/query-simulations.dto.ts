import { IsEnum, IsOptional } from 'class-validator';
import { CEFRLevel, SimulationCategory } from '@deutschflow/types';

export class QuerySimulationsDto {
  @IsOptional()
  @IsEnum(SimulationCategory)
  category?: SimulationCategory;

  @IsOptional()
  @IsEnum(CEFRLevel)
  cefrLevel?: CEFRLevel;
}
