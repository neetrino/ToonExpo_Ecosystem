import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { LoggerModule } from "nestjs-pino";

import { AuthModule } from "./auth/auth.module.js";
import { CsrfOriginGuard } from "./auth/guards/csrf-origin.guard.js";
import { CsrfTokenGuard } from "./auth/guards/csrf-token.guard.js";
import { RolesGuard } from "./auth/guards/roles.guard.js";
import { SessionAuthGuard } from "./auth/guards/session-auth.guard.js";
import {
  AUTH_RATE_LIMIT_LIMIT,
  AUTH_RATE_LIMIT_TTL_MS,
  NODE_ENV_PRODUCTION,
} from "./common/constants/app.constants.js";
import { resolveEnvFilePaths } from "./config/env-files.js";
import { validateEnv } from "./config/env.validation.js";
import { HealthModule } from "./health/health.module.js";
import { PrismaModule } from "./prisma/prisma.module.js";

const isProduction = process.env["NODE_ENV"] === NODE_ENV_PRODUCTION;

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      envFilePath: resolveEnvFilePaths(),
      validate: validateEnv,
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        ...(isProduction
          ? {}
          : {
              transport: {
                target: "pino-pretty",
                options: {
                  singleLine: true,
                  colorize: true,
                },
              },
            }),
        redact: {
          paths: [
            "req.headers.authorization",
            "req.headers.cookie",
            "res.headers['set-cookie']",
          ],
          remove: true,
        },
      },
    }),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          name: "default",
          ttl: AUTH_RATE_LIMIT_TTL_MS,
          limit: AUTH_RATE_LIMIT_LIMIT * 10,
        },
      ],
    }),
    PrismaModule,
    AuthModule,
    HealthModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: SessionAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_GUARD, useClass: CsrfOriginGuard },
    { provide: APP_GUARD, useClass: CsrfTokenGuard },
  ],
})
export class AppModule {}
