import { Body, Controller, Get, Patch } from '@nestjs/common';
import { UserRole, type AuthenticatedUser } from '@deutschflow/types';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { Roles } from '../../auth/decorators/roles.decorator';
import { PaymentPolicyService } from './payment-policy.service';
import { UpdatePaymentPolicyDto } from '../dto/update-payment-policy.dto';

/**
 * SUPPORT can read the policy (needs to know its own standing refund
 * limit) but never write it — only ADMIN edits commission rate, refund
 * limit, grace period, or abandoned-booking TTL (approval decision: SUPPORT
 * acts within a configurable limit, ADMIN configures the limit).
 */
@Controller('payments/policy')
export class PaymentPolicyController {
  constructor(private readonly policy: PaymentPolicyService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.SUPPORT)
  getPolicy() {
    return this.policy.get();
  }

  @Patch()
  @Roles(UserRole.ADMIN)
  updatePolicy(@CurrentUser() user: AuthenticatedUser, @Body() dto: UpdatePaymentPolicyDto) {
    return this.policy.update(dto, user.id);
  }
}
