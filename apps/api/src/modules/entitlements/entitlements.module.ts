import { Module } from '@nestjs/common';
import { EntitlementsService } from './entitlements.service';
import { EntitlementsController } from './entitlements.controller';
import { SubscriptionController } from './subscription.controller';

/**
 * The Subscription -> Entitlement layer (see architecture decision
 * record, section 1). Deliberately its own module: distinct from
 * `users` (identity) and from `payments` (reserved for future Stripe
 * integration) — Subscription/Entitlements is a separate concern from
 * both.
 */
@Module({
  controllers: [EntitlementsController, SubscriptionController],
  providers: [EntitlementsService],
  exports: [EntitlementsService],
})
export class EntitlementsModule {}
