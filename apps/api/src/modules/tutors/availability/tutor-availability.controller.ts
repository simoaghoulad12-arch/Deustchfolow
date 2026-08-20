import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Query } from '@nestjs/common';
import { UserRole, type AuthenticatedUser } from '@deutschflow/types';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { Roles } from '../../auth/decorators/roles.decorator';
import { TutorAvailabilityService } from './tutor-availability.service';
import { CreateAvailabilityRuleDto } from '../dto/create-availability-rule.dto';
import { CreateAvailabilityExceptionDto } from '../dto/create-availability-exception.dto';
import { QueryAvailabilityDto } from '../dto/query-availability.dto';

@Controller()
export class TutorAvailabilityController {
  constructor(private readonly availabilityService: TutorAvailabilityService) {}

  @Get('tutors/me/availability/rules')
  @Roles(UserRole.TUTOR)
  listOwnRules(@CurrentUser() user: AuthenticatedUser) {
    return this.availabilityService.listOwnRules(user.id);
  }

  @Post('tutors/me/availability/rules')
  @Roles(UserRole.TUTOR)
  createRule(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateAvailabilityRuleDto) {
    return this.availabilityService.createRule(user.id, dto);
  }

  @Delete('tutors/me/availability/rules/:ruleId')
  @Roles(UserRole.TUTOR)
  deleteRule(@CurrentUser() user: AuthenticatedUser, @Param('ruleId', ParseUUIDPipe) ruleId: string) {
    return this.availabilityService.deleteRule(user.id, ruleId);
  }

  @Get('tutors/me/availability/exceptions')
  @Roles(UserRole.TUTOR)
  listOwnExceptions(@CurrentUser() user: AuthenticatedUser) {
    return this.availabilityService.listOwnExceptions(user.id);
  }

  @Post('tutors/me/availability/exceptions')
  @Roles(UserRole.TUTOR)
  createException(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateAvailabilityExceptionDto) {
    return this.availabilityService.createException(user.id, dto);
  }

  @Delete('tutors/me/availability/exceptions/:exceptionId')
  @Roles(UserRole.TUTOR)
  deleteException(@CurrentUser() user: AuthenticatedUser, @Param('exceptionId', ParseUUIDPipe) exceptionId: string) {
    return this.availabilityService.deleteException(user.id, exceptionId);
  }

  /** Public — free/busy slots, not sensitive data (part of the booking flow). */
  @Get('tutors/:tutorId/availability')
  findFreeSlots(@Param('tutorId', ParseUUIDPipe) tutorId: string, @Query() query: QueryAvailabilityDto) {
    return this.availabilityService.findFreeSlots(tutorId, query);
  }
}
