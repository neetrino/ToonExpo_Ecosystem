import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { API_V1_PREFIX } from "@toonexpo/contracts";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import { Logger } from "nestjs-pino";

import { AppModule } from "./app.module.js";
import {
  DEFAULT_API_PORT,
  NODE_ENV_PRODUCTION,
  SWAGGER_PATH,
} from "./common/constants/app.constants.js";
import { AllExceptionsFilter } from "./common/filters/all-exceptions.filter.js";
import type { AppEnv } from "./config/env.validation.js";

const GLOBAL_PREFIX = API_V1_PREFIX.replace(/^\//, "");

const bootstrap = async (): Promise<void> => {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const logger = app.get(Logger);
  app.useLogger(logger);

  const configService = app.get(ConfigService<AppEnv, true>);
  const port = configService.get("PORT", { infer: true }) ?? DEFAULT_API_PORT;
  const corsOrigins = configService.get("CORS_ORIGINS", { infer: true });
  const nodeEnv = configService.get("NODE_ENV", { infer: true });

  app.use(helmet());
  app.use(cookieParser());
  app.enableCors({
    origin: corsOrigins,
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
  app.useGlobalFilters(new AllExceptionsFilter());
  app.enableShutdownHooks();

  if (nodeEnv !== NODE_ENV_PRODUCTION) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle("ToonExpo API")
      .setDescription("ToonExpo Ecosystem REST API")
      .setVersion("0.0.0")
      .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup(`${GLOBAL_PREFIX}/${SWAGGER_PATH}`, app, document);
  }

  await app.listen(port);
  logger.log(`API listening on port ${port}`);
};

void bootstrap();
