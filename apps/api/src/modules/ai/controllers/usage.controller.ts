import { Controller, Get } from '@nestjs/common';
import type { AuthenticatedUser } from '@deutschflow/types';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { AiUsageService } from '../usage/ai-usage.service';

/**
 * Read-only view of the caller's own AI usage against their plan's
 * daily limits (Phase 7 §6 dashboard requirement) — always scoped to
 * `@CurrentUser()`, never a client-supplied userId.
 */
@Controller('ai/usage')
export class AiUsageController {
  constructor(private readonly aiUsage: AiUsageService) {}

  @Get('me')
  getMyUsage(@CurrentUser() user: AuthenticatedUser) {
    return this.aiUsage.getUsageSummary(user.id);
  }
}
