import { IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

export class AnswerAiExerciseDto {
  @IsUUID()
  sessionId!: string;

  @IsUUID()
  messageId!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(500)
  answer!: string;
}
