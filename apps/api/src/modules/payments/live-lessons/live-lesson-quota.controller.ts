import { Controller, Get } from '@nestjs/common';
import type { AuthenticatedUser } from '@deutschflow/types';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { EntitlementsService } from '../../entitlements/entitlements.service';
import { LiveLessonQuotaService } from './live-lesson-quota.service';

/**
 * Read-only view of the caller's own PRO/MAX weekly live-lesson quota
 * (Phase 7 §6 dashboard requirement) — always scoped to `@CurrentUser()`,
 * never a client-supplied userId. Resolves the plan itself
 * (EntitlementsService) rather than trusting a client-supplied one —
 * same discipline as the booking-checkout flow.
 */
@Controller('payments/live-lessons/quota')
export class LiveLessonQuotaController {
  constructor(
    private readonly entitlements: EntitlementsService,
    private readonly liveLessonQuota: LiveLessonQuotaService,
  ) {}

  @Get('me')
  async getMyQuota(@CurrentUser() user: AuthenticatedUser) {
    const plan = await this.entitlements.getActivePlan(user.id);
    const summary = await this.liveLessonQuota.getQuotaSummary(user.id, plan);
    return { plan, ...summary };
  }
}
