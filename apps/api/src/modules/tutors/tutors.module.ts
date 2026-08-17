import { Module } from '@nestjs/common';
import { TutorProfilesController } from './profiles/tutor-profiles.controller';
import { TutorProfilesService } from './profiles/tutor-profiles.service';
import { OfferingsController } from './offerings/offerings.controller';
import { OfferingsService } from './offerings/offerings.service';

/**
 * Tutor Marketplace domain: profiles, offerings, and (in later Phase 5
 * subphases, added to this same module) availability and verification.
 * Deliberately one module, not one-per-submodule — these all revolve
 * around a single TutorProfile aggregate root and share the same
 * ownership model (see architecture decision record).
 */
@Module({
  controllers: [TutorProfilesController, OfferingsController],
  providers: [TutorProfilesService, OfferingsService],
  exports: [TutorProfilesService, OfferingsService],
})
export class TutorsModule {}
