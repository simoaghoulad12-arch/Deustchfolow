import { Body, Controller, Get, Param, Put, Query } from '@nestjs/common';
import { UserRole, type AuthenticatedUser } from '@deutschflow/types';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { Roles } from '../../auth/decorators/roles.decorator';
import { TutorProfilesService } from './tutor-profiles.service';
import { QueryTutorsDto } from '../dto/query-tutors.dto';
import { UpsertTutorProfileDto } from '../dto/upsert-tutor-profile.dto';

@Controller('tutors')
export class TutorProfilesController {
  constructor(private readonly tutorProfilesService: TutorProfilesService) {}

  @Get()
  findMarketplace(@Query() query: QueryTutorsDto) {
    return this.tutorProfilesService.findMarketplace(query);
  }

  /**
   * Scoped to `@CurrentUser()` — the id from the verified service token,
   * never a client-supplied id (the strongest available IDOR defense,
   * same convention as UsersController's "me" routes). `@Roles(TUTOR)`
   * means only a user whose role is already TUTOR (assigned outside this
   * phase's scope — see Phase 5 completion report) can have a profile.
   */
  @Get('me/profile')
  @Roles(UserRole.TUTOR)
  findOwnProfile(@CurrentUser() user: AuthenticatedUser) {
    return this.tutorProfilesService.findOwnProfile(user.id);
  }

  @Put('me/profile')
  @Roles(UserRole.TUTOR)
  upsertOwnProfile(@CurrentUser() user: AuthenticatedUser, @Body() dto: UpsertTutorProfileDto) {
    return this.tutorProfilesService.upsertOwnProfile(user.id, dto);
  }

  /**
   * Public marketplace detail — intentionally NOT ownership-guarded.
   * Reading another user's tutor profile is the entire point of a
   * marketplace; only the tutor's own private edit view (above) and
   * sensitive data (verification documents, later) are ownership-scoped.
   */
  @Get(':tutorId')
  findPublicProfile(@Param('tutorId') tutorId: string) {
    return this.tutorProfilesService.findPublicProfile(tutorId);
  }
}
