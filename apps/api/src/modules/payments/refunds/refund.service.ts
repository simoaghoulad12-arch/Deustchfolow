import { BadRequestException, ConflictException, ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Prisma } from '@deutschflow/database';
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

/** Refund states that represent money already gone or still possibly
 * going (PENDING can still resolve to SUCCEEDED via the async webhook
 * confirmation) — both must count against a payment's remaining
 * refundable balance so two concurrent/sequential requests can never
 * jointly commit more than the payment's actual amount. FAILED/CANCELED
 * refunds never took the money and must NOT count. */
const COMMITTED_REFUND_STATUSES = ['SUCCEEDED', 'PENDING'];

/**
 * Refund initiation is always a server-authenticated ADMIN/SUPPORT
 * action (never a raw client-triggered Stripe call). SUPPORT has a
 * standing authority up to PaymentPolicy.supportRefundLimitCents,
 * enforced cumulatively per payment (not just per individual request —
 * see Phase 6.5 audit finding); above that, only ADMIN can act at all —
 * there is no "pending admin approval" queue for a SUPPORT request that
 * exceeds the limit, it is simply rejected, and an admin has to
 * initiate it themselves (see phase-6 implementation notes for why this
 * is simpler than a two-step approval workflow and still satisfies
 * "Größere ... Refunds benötigen ADMIN-Freigabe").
 */
@Injectable()
export class RefundService {
  private readonly logger = new Logger('Refund');

  constructor(
    private readonly prisma: PrismaService,
    private readonly stripe: StripeService,
    private readonly policy: PaymentPolicyService,
  ) {}

  /**
   * The balance check, cumulative-SUPPORT-limit check, and local Refund
   * row creation all run inside one SERIALIZABLE transaction (Phase 6.5
   * hardening — closes a real race: two concurrent requests could
   * otherwise both read the same "remaining balance" before either had
   * committed its own refund, and jointly over-refund the payment).
   * Postgres detects the conflicting concurrent read/write and aborts
   * the loser with a serialization failure (Prisma error code P2034),
   * mapped below to a clean 409 — same "the database is the last line
   * of defense" philosophy as the booking double-booking EXCLUDE
   * constraint. The Stripe API call itself deliberately stays OUTSIDE
   * the transaction — a DB transaction must never hold locks across a
   * network call to an external service.
   */
  async initiateRefund(
    initiatedByUserId: string,
    initiatedByRole: typeof RefundInitiatorRole.SUPPORT | typeof RefundInitiatorRole.ADMIN,
    paymentId: string,
    amountCents: number,
    reason: string | undefined,
  ) {
    const policy = await this.policy.get();

    let prepared: { refundId: string; isFullRefund: boolean; stripePaymentIntentId: string };
    try {
      prepared = await this.prisma.client.$transaction(
        (tx) => this.prepareRefund(tx, initiatedByUserId, initiatedByRole, paymentId, amountCents, reason, policy),
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
      );
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2034') {
        throw new ConflictException(
          'Diese Erstattung konnte aufgrund eines gleichzeitigen Zugriffs nicht verarbeitet werden. Bitte erneut versuchen.',
        );
      }
      throw error;
    }

    const stripeRefund = await this.stripe.client.refunds.create(
      { payment_intent: prepared.stripePaymentIntentId, amount: amountCents },
      { idempotencyKey: `refund:${prepared.refundId}` },
    );

    await this.applyRefundOutcome(prepared.refundId, paymentId, stripeRefund.id, stripeRefund.status ?? 'pending');

    return this.prisma.client.refund.findUnique({ where: { id: prepared.refundId } });
  }

  private async prepareRefund(
    tx: Prisma.TransactionClient,
    initiatedByUserId: string,
    initiatedByRole: typeof RefundInitiatorRole.SUPPORT | typeof RefundInitiatorRole.ADMIN,
    paymentId: string,
    amountCents: number,
    reason: string | undefined,
    policy: { supportRefundLimitCents: number },
  ): Promise<{ refundId: string; isFullRefund: boolean; stripePaymentIntentId: string }> {
    const payment = await tx.payment.findUnique({ where: { id: paymentId } });
    if (!payment) {
      throw new NotFoundException('Payment not found.');
    }
    if (!REFUNDABLE_PAYMENT_STATUSES.includes(payment.status)) {
      throw new ConflictException('Diese Zahlung kann nicht (weiter) erstattet werden.');
    }

    const committed = await this.sumRefunds(tx, paymentId, COMMITTED_REFUND_STATUSES);
    const remaining = payment.amountCents - committed;
    if (amountCents > remaining) {
      throw new BadRequestException(`Der Erstattungsbetrag übersteigt den verbleibenden Betrag (${remaining} Cent).`);
    }

    const requiredAdminApproval = amountCents > policy.supportRefundLimitCents;
    if (initiatedByRole === RefundInitiatorRole.SUPPORT) {
      if (requiredAdminApproval) {
        throw new ForbiddenException(
          `Dieser Betrag überschreitet die Freigabegrenze für Support (${policy.supportRefundLimitCents} Cent) und benötigt eine Admin-Freigabe.`,
        );
      }
      // Cumulative check: several SUPPORT refunds each individually
      // under the limit must not be able to drain a payment together —
      // the limit is standing authority per payment, not per request.
      const priorSupportCommitted = await this.sumRefunds(tx, paymentId, COMMITTED_REFUND_STATUSES, RefundInitiatorRole.SUPPORT);
      if (priorSupportCommitted + amountCents > policy.supportRefundLimitCents) {
        throw new ForbiddenException(
          `Die kumulierte Erstattungssumme durch Support für diese Zahlung würde die Freigabegrenze (${policy.supportRefundLimitCents} Cent) überschreiten und benötigt eine Admin-Freigabe.`,
        );
      }
    }

    const isFullRefund = amountCents === remaining;

    const localRefund = await tx.refund.create({
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
      await tx.payment.update({ where: { id: paymentId }, data: { status: 'REFUND_PENDING' } });
      await tx.booking.update({ where: { id: payment.bookingId }, data: { status: 'REFUND_PENDING' } });
    }

    return { refundId: localRefund.id, isFullRefund, stripePaymentIntentId: payment.stripePaymentIntentId };
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

    const totalRefunded = await this.sumRefunds(this.prisma.client, paymentId, ['SUCCEEDED']);
    if (totalRefunded >= payment.amountCents) {
      await this.prisma.client.payment.update({ where: { id: paymentId }, data: { status: 'REFUNDED' } });
      await this.setBookingStatusForPayment(paymentId, 'REFUNDED');
    } else {
      await this.prisma.client.payment.update({ where: { id: paymentId }, data: { status: 'PARTIALLY_REFUNDED' } });
    }
  }

  /** `client` is either the regular Prisma client or an open
   * transaction's client — same aggregate shape either way. */
  private async sumRefunds(
    client: Prisma.TransactionClient | PrismaService['client'],
    paymentId: string,
    statuses: string[],
    role?: typeof RefundInitiatorRole.SUPPORT | typeof RefundInitiatorRole.ADMIN,
  ): Promise<number> {
    const result = await client.refund.aggregate({
      where: { paymentId, status: { in: statuses as never[] }, ...(role ? { initiatedByRole: role } : {}) },
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
