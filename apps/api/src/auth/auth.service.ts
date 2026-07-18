import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { AuthSessionResponse, UserResponse } from "@toonexpo/contracts";
import { PlatformRole, UserStatus } from "@toonexpo/db";
import type { CookieOptions, Response } from "express";

import {
  DUMMY_PASSWORD_HASH,
  NODE_ENV_PRODUCTION,
} from "../common/constants/app.constants.js";
import type { AppEnv } from "../config/env.validation.js";
import { PrismaService } from "../prisma/prisma.service.js";
import { normalizeEmail, toUserResponse } from "./mappers/user.mapper.js";
import type { AuthenticatedUser } from "./types/authenticated-user.js";
import { hashPassword, verifyPassword } from "./utils/password.util.js";
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
        role: PlatformRole.buyer,
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

    await this.issueSessionCookie(user.id, meta, response);
    return { user: toUserResponse(user) };
  }

  async login(
    input: { email: string; password: string },
    meta: ClientMeta,
    response: Response,
  ): Promise<AuthSessionResponse> {
    const email = normalizeEmail(input.email);
    const user = await this.prisma.db.user.findUnique({ where: { email } });
    const passwordHash = user?.passwordHash ?? DUMMY_PASSWORD_HASH;
    const passwordValid = await verifyPassword(passwordHash, input.password);

    if (!user || !passwordValid) {
      throw new UnauthorizedException("Invalid email or password");
    }

    if (user.status !== UserStatus.active) {
      throw new UnauthorizedException("Invalid email or password");
    }

    await this.issueSessionCookie(user.id, meta, response);
    return { user: toUserResponse(user) };
  }

  async logout(
    user: AuthenticatedUser,
    response: Response,
  ): Promise<void> {
    await this.prisma.db.session.update({
      where: { id: user.sessionId },
      data: { revokedAt: new Date() },
    });
    this.clearSessionCookie(response);
  }

  getMe(user: AuthenticatedUser): UserResponse {
    return toUserResponse(user);
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
      role: session.user.role,
      status: session.user.status,
      defaultLocale: session.user.defaultLocale,
      createdAt: session.user.createdAt,
      updatedAt: session.user.updatedAt,
      sessionId: session.id,
    };
  }

  buildSessionCookieOptions(maxAgeMs: number): CookieOptions {
    const nodeEnv = this.configService.get("NODE_ENV", { infer: true });

    return {
      httpOnly: true,
      secure: nodeEnv === NODE_ENV_PRODUCTION,
      sameSite: "lax",
      path: "/",
      maxAge: maxAgeMs,
    };
  }

  private async issueSessionCookie(
    userId: string,
    meta: ClientMeta,
    response: Response,
  ): Promise<void> {
    const created = await this.createSession(userId, meta);
    const cookieName = this.configService.get("SESSION_COOKIE_NAME", {
      infer: true,
    });
    const maxAgeMs = Math.max(
      created.absoluteExpiresAt.getTime() - Date.now(),
      0,
    );

    response.cookie(
      cookieName,
      created.rawToken,
      this.buildSessionCookieOptions(maxAgeMs),
    );
  }

  private clearSessionCookie(response: Response): void {
    const cookieName = this.configService.get("SESSION_COOKIE_NAME", {
      infer: true,
    });
    response.clearCookie(cookieName, this.buildSessionCookieOptions(0));
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
