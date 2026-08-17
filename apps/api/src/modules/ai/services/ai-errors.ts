/** The provider returned something that didn't match the required structured-output schema. */
export class AiValidationError extends Error {}

/** The provider call itself failed (network, auth, rate limit on the provider's side, ...). */
export class AiProviderError extends Error {}

/** The caller is over their configured usage limit for this AI feature. */
export class AiUsageLimitExceededError extends Error {}
