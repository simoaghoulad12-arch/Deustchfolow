import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { UserRole, type AuthenticatedUser } from '@deutschflow/types';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { AdminModerateReviewDto } from './dto/admin-moderate-review.dto';
import { ReviewsThrottlerGuard } from './guards/reviews-throttler.guard';

/** Every route here is burst-abuse-throttled (see ReviewsThrottlerGuard
 * and this module's ThrottlerModule.forRoot config) — Phase 6.5 audit
 * finding: review creation had no rate limiting at all. */
@UseGuards(ReviewsThrottlerGuard)
@Controller()
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post('bookings/:bookingId/review')
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Param('bookingId') bookingId: string,
    @Body() dto: CreateReviewDto,
  ) {
    return this.reviewsService.create(user.id, bookingId, dto);
  }

  /** Public — part of the tutor's marketplace profile. */
  @Get('tutors/:tutorId/reviews')
  findVisibleForTutor(@Param('tutorId') tutorId: string) {
    return this.reviewsService.findVisibleForTutor(tutorId);
  }

  /** Content moderation — hide/unhide a review (spec section 18). */
  @Patch('tutors/admin/reviews/:reviewId')
  @Roles(UserRole.ADMIN)
  adminModerate(@Param('reviewId') reviewId: string, @Body() dto: AdminModerateReviewDto) {
    return this.reviewsService.adminSetHidden(reviewId, dto.isHidden);
  }
}
