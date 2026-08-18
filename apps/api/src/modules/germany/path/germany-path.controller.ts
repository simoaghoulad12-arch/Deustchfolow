import { Body, Controller, Get, Patch, Put } from '@nestjs/common';
import type { AuthenticatedUser } from '@deutschflow/types';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { GermanyPathService } from './germany-path.service';
import { GermanyCoachService } from '../coach/germany-coach.service';
import { SetGermanyGoalDto } from '../dto/set-germany-goal.dto';
import { SetGermanyStepDto } from '../dto/set-germany-step.dto';

@Controller('germany')
export class GermanyPathController {
  constructor(
    private readonly pathService: GermanyPathService,
    private readonly coachService: GermanyCoachService,
  ) {}

  @Get('my-path')
  getMyPath(@CurrentUser() user: AuthenticatedUser) {
    return this.coachService.getMyPathOverview(user.id);
  }

  @Put('my-path/goal')
  setGoal(@CurrentUser() user: AuthenticatedUser, @Body() dto: SetGermanyGoalDto) {
    return this.pathService.setGoal(user.id, dto);
  }

  @Patch('my-path/step')
  setStep(@CurrentUser() user: AuthenticatedUser, @Body() dto: SetGermanyStepDto) {
    return this.pathService.setStep(user.id, dto);
  }
}
