import { Body, Controller, Get, Param, ParseUUIDPipe, Post, UseGuards } from '@nestjs/common';
import { z } from 'zod';
import type { AuthenticatedUser } from '@deutschflow/types';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { AiThrottlerGuard } from '../../ai/guards/ai-throttler.guard';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { JournalService } from './journal.service';

const EntrySchema = z.object({ text: z.string().trim().min(10).max(4000) }).strict();

@Controller('live/journal')
export class JournalController {
  constructor(private readonly journal: JournalService) {}

  @Get()
  list(@CurrentUser() user: AuthenticatedUser) {
    return this.journal.list(user.id);
  }

  @Get(':id')
  get(@CurrentUser() user: AuthenticatedUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.journal.get(user.id, id);
  }

  @Post()
  @UseGuards(AiThrottlerGuard)
  create(@CurrentUser() user: AuthenticatedUser, @Body(new ZodValidationPipe(EntrySchema)) body: z.infer<typeof EntrySchema>) {
    return this.journal.create(user.id, body.text);
  }
}
