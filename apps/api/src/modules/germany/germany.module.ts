import { Module } from '@nestjs/common';
import { GermanyPathController } from './path/germany-path.controller';
import { GermanyPathService } from './path/germany-path.service';
import { GermanySourceController } from './sources/germany-source.controller';
import { GermanySourceService } from './sources/germany-source.service';
import { DocumentChecklistController } from './documents/document-checklist.controller';
import { DocumentChecklistService } from './documents/document-checklist.service';
import { GermanyCoachService } from './coach/germany-coach.service';

/**
 * Germany Coach Foundation (spec section 10): path, sources, and
 * document checklist are separate services with a single orchestrator
 * (GermanyCoachService) composing the `/germany/my-path` read model.
 * Not yet a comprehensive legal database — clean architecture first,
 * real content sourced from OfficialSource rows in a later phase.
 */
@Module({
  controllers: [GermanyPathController, GermanySourceController, DocumentChecklistController],
  providers: [GermanyPathService, GermanySourceService, DocumentChecklistService, GermanyCoachService],
  exports: [GermanyPathService, GermanySourceService, DocumentChecklistService, GermanyCoachService],
})
export class GermanyModule {}
