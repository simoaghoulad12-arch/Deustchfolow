import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { UserRole, RefundInitiatorRole, type AuthenticatedUser } from '@deutschflow/types';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { PaymentsThrottlerGuard } from './guards/payments-throttler.guard';
import { CheckoutService } from './checkout/checkout.service';
import { CreateSubscriptionCheckoutDto } from './dto/create-subscription-checkout.dto';
import { InitiateRefundDto } from './dto/initiate-refund.dto';
import { BookingPaymentService } from './booking-payments/booking-payment.service';
import { RefundService } from './refunds/refund.service';

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
    private readonly refunds: RefundService,
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

  /**
   * SUPPORT has standing authority up to PaymentPolicy.supportRefundLimitCents
   * (enforced inside RefundService, not here — the limit is
   * configurable and must be re-read on every call, never cached in a
   * decorator). ADMIN has no limit. Role values are string-identical
   * between UserRole and RefundInitiatorRole for SUPPORT/ADMIN, so this
   * cast is a direct passthrough, not a mapping — see phase-6
   * implementation notes.
   */
  @Post(':paymentId/refund')
  @Roles(UserRole.ADMIN, UserRole.SUPPORT)
  initiateRefund(
    @CurrentUser() user: AuthenticatedUser,
    @Param('paymentId') paymentId: string,
    @Body() dto: InitiateRefundDto,
  ) {
    const role = user.role as typeof RefundInitiatorRole.SUPPORT | typeof RefundInitiatorRole.ADMIN;
    return this.refunds.initiateRefund(user.id, role, paymentId, dto.amountCents, dto.reason);
  }
}
