import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type {
  AuthSessionResponse,
  ChangePasswordResponse,
  CsrfTokenResponse,
  ForgotPasswordResponse,
  UserResponse,
} from '@toonexpo/contracts';
import { AccountType, UserStatus } from '@toonexpo/db';
import type { Request, Response } from 'express';

import {
  DUMMY_PASSWORD_HASH,
  SESSION_TOUCH_INTERVAL_MS,
} from '../common/constants/app.constants.js';
import type { AppEnv } from '../config/env.validation.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { QrCodesService } from '../qr/qr-codes.service.js';
import { AuthPasswordService } from './auth-password.service.js';
import { AuthUserResponseService } from './auth-user-response.service.js';
import { normalizeEmail } from './mappers/user.mapper.js';
import { type ClientMeta, SessionCookieService } from './session-cookie.service.js';
import type { AuthenticatedUser } from './types/authenticated-user.js';
import { createCsrfToken } from './utils/csrf-token.util.js';
import { hashPassword, verifyPassword } from './utils/password.util.js';
import { hashSessionToken } from './utils/session-token.util.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService<AppEnv, true>,
    private readonly passwordFlows: AuthPasswordService,
    private readonly sessionCookies: SessionCookieService,
    private readonly qrCodes: QrCodesService,
    private readonly userResponses: AuthUserResponseService,
  ) {}

  async register(
    input: { name: string; email: string; phone: string; password: string },
    meta: ClientMeta,
    response: Response,
  ): Promise<AuthSessionResponse> {
    const email = normalizeEmail(input.email);
    const existing = await this.prisma.db.user.findUnique({ where: { email } });

    if (existing) {
      throw new ConflictException('Email is already registered');
    }

    const passwordHash = await hashPassword(input.password);
    const user = await this.prisma.db.$transaction(async (tx) => {
      const created = await tx.user.create({
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
        include: { buyerProfile: true },
      });

      if (!created.buyerProfile) {
        throw new InternalServerErrorException('Buyer profile was not created');
      }

      await this.qrCodes.createForBuyerProfile(created.buyerProfile.id, tx);
      return created;
    });

    const csrfToken = await this.sessionCookies.issueSessionCookies(user.id, meta, response);
    return { user: await this.userResponses.build(user), csrfToken };
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
      throw new UnauthorizedException('Invalid email or password');
    }

    if (user.status !== UserStatus.active) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const csrfToken = await this.sessionCookies.issueSessionCookies(user.id, meta, response);
    return { user: await this.userResponses.build(user), csrfToken };
  }

  async logout(user: AuthenticatedUser, response: Response): Promise<void> {
    await this.prisma.db.session.update({
      where: { id: user.sessionId },
      data: { revokedAt: new Date() },
    });
    this.sessionCookies.clearSessionCookies(response);
  }

  forgotPassword(input: { email: string }): Promise<ForgotPasswordResponse> {
    return this.passwordFlows.forgotPassword(input);
  }

  setPassword(
    input: { token: string; password: string },
    meta: ClientMeta,
    response: Response,
  ): Promise<AuthSessionResponse> {
    return this.passwordFlows.setPassword(input, meta, response);
  }

  changePassword(
    user: AuthenticatedUser,
    input: { currentPassword: string; newPassword: string },
  ): Promise<ChangePasswordResponse> {
    return this.passwordFlows.changePassword(user, input);
  }

  getMe(user: AuthenticatedUser): Promise<UserResponse> {
    return this.userResponses.build(user);
  }

  getCsrfToken(request: Request): CsrfTokenResponse {
    const sessionCookieName = this.configService.get('SESSION_COOKIE_NAME', {
      infer: true,
    });
    const cookies = request.cookies as Record<string, string> | undefined;
    const sessionToken = cookies?.[sessionCookieName];
    if (!sessionToken) {
      throw new UnauthorizedException('Authentication required');
    }
    const secret = this.configService.get('CSRF_SECRET', { infer: true });
    return { csrfToken: createCsrfToken(sessionToken, secret) };
  }

  async validateSessionToken(rawToken: string): Promise<AuthenticatedUser | null> {
    const pepper = this.configService.get('SESSION_TOKEN_PEPPER', {
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

    await this.touchSession(session.id, session.absoluteExpiresAt, session.lastSeenAt);

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
    lastSeenAt: Date | null,
  ): Promise<void> {
    const nowMs = Date.now();
    if (lastSeenAt != null && nowMs - lastSeenAt.getTime() < SESSION_TOUCH_INTERVAL_MS) {
      return;
    }

    const idleTtl = this.configService.get('SESSION_IDLE_TTL_SECONDS', {
      infer: true,
    });
    const now = new Date(nowMs);
    const nextIdle = new Date(Math.min(nowMs + idleTtl * 1000, absoluteExpiresAt.getTime()));

    await this.prisma.db.session.update({
      where: { id: sessionId },
      data: {
        lastSeenAt: now,
        idleExpiresAt: nextIdle,
      },
    });
  }
}
