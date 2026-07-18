import { Inject, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { DEFAULT_LOCALE, isSupportedLocale } from "@toonexpo/shared";

import type { AppEnv } from "../config/env.validation.js";
import {
  buildPasswordResetEmail,
  buildSetPasswordEmail,
} from "../email/email.templates.js";
import {
  EMAIL_SERVICE,
  type EmailService,
} from "../email/email.types.js";
import { AccessTokenService } from "./access-token.service.js";

/**
 * Issues set-password / password-reset tokens and emails the link.
 */
@Injectable()
export class InviteMailerService {
  constructor(
    private readonly accessTokens: AccessTokenService,
    private readonly configService: ConfigService<AppEnv, true>,
    @Inject(EMAIL_SERVICE) private readonly emailService: EmailService,
  ) {}

  async sendSetPasswordInvite(input: {
    userId: string;
    email: string;
    name: string;
    locale?: string;
  }): Promise<void> {
    const issued = await this.accessTokens.issueSetPasswordToken(input.userId);
    const url = this.buildSetPasswordUrl(issued.rawToken, input.locale);
    const message = buildSetPasswordEmail({
      recipientName: input.name,
      setPasswordUrl: url,
    });

    await this.emailService.send({
      to: input.email,
      subject: message.subject,
      text: message.text,
    });
  }

  async sendPasswordReset(input: {
    userId: string;
    email: string;
    name: string;
    locale?: string;
  }): Promise<void> {
    const issued = await this.accessTokens.issuePasswordResetToken(input.userId);
    const url = this.buildSetPasswordUrl(issued.rawToken, input.locale);
    const message = buildPasswordResetEmail({
      recipientName: input.name,
      setPasswordUrl: url,
    });

    await this.emailService.send({
      to: input.email,
      subject: message.subject,
      text: message.text,
    });
  }

  private buildSetPasswordUrl(rawToken: string, locale?: string): string {
    const appUrl = this.configService.get("APP_URL", { infer: true });
    const defaultLocale = this.configService.get("DEFAULT_LOCALE", {
      infer: true,
    });
    const resolvedLocale =
      locale && isSupportedLocale(locale)
        ? locale
        : isSupportedLocale(defaultLocale)
          ? defaultLocale
          : DEFAULT_LOCALE;
    const base = appUrl.replace(/\/$/, "");

    return `${base}/${resolvedLocale}/auth/set-password?token=${encodeURIComponent(rawToken)}`;
  }
}
