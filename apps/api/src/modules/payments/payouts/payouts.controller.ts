import { Controller, Get } from '@nestjs/common';
import { UserRole, type AuthenticatedUser } from '@deutschflow/types';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { Roles } from '../../auth/decorators/roles.decorator';
import { TutorPayoutService } from './tutor-payout.service';

/**
 * Route path is independent of this module's folder (same convention as
 * ConnectController) — lives under `payments/` but is not mounted there.
 * `@CurrentUser()`-scoped only: a tutor reads their own payout ledger,
 * never a client-supplied tutorId.
 */
@Controller('tutors/me/payouts')
export class PayoutsController {
  constructor(private readonly payouts: TutorPayoutService) {}

  @Get()
  @Roles(UserRole.TUTOR)
  getMyPayouts(@CurrentUser() user: AuthenticatedUser) {
    return this.payouts.getPayoutsForTutor(user.id);
  }
}
