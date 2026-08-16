// Dummy, non-secret values so requireEnv() doesn't throw in tests that
// touch modules reading these — never real secrets.
process.env.SERVICE_TOKEN_SECRET ??= 'test-only-service-token-secret';
process.env.APP_URL ??= 'http://localhost:3000';
process.env.NEST_API_URL ??= 'http://localhost:4000/api/v1';
