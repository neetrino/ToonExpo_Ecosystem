import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { ValidationPipe } from "@nestjs/common";
import type { NestExpressApplication } from "@nestjs/platform-express";
import { Test, type TestingModule } from "@nestjs/testing";
import {
  API_V1_PREFIX,
} from "@toonexpo/contracts";
import { AccountAccessTokenPurpose, UserStatus } from "@toonexpo/db";
import cookieParser from "cookie-parser";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import { AppModule } from "../src/app.module.js";
import { hashAccessToken } from "../src/access-tokens/access-token.util.js";
import { AllExceptionsFilter } from "../src/common/filters/all-exceptions.filter.js";
import { FORGOT_PASSWORD_RESPONSE_MESSAGE } from "../src/common/constants/app.constants.js";
import { EMAIL_SERVICE, type EmailMessage } from "../src/email/email.types.js";
import { PrismaService } from "../src/prisma/prisma.service.js";
import { hashPassword } from "../src/auth/utils/password.util.js";

const GLOBAL_PREFIX = API_V1_PREFIX.replace(/^\//, "");
const TEST_DIR = fileURLToPath(new URL(".", import.meta.url));
const ROOT_ENV_PATH = resolve(TEST_DIR, "../../../.env");

const uniqueEmail = (suffix: string): string =>
  `reset.e2e.${suffix}.${Date.now()}.${Math.random().toString(16).slice(2)}@example.com`;

const findSetCookie = (
  setCookieHeader: string[] | undefined,
  name: string,
): string | undefined => {
  if (!setCookieHeader) {
    return undefined;
  }
  return setCookieHeader.find((value) => value.startsWith(`${name}=`));
};

const cookiePair = (setCookie: string): string => setCookie.split(";")[0] ?? "";

const extractTokenFromEmail = (message: EmailMessage | undefined): string => {
  const match = message?.text.match(/token=([^\s&]+)/);
  if (!match?.[1]) {
    throw new Error("Reset token not found in email");
  }
  return decodeURIComponent(match[1]);
};

describe("Password reset (e2e)", () => {
  let app: NestExpressApplication;
  let prisma: PrismaService;
  const sentEmails: EmailMessage[] = [];
  const createdEmails: string[] = [];

  beforeAll(async () => {
    process.env["NODE_ENV"] = process.env["NODE_ENV"] ?? "test";
    process.loadEnvFile?.(ROOT_ENV_PATH);

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(EMAIL_SERVICE)
      .useValue({
        send: vi.fn(async (message: EmailMessage) => {
          sentEmails.push(message);
        }),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());
    app.setGlobalPrefix(GLOBAL_PREFIX);
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );
    app.useGlobalFilters(app.get(AllExceptionsFilter));
    await app.init();

    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    if (createdEmails.length > 0) {
      await prisma.db.user.deleteMany({
        where: { email: { in: createdEmails } },
      });
    }
    await app.close();
  });

  it("forgot → set-password → login with new password; old sessions revoked", async () => {
    const email = uniqueEmail("happy");
    createdEmails.push(email);
    const oldPassword = "old-password-123";
    const newPassword = "new-password-456";
    sentEmails.length = 0;

    const register = await request(app.getHttpServer())
      .post(`${API_V1_PREFIX}/auth/register`)
      .send({
        name: "Reset Buyer",
        email,
        phone: "+37491112233",
        password: oldPassword,
      })
      .expect(201);

    const oldSession = findSetCookie(
      register.headers["set-cookie"] as string[] | undefined,
      "toonexpo_session",
    );
    expect(oldSession).toBeDefined();
    const oldCookie = cookiePair(oldSession!);

    await request(app.getHttpServer())
      .get(`${API_V1_PREFIX}/auth/me`)
      .set("Cookie", oldCookie)
      .expect(200);

    const forgot = await request(app.getHttpServer())
      .post(`${API_V1_PREFIX}/auth/forgot-password`)
      .send({ email })
      .expect(200);

    expect(forgot.body.message).toBe(FORGOT_PASSWORD_RESPONSE_MESSAGE);
    expect(sentEmails).toHaveLength(1);
    const resetToken = extractTokenFromEmail(sentEmails[0]);

    const setPassword = await request(app.getHttpServer())
      .post(`${API_V1_PREFIX}/auth/set-password`)
      .send({ token: resetToken, password: newPassword })
      .expect(200);

    expect(setPassword.body.user.email).toBe(email);
    const newSession = findSetCookie(
      setPassword.headers["set-cookie"] as string[] | undefined,
      "toonexpo_session",
    );
    expect(newSession).toBeDefined();

    await request(app.getHttpServer())
      .get(`${API_V1_PREFIX}/auth/me`)
      .set("Cookie", oldCookie)
      .expect(401);

    await request(app.getHttpServer())
      .get(`${API_V1_PREFIX}/auth/me`)
      .set("Cookie", cookiePair(newSession!))
      .expect(200);

    await request(app.getHttpServer())
      .post(`${API_V1_PREFIX}/auth/login`)
      .send({ email, password: oldPassword })
      .expect(401);

    await request(app.getHttpServer())
      .post(`${API_V1_PREFIX}/auth/login`)
      .send({ email, password: newPassword })
      .expect(200);
  });

  it("returns the same opaque message for unknown and invited emails", async () => {
    sentEmails.length = 0;
    const unknown = await request(app.getHttpServer())
      .post(`${API_V1_PREFIX}/auth/forgot-password`)
      .send({ email: uniqueEmail("missing") })
      .expect(200);

    expect(unknown.body.message).toBe(FORGOT_PASSWORD_RESPONSE_MESSAGE);
    expect(sentEmails).toHaveLength(0);

    const invitedEmail = uniqueEmail("invited");
    createdEmails.push(invitedEmail);
    await prisma.db.user.create({
      data: {
        name: "Invited User",
        email: invitedEmail,
        status: UserStatus.invited,
      },
    });

    const invited = await request(app.getHttpServer())
      .post(`${API_V1_PREFIX}/auth/forgot-password`)
      .send({ email: invitedEmail })
      .expect(200);

    expect(invited.body.message).toBe(FORGOT_PASSWORD_RESPONSE_MESSAGE);
    expect(sentEmails).toHaveLength(0);
  });

  it("rejects an expired password-reset token", async () => {
    const email = uniqueEmail("expired");
    createdEmails.push(email);
    const passwordHash = await hashPassword("password12345");
    const user = await prisma.db.user.create({
      data: {
        name: "Expired Reset",
        email,
        phone: "+37491113344",
        passwordHash,
        status: UserStatus.active,
      },
    });

    const pepper = process.env["SESSION_TOKEN_PEPPER"];
    if (!pepper) {
      throw new Error("SESSION_TOKEN_PEPPER is required for e2e");
    }
    const rawToken = "expired-reset-token-value-32b!!";
    await prisma.db.accountAccessToken.create({
      data: {
        userId: user.id,
        purpose: AccountAccessTokenPurpose.password_reset,
        tokenHash: hashAccessToken(rawToken, pepper),
        expiresAt: new Date(Date.now() - 60_000),
      },
    });

    await request(app.getHttpServer())
      .post(`${API_V1_PREFIX}/auth/set-password`)
      .send({ token: rawToken, password: "another-password" })
      .expect(401);
  });
});
