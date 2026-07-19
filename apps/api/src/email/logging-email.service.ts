import { Injectable, Logger } from "@nestjs/common";

import type { EmailMessage, EmailService } from "./email.types.js";

/**
 * Non-production fallback that logs email content instead of sending.
 */
@Injectable()
export class LoggingEmailService implements EmailService {
  private readonly logger = new Logger(LoggingEmailService.name);

  async send(message: EmailMessage): Promise<void> {
    this.logger.warn(
      `Email not sent (logging transport; set RESEND_API_KEY to deliver): to=${message.to} subject=${message.subject}`,
    );
  }
}

