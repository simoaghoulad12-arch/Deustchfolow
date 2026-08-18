import { IsEnum } from 'class-validator';
import { GermanyGoalType } from '@deutschflow/types';

export class SetGermanyGoalDto {
  @IsEnum(GermanyGoalType)
  goalType!: GermanyGoalType;
}
