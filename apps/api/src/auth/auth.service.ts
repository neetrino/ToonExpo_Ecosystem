import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type {
  AuthSessionResponse,
  CsrfTokenResponse,
  UserResponse,
} from "@toonexpo/contracts";
import { AccountType, UserStatus } from "@toonexpo/db";
import type { Request, Response } from "express";

import { DUMMY_PASSWORD_HASH } from "../common/constants/app.constants.js";
import type { AppEnv } from "../config/env.validation.js";
import { PrismaService } from "../prisma/prisma.service.js";
import { normalizeEmail, toUserResponse } from "./mappers/user.mapper.js";
import type { AuthenticatedUser } from "./types/authenticated-user.js";
import { createCsrfToken } from "./utils/csrf-token.util.js";
import { hashPassword, verifyPassword } from "./utils/password.util.js";
import {
  buildCsrfCookieOptions,
  buildSessionCookieOptions,
} from "./utils/session-cookie.util.js";
import {
  createSessionToken,
  hashSessionToken,
} from "./utils/session-token.util.js";

type ClientMeta = {
  ipAddress?: string;
  userAgent?: string;
};

type CreatedSession = {
  rawToken: string;
  absoluteExpiresAt: Date;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService<AppEnv, true>,
  ) {}

  async register(
    input: { name: string; email: string; phone: string; password: string },
    meta: ClientMeta,
    response: Response,
  ): Promise<AuthSessionResponse> {
    const email = normalizeEmail(input.email);
    const existing = await this.prisma.db.user.findUnique({ where: { email } });

    if (existing) {
      throw new ConflictException("Email is already registered");
    }

    const passwordHash = await hashPassword(input.password);
    const user = await this.prisma.db.user.create({
      data: {
        name: input.name.trim(),
        email,
        phone: input.phone.trim(),
        passwordHash,
        accountType: AccountType.buyer,
        status: UserStatus.active,
        buyerProfile: {
          create: {
            name: input.name.trim(),
            phone: input.phone.trim(),
            email,
          },
        },
      },
    });

    const csrfToken = await this.issueSessionCookies(user.id, meta, response);
    return { user: toUserResponse(user), csrfToken };
  }

  async login(
    input: { email: string; password: string },
    meta: ClientMeta,
    response: Response,
  ): Promise<AuthSessionResponse> {
    const email = normalizeEmail(input.email);
    const user = await this.prisma.db.user.findUnique({ where: { email } });
    const storedHash = user?.passwordHash;
    const passwordHash = storedHash ?? DUMMY_PASSWORD_HASH;
    const passwordValid = await verifyPassword(passwordHash, input.password);

    if (!user || storedHash == null || !passwordValid) {
      throw new UnauthorizedException("Invalid email or password");
    }

    if (user.status !== UserStatus.active) {
      throw new UnauthorizedException("Invalid email or password");
    }

    const csrfToken = await this.issueSessionCookies(user.id, meta, response);
    return { user: toUserResponse(user), csrfToken };
  }

  async logout(user: AuthenticatedUser, response: Response): Promise<void> {
    await this.prisma.db.session.update({
      where: { id: user.sessionId },
      data: { revokedAt: new Date() },
    });
    this.clearSessionCookies(response);
  }

  getMe(user: AuthenticatedUser): UserResponse {
    return toUserResponse(user);
  }

  getCsrfToken(request: Request): CsrfTokenResponse {
    const sessionCookieName = this.configService.get("SESSION_COOKIE_NAME", {
      infer: true,
    });
    const cookies = request.cookies as Record<string, string> | undefined;
    const sessionToken = cookies?.[sessionCookieName];
    if (!sessionToken) {
      throw new UnauthorizedException("Authentication required");
    }
    const secret = this.configService.get("CSRF_SECRET", { infer: true });
    return { csrfToken: createCsrfToken(sessionToken, secret) };
  }

  async validateSessionToken(
    rawToken: string,
  ): Promise<AuthenticatedUser | null> {
    const pepper = this.configService.get("SESSION_TOKEN_PEPPER", {
      infer: true,
    });
    const tokenHash = hashSessionToken(rawToken, pepper);
    const session = await this.prisma.db.session.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!session || !this.isSessionActive(session)) {
      return null;
    }

    await this.touchSession(session.id, session.absoluteExpiresAt);

    return {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      phone: session.user.phone,
      accountType: session.user.accountType,
      status: session.user.status,
      defaultLocale: session.user.defaultLocale,
      createdAt: session.user.createdAt,
      updatedAt: session.user.updatedAt,
      sessionId: session.id,
    };
  }

  private async issueSessionCookies(
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

  private clearSessionCookies(response: Response): void {
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
      Math.min(
        now.getTime() + idleTtl * 1000,
        absoluteExpiresAt.getTime(),
      ),
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

  private isSessionActive(session: {
    revokedAt: Date | null;
    idleExpiresAt: Date;
    absoluteExpiresAt: Date;
    user: { status: UserStatus };
  }): boolean {
    const now = Date.now();

    if (session.revokedAt) {
      return false;
    }

    if (session.user.status !== UserStatus.active) {
      return false;
    }

    if (session.idleExpiresAt.getTime() <= now) {
      return false;
    }

    if (session.absoluteExpiresAt.getTime() <= now) {
      return false;
    }

    return true;
  }

  private async touchSession(
    sessionId: string,
    absoluteExpiresAt: Date,
  ): Promise<void> {
    const idleTtl = this.configService.get("SESSION_IDLE_TTL_SECONDS", {
      infer: true,
    });
    const now = new Date();
    const nextIdle = new Date(
      Math.min(now.getTime() + idleTtl * 1000, absoluteExpiresAt.getTime()),
    );

    await this.prisma.db.session.update({
      where: { id: sessionId },
      data: {
        lastSeenAt: now,
        idleExpiresAt: nextIdle,
      },
    });
  }
}
