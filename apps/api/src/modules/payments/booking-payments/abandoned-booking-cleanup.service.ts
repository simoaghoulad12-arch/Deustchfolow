import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { BookingPaymentService } from './booking-payment.service';

/**
 * Thin scheduling wrapper — the actual logic
 * (BookingPaymentService.releaseAbandonedBookings) is a plain,
 * independently unit-tested method; this class exists only to invoke
 * it on a timer, kept separate so the business logic never depends on
 * NestJS's scheduler to be testable.
 */
@Injectable()
export class AbandonedBookingCleanupService {
  private readonly logger = new Logger('AbandonedBookingCleanup');

  constructor(private readonly bookingPayments: BookingPaymentService) {}

  @Cron('*/5 * * * *')
  async handleCron(): Promise<void> {
    const released = await this.bookingPayments.releaseAbandonedBookings();
    if (released > 0) {
      this.logger.log(JSON.stringify({ event: 'abandoned_bookings_released', count: released }));
    }
  }
}
