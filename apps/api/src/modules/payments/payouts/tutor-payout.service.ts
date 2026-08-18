import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';

export interface TransferEventData {
  stripeTransferId: string;
  stripeAccountId: string | undefined; // Transfer.destination
  sourceChargeId: string | undefined; // Transfer.source_transaction — correlates to Payment.stripeChargeId
  amountCents: number;
  currency: string;
}

export interface PayoutOutcomeEventData {
  stripePayoutId: string;
  stripeAccountId: string | undefined; // Stripe.Event.account (Connect-scoped event)
  amountCents: number;
  currency: string;
  status: 'PAID' | 'FAILED';
}

/**
 * Webhook-driven reconciliation ledger — see phase-6-implementation.md
 * "Phase 6.9 — Tutor Payouts: design" for why `transfer.created` and
 * `payout.paid`/`payout.failed` each produce their own, deliberately
 * uncorrelated `TutorPayout` row rather than one merged record. Nothing
 * here ever triggers a payout; it only records what Stripe reports.
 */
@Injectable()
export class TutorPayoutService {
  private readonly logger = new Logger('TutorPayout');

  constructor(private readonly prisma: PrismaService) {}

  async recordTransfer(data: TransferEventData): Promise<void> {
    if (!data.stripeAccountId) {
      this.logger.error(JSON.stringify({ event: 'transfer_missing_destination_account', stripeTransferId: data.stripeTransferId }));
      return;
    }

    const account = await this.prisma.client.tutorConnectedAccount.findUnique({
      where: { stripeAccountId: data.stripeAccountId },
    });
    if (!account) {
      this.logger.error(JSON.stringify({ event: 'transfer_unknown_account', stripeAccountId: data.stripeAccountId }));
      return;
    }

    let paymentId: string | undefined;
    if (data.sourceChargeId) {
      const payment = await this.prisma.client.payment.findFirst({ where: { stripeChargeId: data.sourceChargeId } });
      paymentId = payment?.id;
    }

    await this.prisma.client.tutorPayout.upsert({
      where: { stripeTransferId: data.stripeTransferId },
      create: {
        tutorId: account.tutorId,
        paymentId,
        stripeTransferId: data.stripeTransferId,
        amountCents: data.amountCents,
        currency: data.currency.toUpperCase(),
        status: 'PENDING',
      },
      update: {},
    });
  }

  async recordPayoutOutcome(data: PayoutOutcomeEventData): Promise<void> {
    if (!data.stripeAccountId) {
      this.logger.error(JSON.stringify({ event: 'payout_missing_account', stripePayoutId: data.stripePayoutId }));
      return;
    }

    const account = await this.prisma.client.tutorConnectedAccount.findUnique({
      where: { stripeAccountId: data.stripeAccountId },
    });
    if (!account) {
      this.logger.error(JSON.stringify({ event: 'payout_unknown_account', stripeAccountId: data.stripeAccountId }));
      return;
    }

    await this.prisma.client.tutorPayout.upsert({
      where: { stripePayoutId: data.stripePayoutId },
      create: {
        tutorId: account.tutorId,
        stripePayoutId: data.stripePayoutId,
        amountCents: data.amountCents,
        currency: data.currency.toUpperCase(),
        status: data.status,
      },
      update: { status: data.status },
    });
  }

  /** Self-service only — see ConnectController for the same
   * `@CurrentUser()`-scoped IDOR convention. Capped, not full pagination
   * (Phase 6.5 audit finding — was an unbounded query). */
  async getPayoutsForTutor(tutorId: string) {
    return this.prisma.client.tutorPayout.findMany({
      where: { tutorId },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
  }
}
