import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { UserRole, type AuthenticatedUser } from '@deutschflow/types';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { OwnershipGuard } from '../auth/guards/ownership.guard';
import { PrismaService } from '../../common/prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Every "me" endpoint below is scoped to `@CurrentUser()` — the id from
   * the verified service token — never a client-supplied id. There is no
   * parameter here for a client to tamper with (the strongest available
   * IDOR defense).
   */
  @Get('me')
  async me(@CurrentUser() user: AuthenticatedUser) {
    const dbUser = await this.prisma.client.user.findUnique({ where: { id: user.id } });
    if (!dbUser || dbUser.deletedAt) {
      throw new NotFoundException('User not found.');
    }
    return {
      id: dbUser.id,
      email: dbUser.email,
      role: dbUser.role,
      emailVerified: dbUser.emailVerified !== null,
    };
  }

  @Get('me/profile')
  async myProfile(@CurrentUser() user: AuthenticatedUser) {
    const profile = await this.prisma.client.userProfile.findUnique({
      where: { userId: user.id },
    });
    if (!profile) {
      throw new NotFoundException('Profile not found.');
    }
    return { displayName: profile.displayName, avatarUrl: profile.avatarUrl };
  }

  @Patch('me/profile')
  async updateMyProfile(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateProfileDto,
  ) {
    const updated = await this.prisma.client.userProfile.update({
      where: { userId: user.id },
      data: dto,
    });
    return { displayName: updated.displayName, avatarUrl: updated.avatarUrl };
  }

  /**
   * RolesGuard fixture: proves role-gating works end to end without
   * building an admin dashboard (explicitly out of scope for this phase).
   */
  @Get('admin/ping')
  @Roles(UserRole.ADMIN)
  adminPing() {
    return { ok: true };
  }

  /**
   * OwnershipGuard fixture for the one case where a :userId param is
   * unavoidable (e.g. future support tooling looking up a specific
   * user). Self, or ADMIN/SUPPORT for anyone — enforced by OwnershipGuard,
   * never by the client.
   */
  @Get(':userId/profile')
  @UseGuards(OwnershipGuard)
  async profileForUser(@Param('userId') userId: string) {
    const profile = await this.prisma.client.userProfile.findUnique({ where: { userId } });
    if (!profile) {
      throw new NotFoundException('Profile not found.');
    }
    return { displayName: profile.displayName, avatarUrl: profile.avatarUrl };
  }
}
