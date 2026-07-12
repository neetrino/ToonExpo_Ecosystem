import 'reflect-metadata';

import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { APP_NAME } from '@toonexpo/shared';
import { config as loadDotenv } from 'dotenv';
import { resolve } from 'node:path';
import pino from 'pino';

import { AppModule } from './app.module';
import { loadApiEnv } from './common/env';

const DEFAULT_API_PORT = 4000;

loadDotenv({ path: resolve(process.cwd(), '../../.env') });

async function bootstrap(): Promise<void> {
  const env = loadApiEnv();
  const logger = pino({ level: env.NODE_ENV === 'production' ? 'info' : 'debug' });

  const app = await NestFactory.create(AppModule, { logger: false });

  app.enableCors({
    origin: env.APP_URL,
    credentials: true,
  });

  const swaggerConfig = new DocumentBuilder()
    .setTitle(APP_NAME)
    .setDescription('ToonExpo Ecosystem API')
    .setVersion('0.1.0')
    .addApiKey(
      {
        type: 'apiKey',
        in: 'header',
        name: 'x-bos-api-key',
        description: 'Shared secret for BOS inbound integration (BOS_API_KEY)',
      },
      'bos-api-key',
    )
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document);

  const port = Number(new URL(env.API_URL).port || DEFAULT_API_PORT);
  await app.listen(port);
  logger.info({ port }, 'API listening');
}

void bootstrap();
