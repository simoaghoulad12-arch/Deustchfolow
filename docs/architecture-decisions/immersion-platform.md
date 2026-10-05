# Immersion platform ("Learn a language. Live it.")

Status: implemented on `claude/ai-language-platform-jw9vic` (PR #5).

## Scope

A multi-language immersion product on top of the DeutschFlow monorepo:
German, English, Spanish, French and Italian at CEFR A1–B2. The learner
journey is Landing → Register → 6-step onboarding → adaptive placement →
personal plan → World (15 environments) → missions with AI characters and
natural corrections → XP, Language DNA and the next recommendation.

## Layout

| Area | Location |
| --- | --- |
| API module | `apps/api/src/modules/immersion` (routes under `/api/v1/live/*`) |
| Mock AI provider | `apps/api/src/modules/ai/providers/mock` |
| Content seed | `packages/database/prisma/content` (`pnpm --filter @deutschflow/database seed:content`) |
| Learner UI | `apps/web/app/(live)`, onboarding in `apps/web/app/(onboarding)` |
| Admin CMS | `apps/web/app/(staff)/admin` |
| Shared UI | `apps/web/components/live` |

## Decisions

1. **AI suggests, the learning engine decides.** The model writes character
   replies, corrections and feedback; XP, difficulty, proficiency, SRS
   intervals, mistake mastery and placement are pure functions
   (`adaptive/`, `vocabulary/srs.ts`, `placement/placement-engine.ts`,
   `errors/mistake-key.ts`, `plan/learning-plan.ts`) with unit tests. A model
   can never award XP or change a level directly.
2. **Works without an API key.** `MockAiProvider` is selected when no real
   provider is configured. It reads the same `<context>` JSON block the real
   provider receives, applies per-language correction rules and returns
   output that passes the same Zod schemas. `ImmersionAiService` also falls
   back to the mock when a real call fails or returns invalid output, so the
   UI never shows a raw AI error.
3. **Keys stay on the server.** The browser only talks to Next.js server
   actions; those call Nest with a 60-second service JWT. Provider keys
   live only in the API environment.
4. **Corrections are rationed.** The adaptive difficulty profile decides how
   often a turn may carry a correction, so conversation comes first.
5. **XP is claimed atomically.** Each reward is guarded by a conditional
   `updateMany`, so double submits cannot pay twice. Practice XP is capped at
   three full-value sessions per mode per day.
6. **Languages are data.** Languages, levels, missions, vocabulary and
   grammar are database rows; adding a language means seeding content and
   correction rules, not new code paths.
7. **Generic admin CMS.** `admin/admin-resources.ts` is a registry of
   editable resources (fields, columns, which role may edit). One controller
   and one generic form cover every resource. Content editors manage
   content; languages, feature flags, settings and user roles are admin-only.
   The CMS lives in its own route group so staff are not forced through
   learner onboarding.
8. **Answers never reach the browser.** `publicPayload` strips answers from
   exercises; grading happens on the server.

## Testing

- Unit: learning engine, SRS, placement, grader, error memory, plan, mock
  provider and correction rules.
- E2E (no database): every `/live` route rejects missing or forged tokens;
  students get 403 on the CMS; content editors get 403 on user management.
- Browser journeys at 390, 768, 1024 and 1440 px covering registration
  through the first café mission, plus every learner and admin page.

## Before production

- Wire a real email provider in `apps/web/lib/email/email-service.ts`;
  registration refuses to run in production without one.
- Set `ANTHROPIC_API_KEY` to replace the mock with real conversations.
- Do not run the demo seed (`seed-demo.ts`) in production.
