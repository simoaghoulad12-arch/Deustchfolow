import 'reflect-metadata';
import './ai-eval/env';
import { TutorResponseSchema, WritingCorrectionResponseSchema } from '@deutschflow/types';
import { ClaudeProvider } from '../src/modules/ai/providers/claude.provider';
import { AiProviderFactory } from '../src/modules/ai/providers/ai-provider.factory';
import { AiObservabilityLogger } from '../src/modules/ai/logging/ai-observability.logger';
import { AiService } from '../src/modules/ai/services/ai.service';
import { PromptManager } from '../src/modules/ai/prompts/prompt-manager.service';
import type { AiLearnerContext } from '../src/modules/ai/context/ai-context.types';

/**
 * Manual, opt-in integration test against the REAL Claude provider.
 *
 * - Never runs in `pnpm test` / CI: not matched by Jest's testRegex, not
 *   invoked by any build/test script.
 * - Without ANTHROPIC_API_KEY: exits cleanly with no request made and no
 *   fabricated output (Phase 4.5 constraint — "ohne Key sauber abbrechen,
 *   keine Fake-Antwort").
 * - With a key: makes exactly two real requests (one tutor, one writing
 *   correction), runs them through the exact same AiService/PromptManager
 *   code paths production uses (so this proves the real, shipped
 *   pipeline works end-to-end), and prints the validated result plus
 *   latency/token usage (via AiObservabilityLogger's normal log output).
 *
 * Run with: pnpm --filter @deutschflow/api ai:real-test
 */

const FAKE_CONTEXT: AiLearnerContext = {
  userId: 'manual-integration-test',
  currentLevel: 'A2',
  targetLevel: 'B1',
  learningGoal: null,
  currentSkill: 'GRAMMAR',
  currentLessonTitle: null,
  recentErrorCategories: [],
  weakSkills: [],
};

async function main(): Promise<void> {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.log(
      '[ai-real-provider-test] ANTHROPIC_API_KEY is not set. Aborting cleanly — no request was ' +
        'made and no response was fabricated. Set ANTHROPIC_API_KEY as a local server-only env ' +
        'var (never in apps/web, never committed) to run this test for real.',
    );
    process.exitCode = 0;
    return;
  }

  console.log(
    `[ai-real-provider-test] ANTHROPIC_API_KEY found. Provider: ${process.env.AI_PROVIDER ?? 'claude'}. ` +
      'Making 2 real requests (tutor, writing correction) through the production AiService pipeline.',
  );

  const provider = new ClaudeProvider();
  const factory = new AiProviderFactory(provider);
  const observability = new AiObservabilityLogger();
  const aiService = new AiService(factory, observability);
  const promptManager = new PromptManager();

  let exitCode = 0;

  console.log('\n=== Tutor request ===');
  console.log('Input: "Ich bin gestern zu Schule gegangen."');
  try {
    const tutorResult = await aiService.complete({
      feature: 'tutor',
      systemPrompt: promptManager.buildTutorPrompt(FAKE_CONTEXT, 'basic'),
      userMessage: 'Ich bin gestern zu Schule gegangen.',
      schema: TutorResponseSchema,
      schemaName: 'tutor_response',
      schemaDescription: 'Structured tutor reply with corrections and an optional suggested exercise.',
      maxOutputTokens: 800,
    });
    console.log('Zod validation: OK (structured output matched TutorResponseSchema)');
    console.log(JSON.stringify(tutorResult, null, 2));
  } catch (error) {
    exitCode = 1;
    console.error('Tutor request FAILED:', error instanceof Error ? error.message : error);
  }

  console.log('\n=== Writing correction request ===');
  console.log(
    'Input: "Ich habe gestern meine Freund getroffen und wir haben über die Wetter gesprochen."',
  );
  try {
    const writingResult = await aiService.complete({
      feature: 'writing_correction',
      systemPrompt: promptManager.buildWritingCorrectionPrompt(FAKE_CONTEXT, 'basic'),
      userMessage:
        'Ich habe gestern meine Freund getroffen und wir haben über die Wetter gesprochen.',
      schema: WritingCorrectionResponseSchema,
      schemaName: 'writing_correction_result',
      schemaDescription: 'Structured correction of a German writing submission.',
      maxOutputTokens: 800,
    });
    console.log('Zod validation: OK (structured output matched WritingCorrectionResponseSchema)');
    console.log(JSON.stringify(writingResult, null, 2));
  } catch (error) {
    exitCode = 1;
    console.error('Writing correction request FAILED:', error instanceof Error ? error.message : error);
  }

  console.log(
    '\n[ai-real-provider-test] Done. See the "AI" logger lines above for latency and token usage.',
  );
  process.exitCode = exitCode;
}

main().catch((error) => {
  console.error('[ai-real-provider-test] Unexpected script error:', error);
  process.exitCode = 1;
});
