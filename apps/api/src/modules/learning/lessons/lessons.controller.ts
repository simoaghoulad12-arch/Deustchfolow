import { Controller, Get, Param } from '@nestjs/common';
import type { AuthenticatedUser } from '@deutschflow/types';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { LessonsService } from './lessons.service';
import { ExercisesService } from '../exercises/exercises.service';

@Controller('lessons')
export class LessonsController {
  constructor(
    private readonly lessonsService: LessonsService,
    private readonly exercisesService: ExercisesService,
  ) {}

  @Get(':lesson')
  findOne(@Param('lesson') slug: string, @CurrentUser() user: AuthenticatedUser) {
    return this.lessonsService.findBySlug(slug, user.id);
  }

  @Get(':lesson/exercises')
  findExercises(@Param('lesson') slug: string) {
    return this.exercisesService.findByLessonSlug(slug);
  }
}
