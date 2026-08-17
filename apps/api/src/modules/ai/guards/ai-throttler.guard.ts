import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

/**
 * Every request that reaches NestJS comes from the same Next.js server
 * process (see architecture decision record / phase-1.5 request flow) —
 * IP-based throttling would throttle every user together under one IP.
 * Key the burst-abuse window by the verified user id from the service
 * token instead. This is deliberately separate from AiUsageService's
 * DB-backed daily cap: this guard stops rapid-fire bursts (seconds), the
 * daily cap controls actual cost (spec section 15).
 */
@Injectable()
export class AiThrottlerGuard extends ThrottlerGuard {
  protected override async getTracker(req: Record<string, unknown>): Promise<string> {
    const user = req.user as { id?: string } | undefined;
    return user?.id ?? (req.ip as string) ?? 'unknown';
  }
}
