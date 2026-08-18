import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';

@Module({
  imports: [
    // Burst-abuse protection (Phase 6.5 audit finding — reviews had
    // zero rate limiting). Same pattern/ceiling philosophy as the AI,
    // Payments, and Bookings modules (see ReviewsThrottlerGuard).
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 30 }]),
  ],
  controllers: [ReviewsController],
  providers: [ReviewsService],
  exports: [ReviewsService],
})
export class ReviewsModule {}
