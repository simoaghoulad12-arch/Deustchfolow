import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { configureApp } from './configure-app';

async function bootstrap(): Promise<void> {
  // rawBody: true preserves the exact request bytes on `req.rawBody`
  // alongside Nest's normal JSON parsing — needed because Stripe's
  // webhook signature is computed over the raw payload bytes, not the
  // re-serialized parsed object (see StripeWebhookController, Phase
  // 6.5). This does not disable JSON parsing for any other route.
  const app = await NestFactory.create(AppModule, { rawBody: true });

  configureApp(app);

  const port = process.env.PORT ?? 4000;
  await app.listen(port);
}

void bootstrap();
