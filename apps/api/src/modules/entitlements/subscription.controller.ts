import { Controller, Get, NotFoundException } from '@nestjs/common';
import { SubscriptionStatus, type AuthenticatedUser } from '@deutschflow/types';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { PrismaService } from '../../common/prisma/prisma.service';

@Controller('users/me/subscription')
export class SubscriptionController {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Always scoped to the caller's own id (`@CurrentUser()`), never a
   * client-supplied userId — the strongest available IDOR defense: there
   * is no id parameter to tamper with in the first place.
   */
  @Get()
  async mySubscription(@CurrentUser() user: AuthenticatedUser) {
    const subscription = await this.prisma.client.subscription.findFirst({
      where: { userId: user.id, status: SubscriptionStatus.ACTIVE },
      orderBy: { createdAt: 'desc' },
    });

    if (!subscription) {
      throw new NotFoundException('No active subscription found.');
    }

    return {
      plan: subscription.plan,
      status: subscription.status,
      startedAt: subscription.startedAt,
      expiresAt: subscription.expiresAt,
      currentPeriodEnd: subscription.currentPeriodEnd,
      cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
    };
  }
}
