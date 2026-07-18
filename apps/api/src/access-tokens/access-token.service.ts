import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AccountAccessTokenPurpose } from "@toonexpo/db";

import {
  ACCOUNT_ACCESS_TOKEN_TTL_SECONDS,
  PASSWORD_RESET_TOKEN_TTL_SECONDS,
} from "../common/constants/app.constants.js";
import type { AppEnv } from "../config/env.validation.js";
import { PrismaService } from "../prisma/prisma.service.js";
import { createAccessToken, hashAccessToken } from "./access-token.util.js";

export type IssuedAccessToken = {
  rawToken: string;
  expiresAt: Date;
};

type AccessTokenUser = {
  id: string;
  status: string;
};

export type ValidatedAccessToken = {
  token: {
    id: string;
    purpose: AccountAccessTokenPurpose;
    usedAt: Date | null;
    expiresAt: Date;
  };
  user: AccessTokenUser;
};

const PASSWORD_SET_PURPOSES: readonly AccountAccessTokenPurpose[] = [
  AccountAccessTokenPurpose.set_password,
  AccountAccessTokenPurpose.password_reset,
] as const;

/**
 * Issues, invalidates and consumes single-use account access tokens.
 */
@Injectable()
export class AccessTokenService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService<AppEnv, true>,
  ) {}

  async issueSetPasswordToken(userId: string): Promise<IssuedAccessToken> {
    return this.issueToken(
      userId,
      AccountAccessTokenPurpose.set_password,
      ACCOUNT_ACCESS_TOKEN_TTL_SECONDS,
    );
  }

  async issuePasswordResetToken(userId: string): Promise<IssuedAccessToken> {
    return this.issueToken(
      userId,
      AccountAccessTokenPurpose.password_reset,
      PASSWORD_RESET_TOKEN_TTL_SECONDS,
    );
  }

  async invalidateUnusedTokens(
    userId: string,
    purpose: AccountAccessTokenPurpose,
  ): Promise<void> {
    const now = new Date();
    await this.prisma.db.accountAccessToken.updateMany({
      where: {
        userId,
        purpose,
        usedAt: null,
        expiresAt: { gt: now },
      },
      data: { usedAt: now },
    });
  }

  /**
   * Validates a set-password or password-reset token (single-use, unexpired).
   */
  async validateSetPasswordToken(rawToken: string): Promise<ValidatedAccessToken> {
    const pepper = this.configService.get("SESSION_TOKEN_PEPPER", {
      infer: true,
    });
    const tokenHash = hashAccessToken(rawToken, pepper);
    const token = await this.prisma.db.accountAccessToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!token || !PASSWORD_SET_PURPOSES.includes(token.purpose)) {
      throw new UnauthorizedException("Invalid or expired token");
    }

    if (token.usedAt != null || token.expiresAt.getTime() <= Date.now()) {
      throw new UnauthorizedException("Invalid or expired token");
    }

    return { token, user: token.user };
  }

  async markUsed(tokenId: string): Promise<void> {
    await this.prisma.db.accountAccessToken.update({
      where: { id: tokenId },
      data: { usedAt: new Date() },
    });
  }

  private async issueToken(
    userId: string,
    purpose: AccountAccessTokenPurpose,
    ttlSeconds: number,
  ): Promise<IssuedAccessToken> {
    await this.invalidateUnusedTokens(userId, purpose);

    const pepper = this.configService.get("SESSION_TOKEN_PEPPER", {
      infer: true,
    });
    const rawToken = createAccessToken();
    const tokenHash = hashAccessToken(rawToken, pepper);
    const expiresAt = new Date(Date.now() + ttlSeconds * 1000);

    await this.prisma.db.accountAccessToken.create({
      data: {
        userId,
        purpose,
        tokenHash,
        expiresAt,
      },
    });

    return { rawToken, expiresAt };
  }
}
