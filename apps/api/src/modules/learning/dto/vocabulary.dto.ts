import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
import { CEFRLevel } from '@deutschflow/types';

export class ReviewVocabularyDto {
  /** The typed translation — graded server-side, never a client "correct" flag. */
  @IsString()
  @MaxLength(200)
  answer!: string;
}

export class QueryVocabularyDto {
  @IsOptional()
  @IsIn(Object.values(CEFRLevel))
  level?: CEFRLevel;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  skip?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  take?: number;
}
