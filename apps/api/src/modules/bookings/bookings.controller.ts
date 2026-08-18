import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { UserRole, type AuthenticatedUser } from '@deutschflow/types';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { CancelBookingDto } from './dto/cancel-booking.dto';
import { BookingsThrottlerGuard } from './guards/bookings-throttler.guard';

/** Every route here is burst-abuse-throttled (see BookingsThrottlerGuard
 * and this module's ThrottlerModule.forRoot config) — Phase 6.5 audit
 * finding: booking creation/mutation had no rate limiting at all. */
@UseGuards(BookingsThrottlerGuard)
@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateBookingDto) {
    return this.bookingsService.create(user.id, dto);
  }

  @Get('me')
  findOwnAsStudent(@CurrentUser() user: AuthenticatedUser) {
    return this.bookingsService.findOwnAsStudent(user.id);
  }

  @Get('tutor/me')
  @Roles(UserRole.TUTOR)
  findOwnAsTutor(@CurrentUser() user: AuthenticatedUser) {
    return this.bookingsService.findOwnAsTutor(user.id);
  }

  @Patch(':bookingId/confirm')
  @Roles(UserRole.TUTOR)
  confirm(@CurrentUser() user: AuthenticatedUser, @Param('bookingId') bookingId: string) {
    return this.bookingsService.confirm(user.id, bookingId);
  }

  @Patch(':bookingId/cancel')
  cancel(
    @CurrentUser() user: AuthenticatedUser,
    @Param('bookingId') bookingId: string,
    @Body() dto: CancelBookingDto,
  ) {
    return this.bookingsService.cancel(user.id, bookingId, dto);
  }

  @Patch(':bookingId/complete')
  @Roles(UserRole.TUTOR)
  complete(@CurrentUser() user: AuthenticatedUser, @Param('bookingId') bookingId: string) {
    return this.bookingsService.complete(user.id, bookingId);
  }

  @Patch(':bookingId/no-show')
  @Roles(UserRole.TUTOR)
  markNoShow(@CurrentUser() user: AuthenticatedUser, @Param('bookingId') bookingId: string) {
    return this.bookingsService.markNoShow(user.id, bookingId);
  }
}
