import { BadRequestException, Injectable } from '@nestjs/common';
import { SubscriptionPlan } from '@deutschflow/types';
import { StripeService } from '../stripe/stripe.service';
import { StripeCustomerService } from '../customers/stripe-customer.service';
import { priceIdForPlan } from '../subscriptions/subscription-mapping';

function getAppUrl(): string {
  const url = process.env.APP_URL;
  if (!url) {
    throw new Error('Missing required environment variable: APP_URL');
  }
  return url;
}

/**
 * Stripe-hosted Checkout for subscriptions — deliberately NOT a
 * custom card form. Keeps PCI scope at SAQ-A (card data never transits
 * our code, even tokenized) and Stripe's hosted page already handles
 * SCA/3D-Secure for EU cards without any bespoke logic here (phase-6
 * quality-gate report §7).
 *
 * Booking-payment checkout (PaymentIntent-based, Stripe.js in-browser)
 * is a different Stripe product with different properties and is added
 * to this service in Phase 6.7.
 */
@Injectable()
export class CheckoutService {
  constructor(
    private readonly stripe: StripeService,
    private readonly stripeCustomers: StripeCustomerService,
  ) {}

  async createSubscriptionCheckout(
    userId: string,
    plan: typeof SubscriptionPlan.PREMIUM | typeof SubscriptionPlan.PRO,
  ): Promise<{ url: string }> {
    const priceId = priceIdForPlan(plan);
    const { stripeCustomerId } = await this.stripeCustomers.getOrCreateForUser(userId);
    const appUrl = getAppUrl();

    const session = await this.stripe.client.checkout.sessions.create({
      mode: 'subscription',
      customer: stripeCustomerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appUrl}/settings/billing?checkout=success`,
      cancel_url: `${appUrl}/settings/billing?checkout=cancelled`,
      client_reference_id: userId,
    });

    if (!session.url) {
      // Stripe always returns a url for a Checkout Session created this
      // way — a missing one means something is wrong with the Stripe
      // account config (e.g. domain not verified), not a client error.
      throw new BadRequestException('Stripe did not return a checkout URL.');
    }

    return { url: session.url };
  }
}
