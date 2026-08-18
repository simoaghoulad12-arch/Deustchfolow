import { BadRequestException, ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { StripeService } from '../stripe/stripe.service';
import { StripeCustomerService } from '../customers/stripe-customer.service';
import { ConnectAccountService } from '../connect/connect-account.service';
import { PaymentPolicyService } from '../policy/payment-policy.service';
import { isAbandoned } from './abandoned-booking';

export interface PaymentIntentEventData {
  id: string;
  status: string;
  bookingId: string | undefined; // from PaymentIntent.metadata.bookingId
}

/** Integer basis-points commission, applied to integer cents, always
 * rounded — never a float amount sent to Stripe. */
export function computeApplicationFeeCents(amountCents: number, commissionBasisPoints: number): number {
  return Math.round((amountCents * commissionBasisPoints) / 10_000);
}

const STRIPE_PAYMENT_INTENT_STATUS_MAP: Record<string, string> = {
  requires_payment_method: 'REQUIRES_PAYMENT_METHOD',
  requires_confirmation: 'REQUIRES_CONFIRMATION',
  requires_action: 'REQUIRES_CONFIRMATION',
  processing: 'PROCESSING',
  succeeded: 'SUCCEEDED',
  canceled: 'CANCELED',
};

/**
 * The marketplace one-time booking payment flow (quality-gate report
 * §6). Uses Stripe Connect DESTINATION charges (application_fee_amount
 * + transfer_data.destination on the PaymentIntent itself) — the
 * platform is the merchant of record, Stripe atomically splits the
 * commission and the tutor's share in one charge. This is why there is
 * no separate "collect then transfer" step anywhere in this class.
 */
@Injectable()
export class BookingPaymentService {
  private readonly logger = new Logger('BookingPayment');

  constructor(
    private readonly prisma: PrismaService,
    private readonly stripe: StripeService,
    private readonly stripeCustomers: StripeCustomerService,
    private readonly connectAccounts: ConnectAccountService,
    private readonly policy: PaymentPolicyService,
  ) {}

  /**
   * Ownership is checked via a combined (id, studentId) lookup — a
   * booking belonging to a different student, or that doesn't exist at
   * all, is always a 404, never a 403 (same IDOR-defense convention as
   * every other resource in this codebase).
   */
  async createCheckout(studentId: string, bookingId: string): Promise<{ clientSecret: string }> {
    const booking = await this.prisma.client.booking.findFirst({
      where: { id: bookingId, studentId },
      include: { offering: true },
    });
    if (!booking) {
      throw new NotFoundException('Booking not found.');
    }
    if (booking.status !== 'PENDING') {
      throw new ConflictException('Nur ausstehende Buchungen können bezahlt werden.');
    }

    const existingPayment = await this.prisma.client.payment.findUnique({ where: { bookingId } });
    if (existingPayment) {
      if (existingPayment.status === 'REQUIRES_PAYMENT_METHOD' || existingPayment.status === 'REQUIRES_CONFIRMATION') {
        // A retry of an already-started, not-yet-completed checkout —
        // re-fetch the client_secret from Stripe rather than creating a
        // second PaymentIntent for the same booking (double-payment
        // prevention layer 1: the DB unique constraint on
        // payments.bookingId means we could never insert a second row
        // anyway, but re-fetching here also avoids an unhandled DB
        // error on a legitimate retry).
        const intent = await this.stripe.client.paymentIntents.retrieve(existingPayment.stripePaymentIntentId);
        if (!intent.client_secret) {
          throw new BadRequestException('Stripe did not return a client secret.');
        }
        return { clientSecret: intent.client_secret };
      }
      throw new ConflictException('Diese Buchung wurde bereits bezahlt oder die Zahlung wird verarbeitet.');
    }

    const isBookable = await this.connectAccounts.isBookable(booking.tutorId);
    if (!isBookable) {
      throw new BadRequestException('Dieser Tutor kann aktuell keine Zahlungen empfangen.');
    }

    const tutorAccount = await this.prisma.client.tutorConnectedAccount.findUnique({
      where: { tutorId: booking.tutorId },
    });
    if (!tutorAccount) {
      // isBookable() already confirmed ENABLED status, so this row
      // must exist — defensive only, never expected in practice.
      throw new BadRequestException('Dieser Tutor kann aktuell keine Zahlungen empfangen.');
    }

    const policy = await this.policy.get();
    const applicationFeeCents = computeApplicationFeeCents(booking.offering.priceCents, policy.commissionBasisPoints);

    const { stripeCustomerId } = await this.stripeCustomers.getOrCreateForUser(studentId);

    // Stripe idempotency key derived from the booking id — a duplicate
    // client request (network retry, double-click) for the same
    // booking's first checkout attempt creates the same PaymentIntent,
    // never two (double-payment prevention layer 2).
    const paymentIntent = await this.stripe.client.paymentIntents.create(
      {
        amount: booking.offering.priceCents,
        currency: booking.offering.currency.toLowerCase(),
        customer: stripeCustomerId,
        application_fee_amount: applicationFeeCents,
        transfer_data: { destination: tutorAccount.stripeAccountId },
        automatic_payment_methods: { enabled: true },
        metadata: { bookingId: booking.id },
      },
      { idempotencyKey: `booking:${booking.id}:checkout` },
    );

    if (!paymentIntent.client_secret) {
      throw new BadRequestException('Stripe did not return a client secret.');
    }

    await this.prisma.client.payment.create({
      data: {
        bookingId: booking.id,
        stripePaymentIntentId: paymentIntent.id,
        amountCents: booking.offering.priceCents,
        applicationFeeCents,
        currency: booking.offering.currency,
        status: 'REQUIRES_PAYMENT_METHOD',
      },
    });

    return { clientSecret: paymentIntent.client_secret };
  }

  /** Webhook-driven only — see class doc comment. */
  async upsertFromPaymentIntent(data: PaymentIntentEventData): Promise<void> {
    if (!data.bookingId) {
      this.logger.error(JSON.stringify({ event: 'payment_intent_missing_booking_metadata', stripePaymentIntentId: data.id }));
      return;
    }

    const payment = await this.prisma.client.payment.findUnique({ where: { bookingId: data.bookingId } });
    if (!payment) {
      this.logger.error(JSON.stringify({ event: 'payment_intent_unknown_booking', bookingId: data.bookingId, stripePaymentIntentId: data.id }));
      return;
    }

    const status = STRIPE_PAYMENT_INTENT_STATUS_MAP[data.status];
    if (!status) {
      this.logger.error(JSON.stringify({ event: 'payment_intent_unrecognized_status', status: data.status }));
      return;
    }

    await this.prisma.client.payment.update({
      where: { id: payment.id },
      data: { status: status as never },
    });

    if (status === 'SUCCEEDED') {
      await this.prisma.client.booking.update({
        where: { id: data.bookingId },
        data: { status: 'CONFIRMED' },
      });
    } else if (status === 'CANCELED') {
      await this.prisma.client.booking.update({
        where: { id: data.bookingId },
        data: { status: 'CANCELLED', cancellationReason: 'Zahlung abgebrochen.' },
      });
    }
  }

  /**
   * Releases the calendar slot held by a booking whose checkout was
   * never completed. TTL comes from PaymentPolicy, never a hardcoded
   * constant. Called on a schedule (see AbandonedBookingCleanupService)
   * — kept as a plain method here, not a @Cron itself, so it stays
   * unit-testable without touching NestJS's scheduler.
   */
  async releaseAbandonedBookings(now: Date = new Date()): Promise<number> {
    const policy = await this.policy.get();
    const candidates = await this.prisma.client.booking.findMany({
      where: { status: 'PENDING' },
      select: { id: true, createdAt: true, payment: { select: { status: true } } },
    });

    const toRelease = candidates.filter((booking) => {
      const paymentStillIncomplete =
        !booking.payment ||
        booking.payment.status === 'REQUIRES_PAYMENT_METHOD' ||
        booking.payment.status === 'REQUIRES_CONFIRMATION';
      return paymentStillIncomplete && isAbandoned(booking.createdAt, policy.abandonedBookingTtlMinutes, now);
    });

    if (toRelease.length === 0) return 0;

    await this.prisma.client.booking.updateMany({
      where: { id: { in: toRelease.map((b) => b.id) } },
      data: { status: 'CANCELLED', cancellationReason: 'Buchung automatisch storniert (Zahlung nicht abgeschlossen).' },
    });

    return toRelease.length;
  }
}
