import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { Response } from "express";

import type { AppEnv } from "../config/env.validation.js";
import { PrismaService } from "../prisma/prisma.service.js";
import { createCsrfToken } from "./utils/csrf-token.util.js";
import {
  buildCsrfCookieOptions,
  buildSessionCookieOptions,
} from "./utils/session-cookie.util.js";
import {
  createSessionToken,
  hashSessionToken,
} from "./utils/session-token.util.js";

export type ClientMeta = {
  ipAddress?: string;
  userAgent?: string;
};

type CreatedSession = {
  rawToken: string;
  absoluteExpiresAt: Date;
};

/**
 * Creates DB sessions and sets/clears session + CSRF cookies.
 */
@Injectable()
export class SessionCookieService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService<AppEnv, true>,
  ) {}

  async issueSessionCookies(
    userId: string,
    meta: ClientMeta,
    response: Response,
  ): Promise<string> {
    const created = await this.createSession(userId, meta);
    const nodeEnv = this.configService.get("NODE_ENV", { infer: true });
    const sessionCookieName = this.configService.get("SESSION_COOKIE_NAME", {
      infer: true,
    });
    const csrfCookieName = this.configService.get("CSRF_COOKIE_NAME", {
      infer: true,
    });
    const maxAgeMs = Math.max(
      created.absoluteExpiresAt.getTime() - Date.now(),
      0,
    );
    const secret = this.configService.get("CSRF_SECRET", { infer: true });
    const csrfToken = createCsrfToken(created.rawToken, secret);

    response.cookie(
      sessionCookieName,
      created.rawToken,
      buildSessionCookieOptions(nodeEnv, maxAgeMs),
    );
    response.cookie(
      csrfCookieName,
      csrfToken,
      buildCsrfCookieOptions(nodeEnv, maxAgeMs),
    );

    return csrfToken;
  }

  clearSessionCookies(response: Response): void {
    const nodeEnv = this.configService.get("NODE_ENV", { infer: true });
    const sessionCookieName = this.configService.get("SESSION_COOKIE_NAME", {
      infer: true,
    });
    const csrfCookieName = this.configService.get("CSRF_COOKIE_NAME", {
      infer: true,
    });

    response.clearCookie(
      sessionCookieName,
      buildSessionCookieOptions(nodeEnv, 0),
    );
    response.clearCookie(csrfCookieName, buildCsrfCookieOptions(nodeEnv, 0));
  }

  private async createSession(
    userId: string,
    meta: ClientMeta,
  ): Promise<CreatedSession> {
    const pepper = this.configService.get("SESSION_TOKEN_PEPPER", {
      infer: true,
    });
    const idleTtl = this.configService.get("SESSION_IDLE_TTL_SECONDS", {
      infer: true,
    });
    const absoluteTtl = this.configService.get("SESSION_ABSOLUTE_TTL_SECONDS", {
      infer: true,
    });
    const now = new Date();
    const absoluteExpiresAt = new Date(now.getTime() + absoluteTtl * 1000);
    const idleExpiresAt = new Date(
      Math.min(now.getTime() + idleTtl * 1000, absoluteExpiresAt.getTime()),
    );
    const rawToken = createSessionToken();
    const tokenHash = hashSessionToken(rawToken, pepper);

    await this.prisma.db.session.create({
      data: {
        userId,
        tokenHash,
        idleExpiresAt,
        absoluteExpiresAt,
        lastSeenAt: now,
        ...(meta.ipAddress ? { ipAddress: meta.ipAddress } : {}),
        ...(meta.userAgent ? { userAgent: meta.userAgent } : {}),
      },
    });

    return { rawToken, absoluteExpiresAt };
  }
}
