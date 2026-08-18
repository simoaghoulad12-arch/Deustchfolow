# Privacy / GDPR Technical Readiness

Status: **PASS WITH RISK**. This is a technical readiness assessment only —
no legal advice is simulated here, per the phase's own instruction.
Whether this is *legally* sufficient for GDPR compliance is a question
for actual legal review, not this document.

## Fixed this phase

**CRITICAL: account deletion didn't propagate to the public tutor
marketplace.** `TutorProfilesService.findMarketplace`/`findPublicProfile`
filtered only on `TutorProfile.isActive`, never on `user.deletedAt` — a
tutor who "deleted their account" (soft-delete) remained fully listed and
individually fetchable on the public marketplace (name, avatar, headline,
offerings, reviews) indefinitely. This was a genuine erasure-request
compliance gap, not just an internal-data issue. Fixed: both queries now
also filter on `user.deletedAt IS NULL`.

## Account deletion — current behavior

- Deletion is **soft-delete only**, by explicit prior design
  (`delete-account.ts` comment: hard-delete/anonymization is "a later,
  explicitly deferred extension"). `deletedAt` correctly cuts off login,
  session validation, password reset, and the authenticated `me` lookup.
- **What still doesn't happen:** no anonymization. Email, password hash,
  display name, and avatar URL remain fully intact and queryable by
  admins/internal code indefinitely after "deletion."
- **Consequence:** `User.email` is `@unique` with no carve-out for
  soft-deleted rows — once a user "deletes" their account, that email
  address can never be reused for re-registration, because the row is
  never anonymized or released. A genuine, user-visible gap between what
  "delete my account" implies and what actually happens.
- Reviews authored by a soft-deleted student still show that student's
  `displayName`/`avatarUrl` (`REVIEW_INCLUDE` doesn't check `deletedAt`)
  — the same underlying pattern as the marketplace bug above, but lower
  severity (a review is a historical record, and many platforms
  deliberately keep attribution on past reviews after account deletion —
  this is closer to a product decision than a clear bug, so it's
  documented rather than changed unilaterally).

**Recommendation before a real "right to erasure" claim needs to be
honored:** decide and build an actual anonymization job (retain the
financial/audit trail required by `Payment`/`Refund`/`TutorPayout`'s
`Restrict` cascade protection, but null out/replace PII on the `User`
and `UserProfile` rows). Out of scope to build inside this quality gate.

## Data minimization

- **AI context:** confirmed minimal — CEFR levels, learning goal, weak
  skills, and error *categories* only; never raw submission text, email,
  or name sent to Claude.
- **Payment metadata:** Stripe `Customer`/`PaymentIntent` metadata carries
  only internal ids (`userId`, `bookingId`) — no excess PII sent to
  Stripe.
- **Logs:** every production `Logger`/`console` call site was checked
  (21 total, excluding tests) — all structured, ID-only event logs. No
  email addresses, full user objects, or AI prompt/response content found
  in any production log path.
- **Retention:** AI conversation transcripts (`ConversationMessage
  .content`) and writing submissions are retained indefinitely — no TTL,
  no cleanup job exists anywhere in the codebase. Reporting the absence,
  not inventing a policy; a retention period is a product/legal decision.
- **Documentation drift found:** `StripeWebhookEvent.payload`'s schema
  comment claims the raw payload is "retained only for a short window per
  the data-minimization note," but no purge job exists in code to enforce
  that — the comment overstates actual behavior. Should be corrected to
  either state the real (indefinite) retention or have the purge job
  actually built; neither was done unilaterally in this pass since it's
  a genuine policy decision, not a bug fix.

## Consent architecture

**Absent.** No consent-tracking exists anywhere in the codebase — no
cookie-consent banner, no ToS-acceptance timestamp on `User`, no
marketing-opt-in flag. Reporting this as found, not as a bug to fix; this
needs a product/legal decision on what's actually required before any
public launch in a jurisdiction where it matters.

## Document storage

- Tutor verification documents (CVs, certificates) are private, never
  publicly accessible without authorization — every read is
  ownership/role-checked.
- **Fixed this phase:** upload MIME-type validation was client-claimed-
  string only, with no verification the actual bytes matched. Real
  magic-byte signature verification was added.
