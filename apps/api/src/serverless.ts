import type { IncomingMessage, ServerResponse } from 'node:http';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { configureApp } from './configure-app';

/**
 * Serverless entry (Vercel). The Nest app is created once per warm
 * instance and reused, so only a cold start pays the bootstrap cost.
 * The long-running server in `main.ts` stays the default for Docker.
 */
type Handler = (req: IncomingMessage, res: ServerResponse) => void;

let handler: Promise<Handler> | undefined;

async function createHandler(): Promise<Handler> {
  // Prisma only reads DIRECT_DATABASE_URL for migrations; hosted Postgres
  // integrations name the unpooled URL differently, so fall back rather
  // than fail on a missing variable.
  process.env.DIRECT_DATABASE_URL ??= process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL;
  const app = await NestFactory.create(AppModule, { rawBody: true });
  configureApp(app);
  await app.init();
  return app.getHttpAdapter().getInstance() as Handler;
}

export default async function serverless(req: IncomingMessage, res: ServerResponse): Promise<void> {
  handler ??= createHandler().catch((err: unknown) => {
    handler = undefined;
    throw err;
  });
  (await handler)(req, res);
}
