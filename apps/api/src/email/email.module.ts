import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import {
  NODE_ENV_PRODUCTION,
  NODE_ENV_TEST,
} from "../common/constants/app.constants.js";
import type { AppEnv } from "../config/env.validation.js";
import { EMAIL_SERVICE } from "./email.types.js";
import { LoggingEmailService } from "./logging-email.service.js";
import { ResendEmailService } from "./resend-email.service.js";

const createEmailService = (
  configService: ConfigService<AppEnv, true>,
): LoggingEmailService | ResendEmailService => {
  const nodeEnv = configService.get("NODE_ENV", { infer: true });
  const apiKey = configService.get("RESEND_API_KEY", { infer: true });

  if (nodeEnv === NODE_ENV_TEST || !apiKey) {
    if (nodeEnv === NODE_ENV_PRODUCTION) {
      throw new Error("RESEND_API_KEY is required in production");
    }

    return new LoggingEmailService();
  }

  return new ResendEmailService(configService);
};

@Module({
  providers: [
    LoggingEmailService,
    {
      provide: EMAIL_SERVICE,
      inject: [ConfigService],
      useFactory: createEmailService,
    },
  ],
  exports: [EMAIL_SERVICE],
})
export class EmailModule {}
