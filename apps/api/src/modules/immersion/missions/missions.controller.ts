import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Query, UseGuards } from '@nestjs/common';
import type { AuthenticatedUser, MissionMode } from '@deutschflow/types';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { AiThrottlerGuard } from '../../ai/guards/ai-throttler.guard';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { MissionService } from './mission.service';
import { ConversationService } from './conversation.service';
import {
  ModeQuerySchema,
  StartRunSchema,
  TurnSchema,
  type StartRunInput,
  type TurnInput,
} from './missions.schemas';

@Controller('live')
export class MissionsController {
  constructor(
    private readonly missions: MissionService,
    private readonly conversation: ConversationService,
  ) {}

  @Get('world')
  world(@CurrentUser() user: AuthenticatedUser) {
    return this.missions.world(user.id);
  }

  @Get('missions')
  list(@CurrentUser() user: AuthenticatedUser, @Query('mode', new ZodValidationPipe(ModeQuerySchema)) mode: MissionMode) {
    return this.missions.listByMode(user.id, mode);
  }

  @Get('missions/:slug')
  detail(@CurrentUser() user: AuthenticatedUser, @Param('slug') slug: string) {
    return this.missions.detail(user.id, slug);
  }

  @Get('next-mission')
  next(@CurrentUser() user: AuthenticatedUser) {
    return this.missions.recommendNext(user.id);
  }

  @Post('missions/:slug/runs')
  @UseGuards(AiThrottlerGuard)
  start(
    @CurrentUser() user: AuthenticatedUser,
    @Param('slug') slug: string,
    @Body(new ZodValidationPipe(StartRunSchema)) body: StartRunInput,
  ) {
    return this.conversation.start(user.id, slug, body);
  }

  @Get('runs/:runId')
  run(@CurrentUser() user: AuthenticatedUser, @Param('runId', ParseUUIDPipe) runId: string) {
    return this.conversation.get(user.id, runId);
  }

  @Post('runs/:runId/turns')
  @UseGuards(AiThrottlerGuard)
  turn(
    @CurrentUser() user: AuthenticatedUser,
    @Param('runId', ParseUUIDPipe) runId: string,
    @Body(new ZodValidationPipe(TurnSchema)) body: TurnInput,
  ) {
    return this.conversation.turn(user.id, runId, body);
  }

  @Post('runs/:runId/hint')
  @UseGuards(AiThrottlerGuard)
  hint(@CurrentUser() user: AuthenticatedUser, @Param('runId', ParseUUIDPipe) runId: string) {
    return this.conversation.hint(user.id, runId);
  }

  @Post('runs/:runId/finish')
  finish(@CurrentUser() user: AuthenticatedUser, @Param('runId', ParseUUIDPipe) runId: string) {
    return this.conversation.finish(user.id, runId);
  }
}
