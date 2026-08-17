import 'reflect-metadata';
import '../ai-eval/env';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { TutorResponseSchema, WritingCorrectionResponseSchema } from '@deutschflow/types';
import { ClaudeProvider } from '../../src/modules/ai/providers/claude.provider';
import { AiProviderFactory } from '../../src/modules/ai/providers/ai-provider.factory';
import { AiObservabilityLogger } from '../../src/modules/ai/logging/ai-observability.logger';
import { AiService } from '../../src/modules/ai/services/ai.service';
import { PromptManager } from '../../src/modules/ai/prompts/prompt-manager.service';
import type { AiLearnerContext } from '../../src/modules/ai/context/ai-context.types';
import { EVAL_CASES } from './cases';
import { evaluateHeuristics, hasAnyRedFlag } from './heuristics';
import type { EvalResult } from './types';

/**
 * Reproducible AI evaluation suite runner (Phase 4.5, spec section 3).
 *
 * Same safety contract as ai-real-provider-test.ts: never in CI, exits
 * cleanly with no fabricated output when ANTHROPIC_API_KEY is missing.
 * Runs every case in cases.ts through the real, production AiService
 * pipeline, applies the mechanical heuristics from heuristics.ts, and
 * writes the raw results to docs/ai-evaluation/ for a human reviewer to
 * fill in the 0/1/2 quality scores from spec section 11.
 *
 * Run with: pnpm --filter @deutschflow/api ai:eval
 */

const CONTEXT_BY_LEVEL: Record<string, AiLearnerContext> = {};
function contextFor(level: string): AiLearnerContext {
  return (
    CONTEXT_BY_LEVEL[level] ??
    (CONTEXT_BY_LEVEL[level] = {
      userId: 'ai-eval-suite',
      currentLevel: level as AiLearnerContext['currentLevel'],
      targetLevel: null,
      learningGoal: null,
      currentSkill: null,
      currentLessonTitle: null,
      recentErrorCategories: [],
      weakSkills: [],
    })
  );
}

async function runCase(
  aiService: AiService,
  promptManager: PromptManager,
  evalCase: (typeof EVAL_CASES)[number],
): Promise<EvalResult> {
  const context = contextFor(evalCase.level);
  const startedAt = Date.now();

  try {
    const rawResponse =
      evalCase.feature === 'tutor'
        ? await aiService.complete({
            feature: 'tutor',
            systemPrompt: promptManager.buildTutorPrompt(context, 'advanced'),
            userMessage: evalCase.input,
            schema: TutorResponseSchema,
            schemaName: 'tutor_response',
            schemaDescription: 'Structured tutor reply with corrections and an optional suggested exercise.',
            maxOutputTokens: 800,
          })
        : await aiService.complete({
            feature: 'writing_correction',
            systemPrompt: promptManager.buildWritingCorrectionPrompt(context, 'advanced'),
            userMessage: evalCase.input,
            schema: WritingCorrectionResponseSchema,
            schemaName: 'writing_correction_result',
            schemaDescription: 'Structured correction of a German writing submission.',
            maxOutputTokens: 800,
          });

    return {
      case: evalCase,
      ok: true,
      failed: false,
      errorMessage: null,
      latencyMs: Date.now() - startedAt,
      rawResponse,
      heuristics: evaluateHeuristics(evalCase, rawResponse),
    };
  } catch (error) {
    return {
      case: evalCase,
      ok: false,
      failed: true,
      errorMessage: error instanceof Error ? error.message : 'unknown_error',
      latencyMs: Date.now() - startedAt,
      rawResponse: null,
      heuristics: null,
    };
  }
}

async function main(): Promise<void> {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.log(
      `[ai-eval] ANTHROPIC_API_KEY is not set. Aborting cleanly — none of the ${EVAL_CASES.length} ` +
        'evaluation cases were run and no results were fabricated. Set ANTHROPIC_API_KEY as a ' +
        'local server-only env var to run the real evaluation.',
    );
    process.exitCode = 0;
    return;
  }

  console.log(
    `[ai-eval] ANTHROPIC_API_KEY found. Running ${EVAL_CASES.length} cases against ` +
      `${process.env.AI_PROVIDER ?? 'claude'} through the production AiService pipeline...\n`,
  );

  const provider = new ClaudeProvider();
  const factory = new AiProviderFactory(provider);
  const observability = new AiObservabilityLogger();
  const aiService = new AiService(factory, observability);
  const promptManager = new PromptManager();

  const results: EvalResult[] = [];
  for (const evalCase of EVAL_CASES) {
    process.stdout.write(`  ${evalCase.id} (${evalCase.category}, ${evalCase.level})... `);
    const result = await runCase(aiService, promptManager, evalCase);
    results.push(result);

    if (!result.ok) {
      console.log(`ERROR: ${result.errorMessage}`);
    } else {
      const flagged = result.heuristics && hasAnyRedFlag(result.heuristics);
      console.log(`ok (${result.latencyMs}ms)${flagged ? ' — HEURISTIC FLAG RAISED' : ''}`);
    }
  }

  const outDir = join(__dirname, '../../../../docs/ai-evaluation');
  mkdirSync(outDir, { recursive: true });
  const outFile = join(outDir, 'phase-4.5-raw-results.json');
  writeFileSync(outFile, JSON.stringify(results, null, 2));

  const errorCount = results.filter((r) => !r.ok).length;
  const flaggedCount = results.filter((r) => r.heuristics && hasAnyRedFlag(r.heuristics)).length;

  console.log(`\n[ai-eval] Done. ${results.length} cases run, ${errorCount} errored, ${flaggedCount} flagged.`);
  console.log(`[ai-eval] Raw results written to ${outFile}`);
  console.log('[ai-eval] Human review still required to fill in the 0/1/2 quality scores (spec section 11).');
}

main().catch((error) => {
  console.error('[ai-eval] Unexpected script error:', error);
  process.exitCode = 1;
});
