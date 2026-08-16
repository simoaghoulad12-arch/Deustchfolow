export interface AppConfig {
  nodeEnv: string;
  port: number;
}

/**
 * Central application configuration factory, consumed by @nestjs/config.
 * Only foundation-level settings live here; module-specific config
 * (database, AI providers, payments, ...) is added alongside those modules.
 */
export default (): AppConfig => ({
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: parseInt(process.env.PORT ?? '4000', 10),
});
