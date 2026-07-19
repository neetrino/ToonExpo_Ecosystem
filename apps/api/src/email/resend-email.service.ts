import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Resend } from "resend";

import type { AppEnv } from "../config/env.validation.js";
import type { EmailMessage, EmailService } from "./email.types.js";

/**
 * Delivers transactional email through Resend.
 */
@Injectable()
export class ResendEmailService implements EmailService {
  private readonly logger = new Logger(ResendEmailService.name);
  private readonly client: Resend;
  private readonly fromEmail: string;

  constructor(configService: ConfigService<AppEnv, true>) {
    const apiKey = configService.get("RESEND_API_KEY", { infer: true });
    const fromEmail = configService.get("RESEND_FROM_EMAIL", { infer: true });

    if (!apiKey || !fromEmail) {
      throw new Error(
        "ResendEmailService requires RESEND_API_KEY and RESEND_FROM_EMAIL",
      );
    }

    this.client = new Resend(apiKey);
    this.fromEmail = fromEmail;
  }

  async send(message: EmailMessage): Promise<void> {
    const result = await this.client.emails.send({
      from: this.fromEmail,
      to: message.to,
      subject: message.subject,
      text: message.text,
    });

    if (result.error) {
      this.logger.error(
        { err: result.error, to: message.to },
        "Resend email delivery failed",
      );
      throw new InternalServerErrorException("Failed to send email");
    }
  }
}
