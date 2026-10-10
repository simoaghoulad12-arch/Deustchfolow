import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { z } from 'zod';
import type { AuthenticatedUser } from '@deutschflow/types';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { PlacementService } from './placement.service';

const since = z.string().datetime();
const AnswerSchema = z.object({ since, exerciseId: z.string().uuid(), answer: z.string().max(500) }).strict();
const FinishSchema = z.object({ since }).strict();
const SkipSchema = z.object({ level: z.enum(['A1', 'A2', 'B1', 'B2']) }).strict();

@Controller('live/placement')
export class PlacementController {
  constructor(private readonly placement: PlacementService) {}

  @Post('start')
  start() {
    return this.placement.start();
  }

  @Get('next')
  next(@CurrentUser() user: AuthenticatedUser, @Query('since', new ZodValidationPipe(since)) value: string) {
    return this.placement.next(user.id, value);
  }

  @Post('answer')
  answer(@CurrentUser() user: AuthenticatedUser, @Body(new ZodValidationPipe(AnswerSchema)) body: z.infer<typeof AnswerSchema>) {
    return this.placement.answer(user.id, body);
  }

  @Post('finish')
  finish(@CurrentUser() user: AuthenticatedUser, @Body(new ZodValidationPipe(FinishSchema)) body: z.infer<typeof FinishSchema>) {
    return this.placement.finish(user.id, body.since);
  }

  @Post('skip')
  skip(@CurrentUser() user: AuthenticatedUser, @Body(new ZodValidationPipe(SkipSchema)) body: z.infer<typeof SkipSchema>) {
    return this.placement.skip(user.id, body.level);
  }
}
