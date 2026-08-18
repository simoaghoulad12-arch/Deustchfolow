import { Controller, Get, Post } from '@nestjs/common';
import { UserRole, type AuthenticatedUser } from '@deutschflow/types';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { Roles } from '../../auth/decorators/roles.decorator';
import { ConnectAccountService } from './connect-account.service';

/**
 * Scoped to `@CurrentUser()` throughout — a tutor only ever creates an
 * onboarding link or checks the status for their OWN Connect account,
 * never a client-supplied tutorId (same IDOR-defense convention as the
 * rest of the codebase).
 */
@Controller('payments/connect')
export class ConnectController {
  constructor(private readonly connectAccounts: ConnectAccountService) {}

  @Post('onboarding-link')
  @Roles(UserRole.TUTOR)
  createOnboardingLink(@CurrentUser() user: AuthenticatedUser) {
    return this.connectAccounts.createOnboardingLink(user.id);
  }

  @Get('status')
  @Roles(UserRole.TUTOR)
  getStatus(@CurrentUser() user: AuthenticatedUser) {
    return this.connectAccounts.getStatusForTutor(user.id);
  }
}
