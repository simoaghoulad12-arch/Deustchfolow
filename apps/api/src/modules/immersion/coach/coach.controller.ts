import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Query, UseGuards } from '@nestjs/common';
import { z } from 'zod';
import type { AuthenticatedUser } from '@deutschflow/types';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { AiThrottlerGuard } from '../../ai/guards/ai-throttler.guard';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { ImmersionContextService } from '../context/immersion-context.service';
import { ErrorMemoryService } from '../errors/error-memory.service';
import { normalizeForMatch } from '../../ai/providers/mock/language-rules';
import { CoachService } from './coach.service';

const ChallengeSchema = z
  .object({
    response: z.string().trim().min(1).max(2000),
    spoken: z.boolean().optional(),
    speechConfidence: z.number().min(0).max(1).optional(),
  })
  .strict();

const MistakePracticeSchema = z.object({ answer: z.string().trim().min(1).max(500) }).strict();
const MistakeStateSchema = z.enum(['NEW', 'PRACTICING', 'MASTERED']).optional();

@Controller('live')
export class CoachController {
  constructor(
    private readonly coachService: CoachService,
    private readonly errors: ErrorMemoryService,
    private readonly context: ImmersionContextService,
  ) {}

  @Get('coach')
  coach(@CurrentUser() user: AuthenticatedUser) {
    return this.coachService.coach(user.id);
  }

  @Get('challenge')
  challenge(@CurrentUser() user: AuthenticatedUser) {
    return this.coachService.dailyChallenge(user.id);
  }

  @Post('challenge')
  @UseGuards(AiThrottlerGuard)
  submitChallenge(
    @CurrentUser() user: AuthenticatedUser,
    @Body(new ZodValidationPipe(ChallengeSchema)) body: z.infer<typeof ChallengeSchema>,
  ) {
    return this.coachService.submitChallenge(user.id, body.response, body);
  }

  @Get('mistakes')
  async mistakes(
    @CurrentUser() user: AuthenticatedUser,
    @Query('state', new ZodValidationPipe(MistakeStateSchema)) state?: 'NEW' | 'PRACTICING' | 'MASTERED',
  ) {
    const lang = await this.context.activeLanguage(user.id);
    const [items, summary] = await Promise.all([
      this.errors.list(user.id, lang, { state }),
      this.errors.summary(user.id, lang),
    ]);
    return { items, summary };
  }

  /** Re-use drill: the learner types the natural version; three correct in a row masters the mistake. */
  @Post('mistakes/:id/practice')
  async practiceMistake(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(MistakePracticeSchema)) body: z.infer<typeof MistakePracticeSchema>,
  ) {
    const lang = await this.context.activeLanguage(user.id);
    const items = await this.errors.list(user.id, lang);
    const mistake = items.find((m) => m.id === id);
    if (!mistake) return { correct: false, mistake: null };
    const correct = normalizeForMatch(body.answer) === normalizeForMatch(mistake.corrected);
    const updated = await this.errors.practice(user.id, id, correct);
    return { correct, expected: mistake.corrected, mistake: updated };
  }
}
