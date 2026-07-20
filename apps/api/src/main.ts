import './instrument.js';

import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { API_V1_PREFIX } from '@toonexpo/contracts';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { Logger as PinoLogger } from 'nestjs-pino';

import { AppModule } from './app.module.js';
import {
  DEFAULT_API_PORT,
  NODE_ENV_PRODUCTION,
  SWAGGER_PATH,
  TRUST_PROXY_HOPS,
} from './common/constants/app.constants.js';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter.js';
import type { AppEnv } from './config/env.validation.js';

const GLOBAL_PREFIX = API_V1_PREFIX.replace(/^\//, '');

const logDevStartupSummary = (port: number): void => {
  // Local UX (GymHub-style): plain success lines, not Nest context spam.
  console.log(`✓ ToonExpo API started successfully → http://localhost:${port}/${GLOBAL_PREFIX}`);
  console.log(`  Swagger → http://localhost:${port}/${GLOBAL_PREFIX}/${SWAGGER_PATH}`);
};

const bootstrap = async (): Promise<void> => {
  // Keep Nest/ANSI colors in local terminals (Cursor/Windows often strip otherwise).
  if (process.env['NODE_ENV'] !== NODE_ENV_PRODUCTION) {
    process.env['FORCE_COLOR'] ??= '1';
  }

  const isProductionBoot = process.env['NODE_ENV'] === NODE_ENV_PRODUCTION;
  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
    isProductionBoot ? { bufferLogs: true } : undefined,
  );

  const configService = app.get(ConfigService<AppEnv, true>);
  const port = configService.get('PORT', { infer: true }) ?? DEFAULT_API_PORT;
  const nodeEnv = configService.get('NODE_ENV', { infer: true });
  const isProduction = nodeEnv === NODE_ENV_PRODUCTION;

  // Production: structured Pino. Local: default Nest ConsoleLogger (full boot + routes).
  if (isProduction) {
    app.useLogger(app.get(PinoLogger));
  }

  // Cloud Run sits behind Google's HTTPS load balancer, which sets
  // X-Forwarded-For. Trust only the first hop so req.ip is the client IP
  // (Nest throttler and controllers use req.ip consistently).
  app.set('trust proxy', TRUST_PROXY_HOPS);

  app.use(helmet());
  app.use(cookieParser());
  app.enableCors({
    origin: configService.get('CORS_ORIGINS', { infer: true }),
    credentials: true,
  });
  app.setGlobalPrefix(GLOBAL_PREFIX);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.useGlobalFilters(app.get(AllExceptionsFilter));
  app.enableShutdownHooks();

  if (!isProduction) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('ToonExpo API')
      .setDescription('ToonExpo Ecosystem REST API')
      .setVersion('0.0.0')
      .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup(`${GLOBAL_PREFIX}/${SWAGGER_PATH}`, app, document);
  }

  await app.listen(port);

  if (isProduction) {
    app.get(PinoLogger).log(`API listening on port ${port}`);
  } else {
    logDevStartupSummary(port);
  }
};

void bootstrap();
