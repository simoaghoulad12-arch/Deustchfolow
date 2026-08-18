import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  // rawBody: true preserves the exact request bytes on `req.rawBody`
  // alongside Nest's normal JSON parsing — needed because Stripe's
  // webhook signature is computed over the raw payload bytes, not the
  // re-serialized parsed object (see StripeWebhookController, Phase
  // 6.5). This does not disable JSON parsing for any other route.
  const app = await NestFactory.create(AppModule, { rawBody: true });

  app.setGlobalPrefix('api/v1');

  // whitelist + forbidNonWhitelisted: any field not declared on a DTO is
  // rejected outright, not silently stripped — the mass-assignment
  // defense (see architecture decision record, section 8).
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = process.env.PORT ?? 4000;
  await app.listen(port);
}

void bootstrap();
