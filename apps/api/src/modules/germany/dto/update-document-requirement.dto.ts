import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { DocumentRequirementStatus } from '@deutschflow/types';

export class UpdateDocumentRequirementDto {
  @IsOptional()
  @IsEnum(DocumentRequirementStatus)
  status?: DocumentRequirementStatus;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  context?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;
}
