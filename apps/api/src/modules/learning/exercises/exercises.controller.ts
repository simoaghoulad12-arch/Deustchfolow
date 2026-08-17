import { Body, Controller, Param, Post } from '@nestjs/common';
import type { AuthenticatedUser } from '@deutschflow/types';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { ExercisesService } from './exercises.service';
import { SubmitAttemptDto } from '../dto/submit-attempt.dto';

@Controller('exercises')
export class ExercisesController {
  constructor(private readonly exercisesService: ExercisesService) {}

  /**
   * Always graded against `@CurrentUser()` — a student can only ever
   * submit an attempt as themselves, there is no userId in the request
   * body to tamper with.
   */
  @Post(':exercise/attempts')
  submitAttempt(
    @Param('exercise') exerciseId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: SubmitAttemptDto,
  ) {
    return this.exercisesService.submitAttempt(user.id, exerciseId, dto);
  }
}
