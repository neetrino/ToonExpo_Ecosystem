import { ConflictException, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AccountType, UserStatus } from "@toonexpo/db";
import type { Response } from "express";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { AppEnv } from "../config/env.validation.js";
import type { PrismaService } from "../prisma/prisma.service.js";
import type { QrCodesService } from "../qr/qr-codes.service.js";
import { AuthService } from "./auth.service.js";
import type { AuthUserResponseService } from "./auth-user-response.service.js";
import { SessionCookieService } from "./session-cookie.service.js";
import { toUserResponse } from "./mappers/user.mapper.js";
import * as passwordUtil from "./utils/password.util.js";

const PEPPER = "test-session-token-pepper-32chars-min";

const createConfigService = (): ConfigService<AppEnv, true> =>
  ({
    get: (key: keyof AppEnv) => {
      const values: AppEnv = {
        NODE_ENV: "test",
        PORT: 4000,
        DATABASE_URL: "postgresql://test",
        APP_URL: "http://localhost:3000",
        CORS_ORIGINS: ["http://localhost:3000"],
        SESSION_TOKEN_PEPPER: PEPPER,
        SESSION_COOKIE_NAME: "toonexpo_session",
        SESSION_IDLE_TTL_SECONDS: 3600,
        SESSION_ABSOLUTE_TTL_SECONDS: 7200,
        CSRF_SECRET: "test-csrf-secret-at-least-32-chars!!",
        CSRF_COOKIE_NAME: "toonexpo_csrf",
      };
      return values[key];
    },
  }) as ConfigService<AppEnv, true>;

