import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import type { AuthenticatedUser } from '@deutschflow/types';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { PaymentsThrottlerGuard } from './guards/payments-throttler.guard';
import { CheckoutService } from './checkout/checkout.service';
import { CreateSubscriptionCheckoutDto } from './dto/create-subscription-checkout.dto';
import { BookingPaymentService } from './booking-payments/booking-payment.service';

/** Every route here is burst-abuse-throttled (see PaymentsThrottlerGuard
 * and this module's ThrottlerModule.forRoot config) — checkout-session
 * creation calls the Stripe API, so it needs the same per-user rate
 * limiting AI endpoints already have (phase-6 quality-gate report §13). */
@Controller('payments')
@UseGuards(PaymentsThrottlerGuard)
export class PaymentsController {
  constructor(
    private readonly checkoutService: CheckoutService,
    private readonly bookingPayments: BookingPaymentService,
  ) {}

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

  /**
   * Ownership is enforced inside BookingPaymentService via a combined
   * (id, studentId) lookup — a booking belonging to a different
   * student is a 404, not a 403.
   */
  @Post('bookings/:bookingId/checkout')
  createBookingCheckout(@CurrentUser() user: AuthenticatedUser, @Param('bookingId') bookingId: string) {
    return this.bookingPayments.createCheckout(user.id, bookingId);
  }
}
