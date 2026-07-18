import { Injectable, UnauthorizedException } from "@nestjs/common";
import type {
  AuthSessionResponse,
  ForgotPasswordResponse,
} from "@toonexpo/contracts";
import { AccountAccessTokenPurpose, UserStatus } from "@toonexpo/db";
import type { Response } from "express";

import { AccessTokenService } from "../access-tokens/access-token.service.js";
import { InviteMailerService } from "../access-tokens/invite-mailer.service.js";
import { FORGOT_PASSWORD_RESPONSE_MESSAGE } from "../common/constants/app.constants.js";
import { PrismaService } from "../prisma/prisma.service.js";
import { normalizeEmail } from "./mappers/user.mapper.js";
import {
  type ClientMeta,
  SessionCookieService,
} from "./session-cookie.service.js";
import { AuthUserResponseService } from "./auth-user-response.service.js";
import { hashPassword } from "./utils/password.util.js";

/**
 * Forgot-password and set-password (invite + reset) flows.
 */
@Injectable()
export class AuthPasswordService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly accessTokens: AccessTokenService,
    private readonly inviteMailer: InviteMailerService,
    private readonly sessionCookies: SessionCookieService,
    private readonly userResponses: AuthUserResponseService,
  ) {}

  async forgotPassword(input: {
    email: string;
  }): Promise<ForgotPasswordResponse> {
    const email = normalizeEmail(input.email);
    const user = await this.prisma.db.user.findUnique({ where: { email } });

    if (user?.status === UserStatus.active) {
      await this.inviteMailer.sendPasswordReset({
        userId: user.id,
        email: user.email,
        name: user.name,
        ...(user.defaultLocale ? { locale: user.defaultLocale } : {}),
      });
    }

    return { message: FORGOT_PASSWORD_RESPONSE_MESSAGE };
  }

  async setPassword(
    input: { token: string; password: string },
    meta: ClientMeta,
    response: Response,
  ): Promise<AuthSessionResponse> {
    const validated = await this.accessTokens.validateSetPasswordToken(
      input.token,
    );
    const isReset =
      validated.token.purpose === AccountAccessTokenPurpose.password_reset;
    this.assertTokenUserStatus(validated.user.status, isReset);

    const passwordHash = await hashPassword(input.password);
    const now = new Date();
    const user = await this.applyPasswordChange({
      userId: validated.user.id,
      tokenId: validated.token.id,
      passwordHash,
      isReset,
      now,
    });

    if (isReset) {
      await this.prisma.db.session.updateMany({
        where: { userId: user.id, revokedAt: null },
        data: { revokedAt: now },
      });
    }

    const csrfToken = await this.sessionCookies.issueSessionCookies(
      user.id,
      meta,
      response,
    );
    return { user: await this.userResponses.build(user), csrfToken };
  }

  private assertTokenUserStatus(status: string, isReset: boolean): void {
    if (isReset) {
      if (status !== UserStatus.active) {
        throw new UnauthorizedException("Invalid or expired token");
      }
      return;
    }
    if (status !== UserStatus.invited && status !== UserStatus.active) {
      throw new UnauthorizedException("Invalid or expired token");
    }
  }

  private async applyPasswordChange(input: {
    userId: string;
    tokenId: string;
    passwordHash: string;
    isReset: boolean;
    now: Date;
  }) {
    return this.prisma.db.$transaction(async (tx) => {
      const updated = await tx.user.update({
        where: { id: input.userId },
        data: input.isReset
          ? { passwordHash: input.passwordHash }
          : { passwordHash: input.passwordHash, status: UserStatus.active },
      });

      await tx.accountAccessToken.update({
        where: { id: input.tokenId },
        data: { usedAt: input.now },
      });

      if (!input.isReset) {
        await tx.companyMember.updateMany({
          where: { userId: updated.id, joinedAt: null },
          data: { joinedAt: input.now },
        });
      }

      return updated;
    });
  }
}
