import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { UserRole, type AuthenticatedUser } from '@deutschflow/types';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { Roles } from '../../auth/decorators/roles.decorator';
import { OfferingsService } from './offerings.service';
import { CreateOfferingDto } from '../dto/create-offering.dto';
import { UpdateOfferingDto } from '../dto/update-offering.dto';

@Controller()
export class OfferingsController {
  constructor(private readonly offeringsService: OfferingsService) {}

  @Get('tutors/me/offerings')
  @Roles(UserRole.TUTOR)
  findOwn(@CurrentUser() user: AuthenticatedUser) {
    return this.offeringsService.findOwn(user.id);
  }

  @Post('tutors/me/offerings')
  @Roles(UserRole.TUTOR)
  create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateOfferingDto) {
    return this.offeringsService.create(user.id, dto);
  }

  @Patch('tutors/me/offerings/:offeringId')
  @Roles(UserRole.TUTOR)
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('offeringId') offeringId: string,
    @Body() dto: UpdateOfferingDto,
  ) {
    return this.offeringsService.update(user.id, offeringId, dto);
  }

  /** Public — part of the tutor's marketplace profile, not sensitive data. */
  @Get('tutors/:tutorId/offerings')
  findActiveForTutor(@Param('tutorId') tutorId: string) {
    return this.offeringsService.findActiveForTutor(tutorId);
  }
}
