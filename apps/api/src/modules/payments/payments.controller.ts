import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import type { AuthenticatedUser } from '@deutschflow/types';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { PaymentsThrottlerGuard } from './guards/payments-throttler.guard';
import { CheckoutService } from './checkout/checkout.service';
import { CreateSubscriptionCheckoutDto } from './dto/create-subscription-checkout.dto';

/** Every route here is burst-abuse-throttled (see PaymentsThrottlerGuard
 * and this module's ThrottlerModule.forRoot config) — checkout-session
 * creation calls the Stripe API, so it needs the same per-user rate
 * limiting AI endpoints already have (phase-6 quality-gate report §13). */
@Controller('payments')
@UseGuards(PaymentsThrottlerGuard)
export class PaymentsController {
  constructor(private readonly checkoutService: CheckoutService) {}

  /**
   * Scoped to `@CurrentUser()` — the checkout is always for the calling
   * user's own subscription, never a client-supplied userId.
   */
  @Post('subscriptions/checkout')
  createSubscriptionCheckout(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateSubscriptionCheckoutDto,
  ) {
    return this.checkoutService.createSubscriptionCheckout(user.id, dto.plan);
  }
}
