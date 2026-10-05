import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { AiModule } from '../ai/ai.module';
import { MockAiProvider } from '../ai/providers/mock/mock-ai.provider';
import { ImmersionAiService } from './ai/immersion-ai.service';
import { ImmersionContextService } from './context/immersion-context.service';
import { GamificationService } from './gamification/gamification.service';
import { DnaService } from './dna/dna.service';
import { ErrorMemoryService } from './errors/error-memory.service';
import { MissionService } from './missions/mission.service';
import { ConversationService } from './missions/conversation.service';
import { MissionsController } from './missions/missions.controller';
import { LearnerService } from './learner/learner.service';
import { HomeService } from './learner/home.service';
import { LearnerController } from './learner/learner.controller';
import { AssessmentService } from './practice/assessment.service';
import { CoachService } from './coach/coach.service';
import { CoachController } from './coach/coach.controller';

/**
 * Immersion platform ("Learn a language. Live it."): missions with AI
 * characters, natural correction, error memory, Language DNA, adaptive
 * difficulty, spaced repetition, grammar, practice modes, coach,
 * gamification and the content CMS. Depends on the AI layer only through
 * AiService/AiProviderFactory (provider-agnostic); every AI call has an
 * offline fallback (ImmersionAiService).
 */
@Module({
  imports: [AiModule, ThrottlerModule.forRoot([{ ttl: 60_000, limit: 30 }])],
  controllers: [LearnerController, MissionsController, CoachController],
  providers: [
    MockAiProvider,
    ImmersionAiService,
    ImmersionContextService,
    GamificationService,
    DnaService,
    ErrorMemoryService,
    MissionService,
    ConversationService,
    LearnerService,
    HomeService,
    AssessmentService,
    CoachService,
  ],
})
export class ImmersionModule {}
