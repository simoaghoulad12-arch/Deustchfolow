import { Body, Controller, Get, Param, ParseUUIDPipe, Post, UseGuards } from '@nestjs/common';
import { z } from 'zod';
import type { AuthenticatedUser } from '@deutschflow/types';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { AiThrottlerGuard } from '../../ai/guards/ai-throttler.guard';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { GrammarService } from './grammar.service';

const AnswerSchema = z.object({ answer: z.string().max(2000) }).strict();
const PracticeSchema = z.object({ text: z.string().trim().min(3).max(2000) }).strict();
const StageSchema = z.object({ stage: z.enum(['EXPLANATION', 'EXAMPLES', 'GUIDED']) }).strict();

@Controller('live')
export class GrammarController {
  constructor(private readonly grammar: GrammarService) {}

  @Get('grammar')
  list(@CurrentUser() user: AuthenticatedUser) {
    return this.grammar.list(user.id);
  }

  @Get('grammar/:slug')
  topic(@CurrentUser() user: AuthenticatedUser, @Param('slug') slug: string) {
    return this.grammar.topic(user.id, slug);
  }

  @Post('grammar/:slug/stage')
  stage(@CurrentUser() user: AuthenticatedUser, @Param('slug') slug: string, @Body(new ZodValidationPipe(StageSchema)) body: z.infer<typeof StageSchema>) {
    return this.grammar.markStage(user.id, slug, body.stage);
  }

  @Post('grammar/:slug/practice')
  @UseGuards(AiThrottlerGuard)
  practice(@CurrentUser() user: AuthenticatedUser, @Param('slug') slug: string, @Body(new ZodValidationPipe(PracticeSchema)) body: z.infer<typeof PracticeSchema>) {
    return this.grammar.aiPractice(user.id, slug, body.text);
  }

  @Post('exercises/:id/answer')
  @UseGuards(AiThrottlerGuard)
  answer(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(AnswerSchema)) body: z.infer<typeof AnswerSchema>,
  ) {
    return this.grammar.answer(user.id, id, body.answer);
  }
}
