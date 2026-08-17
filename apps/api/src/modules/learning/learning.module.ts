import { Module } from '@nestjs/common';
import { LearningProfileController } from './learning-profile.controller';
import { LevelsController } from './levels/levels.controller';
import { LevelsService } from './levels/levels.service';
import { CoursesController } from './courses/courses.controller';
import { CoursesService } from './courses/courses.service';
import { LessonsController } from './lessons/lessons.controller';
import { LessonsService } from './lessons/lessons.service';
import { ExercisesController } from './exercises/exercises.controller';
import { ExercisesService } from './exercises/exercises.service';
import { ProgressController } from './progress/progress.controller';
import { ProgressService } from './progress/progress.service';
import { VocabularyService } from './vocabulary/vocabulary.service';

/**
 * Owns LearningProfile and the Learning Engine (Level -> Course -> Module
 * -> Lesson -> Exercise). No microservice split — everything stays in
 * this one NestJS service (see architecture decision record, section 16).
 * The full A1–C1 curriculum content itself is a separate, later content
 * project — this module is the engine, not the curriculum.
 */
@Module({
  controllers: [
    LearningProfileController,
    LevelsController,
    CoursesController,
    LessonsController,
    ExercisesController,
    ProgressController,
  ],
  providers: [
    LevelsService,
    CoursesService,
    LessonsService,
    ExercisesService,
    ProgressService,
    VocabularyService,
  ],
  // ProgressService is the only path the AI module (or anything else) is
  // allowed to update progress through — see AiModule / exercise-
  // generation.service.ts and architecture decision record section 1.
  exports: [ProgressService],
})
export class LearningModule {}
