import { Module } from '@nestjs/common';
import { LearningProfileController } from './learning-profile.controller';

/**
 * Owns LearningProfile (see architecture decision record, section 5).
 * The full A1–C1 curriculum is a later phase — this module currently
 * only exposes the learner's own profile fields.
 */
@Module({
  controllers: [LearningProfileController],
})
export class LearningModule {}
