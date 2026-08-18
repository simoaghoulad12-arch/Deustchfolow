import { BadRequestException, ConflictException, ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { RefundInitiatorRole } from '@deutschflow/types';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { StripeService } from '../stripe/stripe.service';
import { PaymentPolicyService } from '../policy/payment-policy.service';

const STRIPE_REFUND_STATUS_MAP: Record<string, string> = {
  pending: 'PENDING',
  succeeded: 'SUCCEEDED',
  failed: 'FAILED',
  canceled: 'CANCELED',
};

const REFUNDABLE_PAYMENT_STATUSES = ['SUCCEEDED', 'PARTIALLY_REFUNDED'];

/**
 * Refund initiation is always a server-authenticated ADMIN/SUPPORT
 * action (never a raw client-triggered Stripe call). SUPPORT has a
 * standing authority up to PaymentPolicy.supportRefundLimitCents;
 * above that, only ADMIN can act at all — there is no "pending admin
 * approval" queue for a SUPPORT request that exceeds the limit, it is
 * simply rejected, and an admin has to initiate it themselves (see
 * phase-6 implementation notes for why this is simpler than a
 * two-step approval workflow and still satisfies "Größere ...
 * Refunds benötigen ADMIN-Freigabe").
 */
@Injectable()
export class RefundService {
  private readonly logger = new Logger('Refund');

  constructor(
    private readonly prisma: PrismaService,
    private readonly stripe: StripeService,
    private readonly policy: PaymentPolicyService,
  ) {}

  async initiateRefund(
    initiatedByUserId: string,
    initiatedByRole: typeof RefundInitiatorRole.SUPPORT | typeof RefundInitiatorRole.ADMIN,
    paymentId: string,
    amountCents: number,
    reason: string | undefined,
  ) {
    const payment = await this.prisma.client.payment.findUnique({ where: { id: paymentId } });
    if (!payment) {
      throw new NotFoundException('Payment not found.');
    }
    if (!REFUNDABLE_PAYMENT_STATUSES.includes(payment.status)) {
      throw new ConflictException('Diese Zahlung kann nicht (weiter) erstattet werden.');
    }

    const alreadyRefunded = await this.sumSucceededRefunds(paymentId);
    const remaining = payment.amountCents - alreadyRefunded;
    if (amountCents > remaining) {
      throw new BadRequestException(`Der Erstattungsbetrag übersteigt den verbleibenden Betrag (${remaining} Cent).`);
    }

    const policy = await this.policy.get();
    const requiredAdminApproval = amountCents > policy.supportRefundLimitCents;
    if (initiatedByRole === RefundInitiatorRole.SUPPORT && requiredAdminApproval) {
      throw new ForbiddenException(
        `Dieser Betrag überschreitet die Freigabegrenze für Support (${policy.supportRefundLimitCents} Cent) und benötigt eine Admin-Freigabe.`,
      );
    }

    const isFullRefund = amountCents === remaining;

    const localRefund = await this.prisma.client.refund.create({
      data: {
        paymentId,
        amountCents,
        status: 'PENDING',
        reason,
        initiatedByUserId,
        initiatedByRole,
        requiredAdminApproval,
      },
    });

    // Optimistic: a refund process has started for this booking's
    // payment. Only set for a full refund — a partial refund never
    // changes Booking.status (the session still happened).
    if (isFullRefund) {
      await this.prisma.client.payment.update({ where: { id: paymentId }, data: { status: 'REFUND_PENDING' } });
      await this.setBookingStatusForPayment(paymentId, 'REFUND_PENDING');
    }

    const stripeRefund = await this.stripe.client.refunds.create(
      { payment_intent: payment.stripePaymentIntentId, amount: amountCents },
      { idempotencyKey: `refund:${localRefund.id}` },
    );

    await this.applyRefundOutcome(localRefund.id, paymentId, stripeRefund.id, stripeRefund.status ?? 'pending');

    return this.prisma.client.refund.findUnique({ where: { id: localRefund.id } });
  }

  /** Webhook-driven (Phase 6.5 dispatcher, `refund.updated`) — the
   * ongoing confirmation path for a refund already initiated above. */
  async upsertFromStripeRefund(stripeRefundId: string, stripeStatus: string): Promise<void> {
    const localRefund = await this.prisma.client.refund.findUnique({ where: { stripeRefundId } });
    if (!localRefund) {
      this.logger.error(JSON.stringify({ event: 'refund_unknown_stripe_id', stripeRefundId }));
      return;
    }
    await this.applyRefundOutcome(localRefund.id, localRefund.paymentId, stripeRefundId, stripeStatus);
  }

  /** Shared by both the synchronous creation response and the async
   * webhook confirmation — same outcome logic either way, applied
   * idempotently (re-applying an already-applied outcome is a no-op
   * in effect, just redundant writes). */
  private async applyRefundOutcome(
    localRefundId: string,
    paymentId: string,
    stripeRefundId: string,
    stripeStatus: string,
  ): Promise<void> {
    const mappedStatus = STRIPE_REFUND_STATUS_MAP[stripeStatus];
    if (!mappedStatus) {
      this.logger.error(JSON.stringify({ event: 'refund_unrecognized_status', stripeStatus }));
      return;
    }

    await this.prisma.client.refund.update({
      where: { id: localRefundId },
      data: { stripeRefundId, status: mappedStatus as never },
    });

    if (mappedStatus !== 'SUCCEEDED') {
      // FAILED/CANCELED/PENDING: recorded for admin visibility; no
      // automatic Payment/Booking reversal in this phase (documented
      // limitation — see phase-6 implementation notes).
      return;
    }

    const payment = await this.prisma.client.payment.findUnique({ where: { id: paymentId } });
    if (!payment) return;

    const totalRefunded = await this.sumSucceededRefunds(paymentId);
    if (totalRefunded >= payment.amountCents) {
      await this.prisma.client.payment.update({ where: { id: paymentId }, data: { status: 'REFUNDED' } });
      await this.setBookingStatusForPayment(paymentId, 'REFUNDED');
    } else {
      await this.prisma.client.payment.update({ where: { id: paymentId }, data: { status: 'PARTIALLY_REFUNDED' } });
    }
  }

  private async sumSucceededRefunds(paymentId: string): Promise<number> {
    const result = await this.prisma.client.refund.aggregate({
      where: { paymentId, status: 'SUCCEEDED' },
      _sum: { amountCents: true },
    });
    return result._sum.amountCents ?? 0;
  }

  private async setBookingStatusForPayment(paymentId: string, status: 'REFUND_PENDING' | 'REFUNDED'): Promise<void> {
    const payment = await this.prisma.client.payment.findUnique({ where: { id: paymentId }, select: { bookingId: true } });
    if (!payment) return;
    await this.prisma.client.booking.update({ where: { id: payment.bookingId }, data: { status } });
  }

  /**
   * Webhook-driven (`charge.dispute.created`/`.updated`/`.closed`).
   * `disputedAt` is set only the first time a dispute is seen for this
   * payment (never reset by a later status update) — it answers "when
   * did this first become disputed," not "when was this dispute last
   * touched." `disputeStatus` always reflects Stripe's current status
   * string (`needs_response`, `under_review`, `won`, `lost`, ...) so
   * admin/support can see the current state without a live Stripe call.
   */
  async recordDispute(stripePaymentIntentId: string, disputeStatus: string): Promise<void> {
    const payment = await this.prisma.client.payment.findUnique({ where: { stripePaymentIntentId } });
    if (!payment) {
      this.logger.error(JSON.stringify({ event: 'dispute_unknown_payment_intent', stripePaymentIntentId }));
      return;
    }

    await this.prisma.client.payment.update({
      where: { id: payment.id },
      data: { disputedAt: payment.disputedAt ?? new Date(), disputeStatus },
    });
  }
}
