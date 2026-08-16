import { Controller, Get, Patch, Body, NotFoundException } from '@nestjs/common';
import type { AuthenticatedUser } from '@deutschflow/types';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { PrismaService } from '../../common/prisma/prisma.service';
import { UpdateLearningProfileDto } from './dto/update-learning-profile.dto';

@Controller('users/me/learning-profile')
export class LearningProfileController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async myLearningProfile(@CurrentUser() user: AuthenticatedUser) {
    const profile = await this.prisma.client.learningProfile.findUnique({
      where: { userId: user.id },
    });
    if (!profile) {
      throw new NotFoundException('Learning profile not found.');
    }
    return {
      nativeLanguage: profile.nativeLanguage,
      explanationLanguage: profile.explanationLanguage,
      timezone: profile.timezone,
      learningGoal: profile.learningGoal,
      currentLevel: profile.currentLevel,
      targetLevel: profile.targetLevel,
    };
  }

  @Patch()
  async updateMyLearningProfile(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateLearningProfileDto,
  ) {
    const updated = await this.prisma.client.learningProfile.update({
      where: { userId: user.id },
      data: dto,
    });
    return {
      nativeLanguage: updated.nativeLanguage,
      explanationLanguage: updated.explanationLanguage,
      timezone: updated.timezone,
      learningGoal: updated.learningGoal,
      currentLevel: updated.currentLevel,
      targetLevel: updated.targetLevel,
    };
  }
}
