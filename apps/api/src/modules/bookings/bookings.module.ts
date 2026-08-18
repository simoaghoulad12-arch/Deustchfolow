import { Module } from '@nestjs/common';
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
  imports: [TutorsModule],
  controllers: [BookingsController],
  providers: [BookingsService],
  exports: [BookingsService],
})
export class BookingsModule {}
