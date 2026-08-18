import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { StripeService } from '../stripe/stripe.service';

/**
 * Owns the 1:1 User <-> Stripe Customer relationship. A Stripe Customer
 * is created lazily on first checkout (subscription OR booking payment)
 * — never at registration — so a user who never pays never has a Stripe
 * object at all (see phase-6 implementation notes).
 */
@Injectable()
export class StripeCustomerService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly stripe: StripeService,
  ) {}

  /**
   * Returns the existing StripeCustomer row for a user, or creates both
   * the Stripe Customer object and the local row on first call. Callers
   * never see a partial state — either both exist or neither does.
   */
  async getOrCreateForUser(userId: string): Promise<{ stripeCustomerId: string }> {
    const existing = await this.prisma.client.stripeCustomer.findUnique({ where: { userId } });
    if (existing) {
      return { stripeCustomerId: existing.stripeCustomerId };
    }

    const user = await this.prisma.client.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true },
    });
    if (!user) {
      throw new NotFoundException('User not found.');
    }

    const customer = await this.stripe.client.customers.create({
      email: user.email,
      metadata: { userId: user.id },
    });

    const created = await this.prisma.client.stripeCustomer.create({
      data: { userId, stripeCustomerId: customer.id },
    });

    return { stripeCustomerId: created.stripeCustomerId };
  }

  /** Read-only lookup — null if the user has never entered a checkout flow. */
  async findForUser(userId: string): Promise<{ stripeCustomerId: string } | null> {
    const existing = await this.prisma.client.stripeCustomer.findUnique({ where: { userId } });
    return existing ? { stripeCustomerId: existing.stripeCustomerId } : null;
  }

  /** Reverse lookup used by the webhook handler — a Stripe event carries
   * a Customer id, never our internal userId. Null for a Stripe customer
   * that (should never happen, but) has no local mirror row. */
  async findUserIdByStripeCustomerId(stripeCustomerId: string): Promise<string | null> {
    const existing = await this.prisma.client.stripeCustomer.findUnique({
      where: { stripeCustomerId },
      select: { userId: true },
    });
    return existing?.userId ?? null;
  }
}
