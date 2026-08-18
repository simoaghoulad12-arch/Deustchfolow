import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

/**
 * Burst-abuse protection for checkout-session creation (phase-6
 * quality-gate report §13). Same rationale and pattern as
 * AiThrottlerGuard: every request reaches NestJS from the same Next.js
 * server process, so IP-based throttling would throttle every user
 * together — key by the verified user id from the service token
 * instead.
 */
@Injectable()
export class PaymentsThrottlerGuard extends ThrottlerGuard {
  protected override async getTracker(req: Record<string, unknown>): Promise<string> {
    const user = req.user as { id?: string } | undefined;
    return user?.id ?? (req.ip as string) ?? 'unknown';
  }
}
