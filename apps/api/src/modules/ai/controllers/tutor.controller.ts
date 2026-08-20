import { Body, Controller, Get, Param, ParseUUIDPipe, Post, UseGuards } from '@nestjs/common';
import type { AuthenticatedUser } from '@deutschflow/types';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { TutorService } from '../services/tutor.service';
import { ExerciseGenerationService } from '../services/exercise-generation.service';
import { SendTutorMessageDto } from '../dto/send-tutor-message.dto';
import { AnswerAiExerciseDto } from '../dto/answer-ai-exercise.dto';
import { AiThrottlerGuard } from '../guards/ai-throttler.guard';

/**
 * Every route here is scoped to `@CurrentUser()` — a client can never
 * read or write another user's conversation (spec section 13).
 */
@UseGuards(AiThrottlerGuard)
@Controller('ai/tutor')
export class TutorController {
  constructor(
    private readonly tutorService: TutorService,
    private readonly exerciseGenerationService: ExerciseGenerationService,
  ) {}

  @Post()
  sendMessage(@CurrentUser() user: AuthenticatedUser, @Body() dto: SendTutorMessageDto) {
    return this.tutorService.sendMessage(user.id, dto);
  }

  @Post('exercise/answer')
  answerExercise(@CurrentUser() user: AuthenticatedUser, @Body() dto: AnswerAiExerciseDto) {
    return this.exerciseGenerationService.answer(user.id, dto);
  }

  @Get('sessions')
  listSessions(@CurrentUser() user: AuthenticatedUser) {
    return this.tutorService.listSessions(user.id);
  }

  @Get('sessions/:sessionId')
  getSession(@CurrentUser() user: AuthenticatedUser, @Param('sessionId', ParseUUIDPipe) sessionId: string) {
    return this.tutorService.getSessionWithMessages(user.id, sessionId);
  }
}
