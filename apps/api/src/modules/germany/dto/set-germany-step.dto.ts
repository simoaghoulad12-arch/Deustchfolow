import { IsEnum } from 'class-validator';
import { GermanyPathStep } from '@deutschflow/types';

export class SetGermanyStepDto {
  @IsEnum(GermanyPathStep)
  step!: GermanyPathStep;
}
