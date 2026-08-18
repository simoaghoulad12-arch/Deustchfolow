import { IsIn } from 'class-validator';
import { SubscriptionPlan } from '@deutschflow/types';

export class CreateSubscriptionCheckoutDto {
  /** FREE is deliberately excluded — it is never checked out against
   * Stripe (every user already has it from registration). */
  @IsIn([SubscriptionPlan.PREMIUM, SubscriptionPlan.PRO])
  plan!: typeof SubscriptionPlan.PREMIUM | typeof SubscriptionPlan.PRO;
}
