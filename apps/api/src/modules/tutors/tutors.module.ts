import { Module } from '@nestjs/common';
import { TutorProfilesController } from './profiles/tutor-profiles.controller';
import { TutorProfilesService } from './profiles/tutor-profiles.service';
import { OfferingsController } from './offerings/offerings.controller';
import { OfferingsService } from './offerings/offerings.service';
import { TutorAvailabilityController } from './availability/tutor-availability.controller';
import { TutorAvailabilityService } from './availability/tutor-availability.service';
import { TutorVerificationController } from './verification/tutor-verification.controller';
import { TutorVerificationService } from './verification/tutor-verification.service';
import { LocalDocumentStorageProvider } from './verification/document-storage.service';

/**
 * Tutor Marketplace domain: profiles, offerings, availability, and
 * verification. Deliberately one module, not one-per-submodule — these
 * all revolve around a single TutorProfile aggregate root and share the
 * same ownership model (see architecture decision record).
 */
@Module({
  controllers: [
    TutorProfilesController,
    OfferingsController,
    TutorAvailabilityController,
    TutorVerificationController,
  ],
  providers: [
    TutorProfilesService,
    OfferingsService,
    TutorAvailabilityService,
    TutorVerificationService,
    LocalDocumentStorageProvider,
  ],
  exports: [TutorProfilesService, OfferingsService, TutorAvailabilityService, TutorVerificationService],
})
export class TutorsModule {}
