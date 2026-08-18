import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { TutorConnectAccountStatus } from '@deutschflow/types';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { StripeService } from '../stripe/stripe.service';

function getAppUrl(): string {
  const url = process.env.APP_URL;
  if (!url) {
    throw new Error('Missing required environment variable: APP_URL');
  }
  return url;
}

/** Derives the local status from Stripe's three capability flags —
 * pure, no I/O, easy to unit test on its own. */
export function deriveConnectStatus(
  chargesEnabled: boolean,
  payoutsEnabled: boolean,
  detailsSubmitted: boolean,
): TutorConnectAccountStatus {
  if (chargesEnabled && payoutsEnabled) return TutorConnectAccountStatus.ENABLED;
  if (detailsSubmitted) return TutorConnectAccountStatus.RESTRICTED;
  return TutorConnectAccountStatus.ONBOARDING_INCOMPLETE;
}

export interface StripeAccountEventData {
  stripeAccountId: string;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  detailsSubmitted: boolean;
}

/**
 * Owns the 1:1 TutorProfile <-> Stripe Connect Express account
 * relationship and the capability flags that determine whether a
 * tutor's offerings can actually be paid for. Created lazily when a
 * tutor starts onboarding, never at TutorProfile creation.
 *
 * A tutor's offerings staying visible/requestable in the marketplace
 * (Phase 5, unchanged) but not being PAYABLE until Connect is ENABLED
 * is a deliberate, minimal-diff choice — see phase-6 implementation
 * notes: the actual gate lives in booking-payment checkout (Phase 6.7),
 * not in Booking creation itself, so Phase 5's booking flow and its
 * existing test suite are untouched by this subphase.
 */
@Injectable()
export class ConnectAccountService {
  private readonly logger = new Logger('ConnectAccount');

  constructor(
    private readonly prisma: PrismaService,
    private readonly stripe: StripeService,
  ) {}

  async getOrCreateForTutor(tutorId: string): Promise<{ stripeAccountId: string; status: TutorConnectAccountStatus }> {
    const existing = await this.prisma.client.tutorConnectedAccount.findUnique({ where: { tutorId } });
    if (existing) {
      return { stripeAccountId: existing.stripeAccountId, status: existing.status };
    }

    const tutorUser = await this.prisma.client.user.findUnique({
      where: { id: tutorId },
      select: { email: true },
    });
    if (!tutorUser) {
      throw new NotFoundException('Tutor not found.');
    }

    // Country is fixed to Germany for this phase — DeutschFlow's
    // current scope is German-language tutoring; multi-country tutor
    // payouts are an explicit later expansion, not built speculatively
    // here (see phase-6 implementation notes).
    const account = await this.stripe.client.accounts.create({
      type: 'express',
      country: 'DE',
      email: tutorUser.email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    });

    const created = await this.prisma.client.tutorConnectedAccount.create({
      data: { tutorId, stripeAccountId: account.id },
    });

    return { stripeAccountId: created.stripeAccountId, status: created.status };
  }

  async createOnboardingLink(tutorId: string): Promise<{ url: string }> {
    const { stripeAccountId } = await this.getOrCreateForTutor(tutorId);
    const appUrl = getAppUrl();

    const link = await this.stripe.client.accountLinks.create({
      account: stripeAccountId,
      refresh_url: `${appUrl}/tutor/payouts?onboarding=refresh`,
      return_url: `${appUrl}/tutor/payouts?onboarding=return`,
      type: 'account_onboarding',
    });

    return { url: link.url };
  }

  /** Webhook-driven — the only path allowed to set capability flags. An
   * event for a Stripe account id with no local mirror row is logged
   * and skipped rather than crashing the webhook handler — mirrors
   * SubscriptionService's "unknown customer" handling (Phase 6.3). */
  async upsertFromStripeAccount(data: StripeAccountEventData): Promise<void> {
    const existing = await this.prisma.client.tutorConnectedAccount.findUnique({
      where: { stripeAccountId: data.stripeAccountId },
    });
    if (!existing) {
      this.logger.error(
        JSON.stringify({ event: 'connect_account_unknown', stripeAccountId: data.stripeAccountId }),
      );
      return;
    }

    const status = deriveConnectStatus(data.chargesEnabled, data.payoutsEnabled, data.detailsSubmitted);

    await this.prisma.client.tutorConnectedAccount.update({
      where: { stripeAccountId: data.stripeAccountId },
      data: {
        chargesEnabled: data.chargesEnabled,
        payoutsEnabled: data.payoutsEnabled,
        detailsSubmitted: data.detailsSubmitted,
        status,
      },
    });
  }

  async isBookable(tutorId: string): Promise<boolean> {
    const account = await this.prisma.client.tutorConnectedAccount.findUnique({ where: { tutorId } });
    return account?.status === TutorConnectAccountStatus.ENABLED;
  }

  /** Self-service status view — scoped to the calling tutor. */
  async getStatusForTutor(tutorId: string) {
    const account = await this.prisma.client.tutorConnectedAccount.findUnique({ where: { tutorId } });
    if (!account) {
      return { status: TutorConnectAccountStatus.ONBOARDING_INCOMPLETE, chargesEnabled: false, payoutsEnabled: false };
    }
    return {
      status: account.status,
      chargesEnabled: account.chargesEnabled,
      payoutsEnabled: account.payoutsEnabled,
    };
  }
}
