import { Body, Controller, Get, Patch, Post } from '@nestjs/common';
import type { AuthenticatedUser } from '@deutschflow/types';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { Public } from '../../auth/decorators/public.decorator';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { LearnerService } from './learner.service';
import { HomeService } from './home.service';
import {
  OnboardingSchema,
  ProfileUpdateSchema,
  type OnboardingInput,
  type ProfileUpdateInput,
} from './learner.schemas';

@Controller('live')
export class LearnerController {
  constructor(
    private readonly learner: LearnerService,
    private readonly homeService: HomeService,
  ) {}

  /** Public: the landing page and onboarding list learnable languages before login. */
  @Public()
  @Get('languages')
  languages() {
    return this.learner.languages();
  }

  @Get('me')
  me(@CurrentUser() user: AuthenticatedUser) {
    return this.learner.me(user.id);
  }

  @Patch('me')
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Body(new ZodValidationPipe(ProfileUpdateSchema)) body: ProfileUpdateInput,
  ) {
    return this.learner.updateProfile(user.id, body);
  }

  @Post('onboarding')
  onboarding(
    @CurrentUser() user: AuthenticatedUser,
    @Body(new ZodValidationPipe(OnboardingSchema)) body: OnboardingInput,
  ) {
    return this.learner.completeOnboarding(user.id, body);
  }

  @Get('home')
  home(@CurrentUser() user: AuthenticatedUser) {
    return this.homeService.home(user.id);
  }
}