describe("AuthService", () => {
  const userCreate = vi.fn();
  const userFindUnique = vi.fn();
  const sessionCreate = vi.fn();
  const sessionFindUnique = vi.fn();
  const sessionUpdate = vi.fn();
  const transaction = vi.fn();
  const createForBuyerProfile = vi.fn();
  const cookie = vi.fn();
  const clearCookie = vi.fn();
  const buildUserResponse = vi.fn();

  let service: AuthService;
  let response: Response;

  beforeEach(() => {
    vi.restoreAllMocks();
    userCreate.mockReset();
    userFindUnique.mockReset();
    sessionCreate.mockReset();
    sessionFindUnique.mockReset();
    sessionUpdate.mockReset();
    transaction.mockReset();
    createForBuyerProfile.mockReset();
    cookie.mockReset();
    clearCookie.mockReset();
    buildUserResponse.mockReset();
    buildUserResponse.mockImplementation(async (user) => toUserResponse(user));

    const prisma = {
      db: {
        user: {
          create: userCreate,
          findUnique: userFindUnique,
        },
        session: {
          create: sessionCreate,
          findUnique: sessionFindUnique,
          update: sessionUpdate,
        },
        $transaction: transaction,
      },
    } as unknown as PrismaService;

    const config = createConfigService();
    const passwordFlows = {
      forgotPassword: vi.fn(),
      setPassword: vi.fn(),
    } as unknown as import("./auth-password.service.js").AuthPasswordService;
    const sessionCookies = new SessionCookieService(prisma, config);
    const qrCodes = {
      createForBuyerProfile,
    } as unknown as QrCodesService;
    const userResponses = {
      build: buildUserResponse,
    } as unknown as AuthUserResponseService;

    service = new AuthService(
      prisma,
      config,
      passwordFlows,
      sessionCookies,
      qrCodes,
      userResponses,
    );
    response = { cookie, clearCookie } as unknown as Response;
  });

  it("hashes passwords with argon2id on register and creates a session cookie", async () => {
    const createdUser = {
      id: "user_1",
      name: "Ani",
      email: "ani@example.com",
      phone: "+37491111222",
      accountType: AccountType.buyer,
      status: UserStatus.active,
      defaultLocale: null,
      createdAt: new Date("2026-07-18T00:00:00.000Z"),
      updatedAt: new Date("2026-07-18T00:00:00.000Z"),
      buyerProfile: { id: "bp_1" },
    };
    userFindUnique.mockResolvedValue(null);
    userCreate.mockResolvedValue(createdUser);
    createForBuyerProfile.mockResolvedValue(undefined);
    transaction.mockImplementation(
      async (fn: (tx: unknown) => Promise<unknown>) =>
        fn({
          user: { create: userCreate },
        }),
    );
    sessionCreate.mockResolvedValue({ id: "session_1" });

    const hashSpy = vi.spyOn(passwordUtil, "hashPassword");

    const result = await service.register(
      {
        name: "Ani",
        email: "Ani@Example.com",
        phone: "+37491111222",
        password: "password123",
      },
      {},
      response,
    );

    expect(hashSpy).toHaveBeenCalledWith("password123");
    expect(userCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          email: "ani@example.com",
          accountType: AccountType.buyer,
          buyerProfile: {
            create: expect.objectContaining({
              email: "ani@example.com",
              phone: "+37491111222",
            }),
          },
        }),
      }),
    );
    expect(createForBuyerProfile).toHaveBeenCalledWith("bp_1", expect.anything());
    expect(sessionCreate).toHaveBeenCalledOnce();
    expect(cookie).toHaveBeenCalledWith(
      "toonexpo_session",
      expect.any(String),
      expect.objectContaining({ httpOnly: true, sameSite: "lax" }),
    );
    expect(cookie).toHaveBeenCalledWith(
      "toonexpo_csrf",
      expect.any(String),
      expect.objectContaining({ httpOnly: false, sameSite: "lax" }),
    );
    expect(result.csrfToken).toEqual(expect.any(String));
    expect(result.user.email).toBe("ani@example.com");
    expect(result.user).not.toHaveProperty("passwordHash");
  });

  it("rejects duplicate email on register", async () => {
    userFindUnique.mockResolvedValue({ id: "existing" });

    await expect(
      service.register(
        {
          name: "Ani",
          email: "ani@example.com",
          phone: "+37491111222",
          password: "password123",
        },
        {},
        response,
      ),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(sessionCreate).not.toHaveBeenCalled();
  });

  it("rejects invalid credentials with a generic error", async () => {
    userFindUnique.mockResolvedValue(null);

    await expect(
      service.login(
        { email: "missing@example.com", password: "password123" },
        {},
        response,
      ),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(sessionCreate).not.toHaveBeenCalled();
  });

  it("rejects login when passwordHash is null with a generic error", async () => {
    const verifySpy = vi.spyOn(passwordUtil, "verifyPassword");
    userFindUnique.mockResolvedValue({
      id: "user_invited",
      name: "Invited",
      email: "invited@example.com",
      phone: null,
      passwordHash: null,
      accountType: AccountType.company_member,
      status: UserStatus.invited,
      defaultLocale: null,
      createdAt: new Date("2026-07-18T00:00:00.000Z"),
      updatedAt: new Date("2026-07-18T00:00:00.000Z"),
    });

    await expect(
      service.login(
        { email: "invited@example.com", password: "password123" },
        {},
        response,
      ),
    ).rejects.toBeInstanceOf(UnauthorizedException);

    expect(verifySpy).toHaveBeenCalledOnce();
    expect(sessionCreate).not.toHaveBeenCalled();
  });

  it("creates a session on successful login", async () => {
    const passwordHash = await passwordUtil.hashPassword("password123");
    userFindUnique.mockResolvedValue({
      id: "user_1",
      name: "Ani",
      email: "ani@example.com",
      phone: "+37491111222",
      passwordHash,
      accountType: AccountType.buyer,
      status: UserStatus.active,
      defaultLocale: null,
      createdAt: new Date("2026-07-18T00:00:00.000Z"),
      updatedAt: new Date("2026-07-18T00:00:00.000Z"),
    });
    sessionCreate.mockResolvedValue({ id: "session_1" });

    const result = await service.login(
      { email: "ani@example.com", password: "password123" },
      { ipAddress: "127.0.0.1" },
      response,
    );

    expect(sessionCreate).toHaveBeenCalledOnce();
    expect(cookie).toHaveBeenCalledTimes(2);
    expect(result.csrfToken).toEqual(expect.any(String));
    expect(result.user.id).toBe("user_1");
  });
});
