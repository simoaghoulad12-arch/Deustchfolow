import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { EntitlementsModule } from '../entitlements/entitlements.module';
import { LearningModule } from '../learning/learning.module';
import { ClaudeProvider } from './providers/claude.provider';
import { AiProviderFactory } from './providers/ai-provider.factory';
import { AiObservabilityLogger } from './logging/ai-observability.logger';
import { AiContextBuilder } from './context/ai-context-builder.service';
import { PromptManager } from './prompts/prompt-manager.service';
import { AiUsageService } from './usage/ai-usage.service';
import { RecommendationService } from './recommendation/recommendation.service';
import { AiService } from './services/ai.service';
import { CorrectionService } from './services/correction.service';
import { ExerciseGenerationService } from './services/exercise-generation.service';
import { TutorService } from './services/tutor.service';
import { TutorController } from './controllers/tutor.controller';
import { WritingController } from './controllers/writing.controller';

/**
 * The AI layer. Depends on the Learning Engine (via ProgressService, for
 * "AI suggests, the Learning Engine decides") and Entitlements (via
 * EntitlementsService/canAccess) — the Learning Engine never depends
 * back on this module (spec section 30).
 */
@Module({
  imports: [
    EntitlementsModule,
    LearningModule,
    // Burst-abuse protection for AI endpoints only (see AiThrottlerGuard
    // for why tracking is by userId, not IP). 20 requests/minute is a
    // generous ceiling above any real usage pattern — the actual cost
    // control is AiUsageService's daily cap.
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 20 }]),
  ],
  controllers: [TutorController, WritingController],
  providers: [
    ClaudeProvider,
    AiProviderFactory,
    AiObservabilityLogger,
    AiContextBuilder,
    PromptManager,
    AiUsageService,
    RecommendationService,
    AiService,
    CorrectionService,
    ExerciseGenerationService,
    TutorService,
  ],
  exports: [RecommendationService],
})
export class AiModule {}
