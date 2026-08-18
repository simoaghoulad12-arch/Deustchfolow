import { Injectable } from '@nestjs/common';
import { GermanyPathStep, OfficialSourceTopic, type GermanyPathStep as GermanyPathStepType } from '@deutschflow/types';
import { GermanyPathService } from '../path/germany-path.service';
import { GermanySourceService } from '../sources/germany-source.service';
import { DocumentChecklistService } from '../documents/document-checklist.service';

/**
 * UI-navigation hints only — which OfficialSource topic is most relevant
 * to surface for a given path step. Never a claim about what's legally
 * required (spec section 13); just picks which category of already-
 * vetted, admin-curated sources to show next to "dein nächster Schritt".
 */
const STEP_TOPIC_HINTS: Partial<Record<GermanyPathStepType, OfficialSourceTopic>> = {
  [GermanyPathStep.GERMAN_LEVEL]: OfficialSourceTopic.LANGUAGE,
  [GermanyPathStep.QUALIFICATION_CHECK]: OfficialSourceTopic.RECOGNITION_OF_QUALIFICATIONS,
  [GermanyPathStep.JOB_OR_APPRENTICESHIP]: OfficialSourceTopic.JOB_SEARCH,
  [GermanyPathStep.VISA_RESIDENCE_CHECK]: OfficialSourceTopic.VISA,
  [GermanyPathStep.GERMANY_EVERYDAY_LIFE]: OfficialSourceTopic.HOUSING,
};

/**
 * Orchestrator for the `/germany/my-path` dashboard — composes the read
 * models from GermanyPathService/GermanySourceService/
 * DocumentChecklistService into one view. Holds no state and no
 * business rules of its own; every fact it returns is delegated.
 */
@Injectable()
export class GermanyCoachService {
  constructor(
    private readonly pathService: GermanyPathService,
    private readonly sourceService: GermanySourceService,
    private readonly documentService: DocumentChecklistService,
  ) {}

  async getMyPathOverview(userId: string) {
    const path = await this.pathService.getOwnPath(userId);
    const documents = await this.documentService.listOwn(userId);

    if (!path) {
      return { path: null, relevantSources: [], documents };
    }

    const relevantTopic = STEP_TOPIC_HINTS[path.currentStep];
    const relevantSources = relevantTopic
      ? await this.sourceService.listActive({ topic: relevantTopic })
      : [];

    return { path, relevantSources, documents };
  }
}
