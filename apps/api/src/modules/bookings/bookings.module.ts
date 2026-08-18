import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { TutorsModule } from '../tutors/tutors.module';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';

/**
 * Depends on TutorsModule for TutorAvailabilityService.assertBookable —
 * the "does this slot fall inside the tutor's declared hours" half of
 * double-booking prevention. The other half (the DB EXCLUDE constraint,
 * the actual race-condition-proof guarantee) lives on the bookings table
 * itself and needs no service dependency.
 */
@Module({
  imports: [
    TutorsModule,
    // Burst-abuse protection (Phase 6.5 audit finding — bookings had
    // zero rate limiting). Same pattern/ceiling philosophy as the AI
    // and Payments modules (see BookingsThrottlerGuard).
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 30 }]),
  ],
  controllers: [BookingsController],
  providers: [BookingsService],
  exports: [BookingsService],
})
export class BookingsModule {}
