import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { LoggerModule } from "nestjs-pino";

import { NODE_ENV_PRODUCTION } from "./common/constants/app.constants.js";
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
    PrismaModule,
    HealthModule,
  ],
})
export class AppModule {}
