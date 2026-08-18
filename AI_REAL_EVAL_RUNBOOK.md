# AI Real Evaluation — Runbook

Status as of Phase 6.5: **BLOCKED — no real `ANTHROPIC_API_KEY` available
in the development sandbox.** This runbook is what a human runs once a
real key is available; nothing here has been executed with real model
responses, and nothing in this repo claims otherwise.

## What this verifies

Whether Claude, called through this codebase's actual production code
path (not a simplified test harness), produces high-quality German-
learning responses: correct error detection, appropriately pitched
explanations per CEFR level, resistance to prompt injection *in practice*
(not just structurally, per `docs/production-readiness/ai.md`), and
sensible exercise generation.

## Prerequisites

- A real Anthropic API key with available quota. **Never commit it, never
  paste it into a shared chat, never log it.**
- The monorepo installed (`pnpm install` at the repo root).

## Environment variables (names only — see
`docs/production-readiness/environment.md` for the full matrix)

| Variable | Required | Notes |
|---|---|---|
| `ANTHROPIC_API_KEY` | Yes | Set as a local, server-only env var — never in a file that could be committed. |
| `ANTHROPIC_MODEL` | No | Overrides the default model if set. |
| `ANTHROPIC_TIMEOUT_MS`, `ANTHROPIC_MAX_RETRIES` | No | Override provider timeout/retry defaults. |

Set it as a real shell export or in `apps/api/.env` (already `.gitignore`d
— confirm before running that this file is not tracked by git).

## Commands

Two separate scripts, run from the repo root:

1. **Real-provider smoke test** — a single real call, confirms the whole
   pipeline (provider → schema validation → observability logging) works
   end-to-end with a live key before running the full paid evaluation:
   ```
   pnpm --filter @deutschflow/api ai:real-test
   ```

2. **Full evaluation suite** — 26 cases across GRAMMAR, WRITING,
   AMBIGUOUS_LANGUAGE, FALSE_CORRECTION, PROMPT_INJECTION,
   LEVEL_APPROPRIATENESS, and EXERCISE_GENERATION categories, defined in
   `apps/api/scripts/ai-eval/cases.ts`:
   ```
   pnpm --filter @deutschflow/api ai:eval
   ```
   This runs every case against the real production code path
   (`AiService`, `PromptManager`, the real Zod response schemas — no
   simplified test-only path), applies the mechanical heuristics in
   `apps/api/scripts/ai-eval/heuristics.ts` (already unit-tested,
   network-free), and writes raw responses to
   `docs/ai-evaluation/phase-4.5-raw-results.json` (already `.gitignore`d
   — only a curated, human-written report should ever be committed).

## What "done" looks like

- Exit code `0` from both commands, with no `ANTHROPIC_API_KEY is not
  set` abort message (that message means it didn't actually run).
- The raw results JSON has 26 entries.
- A human reviews every case against the 0/1/2 rubric already defined in
  `docs/ai-evaluation/phase-4.5-report.md` and writes the real Sections
  2/3 of that report — the mechanical heuristics catch some things (over-
  correction, missing corrections, malformed output) but the actual
  pedagogical quality judgment needs a human reviewer.

## Security controls already in place (nothing new needed here)

- The key is read only via `process.env.ANTHROPIC_API_KEY` inside
  `ClaudeProvider` — never sent to the client, never logged (grep-
  verified: `AiObservabilityLogger` logs metadata only).
- A malformed/unexpected model response fails closed (Zod validation) —
  the eval script will record it as a failure, not a fabricated pass.
- Cost control: `AiUsageService`'s daily caps are bypassed for this
  script (it calls the provider directly), so 26 real Claude calls will
  actually be made and billed — budget for that before running.

## If something goes wrong

- **Timeout/rate-limit from Anthropic:** the provider already has
  bounded retry (2 attempts, SDK-delegated) and a 30s timeout — a
  persistent failure after that is a real issue (quota, network, API
  status), not something to retry indefinitely.
- **A case fails the heuristic check:** that's the evaluation working as
  intended — record it, don't discard it, don't re-run until it happens
  to pass.
