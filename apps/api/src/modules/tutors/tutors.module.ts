import { Module } from '@nestjs/common';
import { TutorProfilesController } from './profiles/tutor-profiles.controller';
import { TutorProfilesService } from './profiles/tutor-profiles.service';
import { OfferingsController } from './offerings/offerings.controller';
import { OfferingsService } from './offerings/offerings.service';
import { TutorAvailabilityController } from './availability/tutor-availability.controller';
import { TutorAvailabilityService } from './availability/tutor-availability.service';

/**
 * Tutor Marketplace domain: profiles, offerings, availability, and (in
 * later Phase 5 subphases, added to this same module) verification.
 * Deliberately one module, not one-per-submodule — these all revolve
 * around a single TutorProfile aggregate root and share the same
 * ownership model (see architecture decision record).
 */
@Module({
  controllers: [TutorProfilesController, OfferingsController, TutorAvailabilityController],
  providers: [TutorProfilesService, OfferingsService, TutorAvailabilityService],
  exports: [TutorProfilesService, OfferingsService, TutorAvailabilityService],
})
export class TutorsModule {}
