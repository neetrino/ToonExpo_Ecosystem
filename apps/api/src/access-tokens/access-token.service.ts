import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AccountAccessTokenPurpose } from "@toonexpo/db";

import { ACCOUNT_ACCESS_TOKEN_TTL_SECONDS } from "../common/constants/app.constants.js";
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

type ValidatedAccessToken = {
  token: {
    id: string;
    purpose: AccountAccessTokenPurpose;
    usedAt: Date | null;
    expiresAt: Date;
  };
  user: AccessTokenUser;
};

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
    await this.invalidateUnusedTokens(userId, AccountAccessTokenPurpose.set_password);

    const pepper = this.configService.get("SESSION_TOKEN_PEPPER", {
      infer: true,
    });
    const rawToken = createAccessToken();
    const tokenHash = hashAccessToken(rawToken, pepper);
    const expiresAt = new Date(
      Date.now() + ACCOUNT_ACCESS_TOKEN_TTL_SECONDS * 1000,
    );

    await this.prisma.db.accountAccessToken.create({
      data: {
        userId,
        purpose: AccountAccessTokenPurpose.set_password,
        tokenHash,
        expiresAt,
      },
    });

    return { rawToken, expiresAt };
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

  async validateSetPasswordToken(rawToken: string): Promise<ValidatedAccessToken> {
    const pepper = this.configService.get("SESSION_TOKEN_PEPPER", {
      infer: true,
    });
    const tokenHash = hashAccessToken(rawToken, pepper);
    const token = await this.prisma.db.accountAccessToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!token || token.purpose !== AccountAccessTokenPurpose.set_password) {
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
}
