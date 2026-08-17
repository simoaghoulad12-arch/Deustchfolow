import { ForbiddenException } from '@nestjs/common';

/** The provider returned something that didn't match the required structured-output schema. */
export class AiValidationError extends Error {}

/** The provider call itself failed (network, auth, rate limit on the provider's side, ...). */
export class AiProviderError extends Error {}

/**
 * The caller is over their configured usage limit for this AI feature.
 * Extends ForbiddenException (not a plain Error) so it surfaces to the
 * client as a clean 403 with a real message — a plain Error here would
 * fall through Nest's default exception filter as an opaque 500, hiding
 * the actual reason from the caller (found via manual verification, see
 * spec section 31).
 */
export class AiUsageLimitExceededError extends ForbiddenException {}
