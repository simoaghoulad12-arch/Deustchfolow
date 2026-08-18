import { IsEnum, IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';
import { GermanyGoalType } from '@deutschflow/types';

/**
 * Self-tracked by the user, not platform-prescribed — this Foundation
 * phase has no legal rule engine deciding what a user "must" have (spec
 * section 14: "keine erfundenen Anforderungen"). A user adds documents
 * they already know they need (optionally citing an OfficialSource) and
 * tracks their own status for each.
 */
export class CreateDocumentRequirementDto {
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  documentType!: string;

  @IsEnum(GermanyGoalType)
  goal!: GermanyGoalType;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  context?: string;

  @IsOptional()
  @IsUUID()
  sourceId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;
}
