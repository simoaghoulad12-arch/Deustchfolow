import { Controller, Get, Param } from '@nestjs/common';
import type { Entitlement } from '@deutschflow/types';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '@deutschflow/types';
import { EntitlementsService } from './entitlements.service';

@Controller('entitlements')
export class EntitlementsController {
  constructor(private readonly entitlementsService: EntitlementsService) {}

  @Get('me')
  async myEntitlements(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<{ entitlements: Entitlement[] }> {
    const entitlements = await this.entitlementsService.getEntitlements(user.id);
    return { entitlements };
  }

  /** Single-entitlement check fixture — used to exercise `canAccess()` end to end. */
  @Get(':key')
  async checkEntitlement(
    @CurrentUser() user: AuthenticatedUser,
    @Param('key') key: string,
  ): Promise<{ entitlement: string; allowed: boolean }> {
    const allowed = await this.entitlementsService.canAccess(user.id, key as Entitlement);
    return { entitlement: key, allowed };
  }
}
