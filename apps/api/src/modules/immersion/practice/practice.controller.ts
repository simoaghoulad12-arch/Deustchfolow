import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { z } from 'zod';
import type { AuthenticatedUser } from '@deutschflow/types';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { AiThrottlerGuard } from '../../ai/guards/ai-throttler.guard';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { PracticeService } from './practice.service';
import { EMOTION_TONES } from './prompt-bank';

const Mode = z.enum(['speaking', 'brain', 'emotion']);
const SubmitSchema = z
  .object({
    mode: Mode,
    prompt: z.string().trim().min(1).max(500),
    response: z.string().trim().min(1).max(2000),
    responseMs: z.number().int().min(0).max(600_000).optional(),
    timeLimitMs: z.number().int().min(1000).max(120_000).optional(),
    targetTone: z.enum(EMOTION_TONES).optional(),
    spoken: z.boolean().optional(),
    speechConfidence: z.number().min(0).max(1).optional(),
  })
  .strict();

@Controller('live/practice')
export class PracticeController {
  constructor(private readonly practice: PracticeService) {}

  @Get('prompts')
  prompts(@CurrentUser() user: AuthenticatedUser, @Query('mode', new ZodValidationPipe(Mode)) mode: z.infer<typeof Mode>) {
    return this.practice.prompts(user.id, mode);
  }

  @Post()
  @UseGuards(AiThrottlerGuard)
  submit(@CurrentUser() user: AuthenticatedUser, @Body(new ZodValidationPipe(SubmitSchema)) body: z.infer<typeof SubmitSchema>) {
    return this.practice.submit(user.id, body);
  }

  @Get('history')
  history(@CurrentUser() user: AuthenticatedUser, @Query('mode', new ZodValidationPipe(Mode.optional())) mode?: z.infer<typeof Mode>) {
    return this.practice.history(user.id, mode);
  }
}
