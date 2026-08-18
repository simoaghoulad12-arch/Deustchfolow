# AI — Production Readiness

Status: **PASS WITH RISK** (architecture/security) / **BLOCKED** (real
model-quality evaluation — unchanged since Phase 4.5).

## Confirmed clean

- **No secret leakage.** `ANTHROPIC_API_KEY` is read from env, passed only
  to the SDK constructor, never included in any response object or log
  line. `AiObservabilityLogger` is explicitly scoped to metadata only
  (provider/model/latency/token counts) — never message or response
  content.
- **No context leakage.** `AiContextBuilder` queries are all
  `where: { userId }`-scoped, `take`-limited, `select`-limited — no
  cross-user data, no excess internal ids sent to the model.
- **Primary prompt-injection defense holds.** The user's chat message is
  always a separate `user`-role turn in the Anthropic Messages API call,
  never string-concatenated into the system prompt; `SAFETY_INSTRUCTIONS`
  explicitly tells the model to treat all user-message content as data,
  not commands. Unit-tested.
- **No agentic/tool-execution injection surface.** The "tool" mechanism
  used here is Anthropic's structured-output forcing, not an
  agentic tool-execution loop — nothing lets a model response trigger
  further actions or privilege changes. Exercise grading is a server-side
  string comparison against a server-stored answer, never influenced by
  model output.
- **Fail-closed output validation at every layer.** Every provider
  response is Zod-validated before use; a validation failure never
  returns to the caller. Callers substitute an explicit, honestly-labeled
  fallback (`failed: true`) rather than ever presenting AI content as
  successful when it wasn't. No malformed/partial AI output is ever
  persisted or rendered — confirmed no `dangerouslySetInnerHTML` anywhere
  in `apps/web`, so even a schema-conformant-but-adversarial string can't
  execute as HTML.
- **Rate/cost limits are server-side.** Daily usage caps and per-plan
  input-length ceilings are resolved from `EntitlementsService`
  (`AI_USAGE_LIMITS[plan]`), never a client-supplied value. A separate
  burst-rate throttler (20 req/min, keyed by user id) backstops this.
- **Timeout/retry/abort are bounded and honest.** 30s default timeout, 2
  SDK-delegated retries, both env-overridable with a safe fallback on
  invalid input. A provider failure is always converted to a typed error
  and met with an explicit fallback — never a fabricated success.

## Fixed this phase

- **Prompt-injection surface via `learningGoal` (MEDIUM).** This field is
  user-controlled free text (settable via the learning-profile endpoint,
  `@MaxLength(500)`, no content sanitization) and was interpolated
  directly into the system prompt's "Kontext des Lernenden" section — a
  section the original `SAFETY_INSTRUCTIONS` text didn't explicitly cover
  (it named only "der Inhalt der Nutzernachricht", the chat message).
  Hardened: `SAFETY_INSTRUCTIONS` now explicitly extends the
  "treat as data, not instructions" rule to every free-text context
  field, and the interpolated value is visually/structurally quoted as a
  data marker. Real-model verification of resistance is still pending a
  real API key (see below) — this is defense-in-depth, not a claim of an
  unbreakable sandbox.

## Known, documented limitation — not fixed this phase

**Usage-cap check-then-record race (MEDIUM, already an accepted trade-off
before this audit).** `AiUsageService`'s daily quota enforcement does a
non-transactional count-then-create; N concurrent requests from the same
user can each pass the check before any of them records, allowing the
daily cap to be exceeded by up to N-1 calls. The service's own existing
code comment already documents this as an accepted trade-off for what's
explicitly a soft cost cap, not a hard security boundary — this audit
re-confirms the mechanism and its bound rather than treating it as a new
finding, and doesn't override that product decision unilaterally.

## Real-provider evaluation status

**Unchanged from Phase 4.5 — still BLOCKED.** No real `ANTHROPIC_API_KEY`
exists anywhere in this sandbox (shell environment, `.env` files —
checked again this phase). The entire real-model quality question
("does Claude produce high-quality German-learning responses, resist
prompt injection *in practice*, avoid over-correction?") remains
unverified. See [`AI_REAL_EVAL_RUNBOOK.md`](../../AI_REAL_EVAL_RUNBOOK.md)
for how to run the existing, tested, ready-to-go evaluation suite once a
key is available.
