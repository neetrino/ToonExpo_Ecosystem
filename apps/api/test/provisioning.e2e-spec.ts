import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { ValidationPipe } from "@nestjs/common";
import type { NestExpressApplication } from "@nestjs/platform-express";
import { Test, type TestingModule } from "@nestjs/testing";
import {
  API_V1_PREFIX,
  CSRF_COOKIE_NAME,
  CSRF_HEADER_NAME,
} from "@toonexpo/contracts";
import { AccountType, UserStatus } from "@toonexpo/db";
import cookieParser from "cookie-parser";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import { EMAIL_SERVICE, type EmailMessage } from "../src/email/email.types.js";
import { AppModule } from "../src/app.module.js";
import { AllExceptionsFilter } from "../src/common/filters/all-exceptions.filter.js";
import { PrismaService } from "../src/prisma/prisma.service.js";
import { hashPassword } from "../src/auth/utils/password.util.js";

const GLOBAL_PREFIX = API_V1_PREFIX.replace(/^\//, "");
const TEST_DIR = fileURLToPath(new URL(".", import.meta.url));
const ROOT_ENV_PATH = resolve(TEST_DIR, "../../../.env");
const CORS_ORIGIN = "http://localhost:3000";

const uniqueEmail = (suffix: string): string =>
  `prov.e2e.${suffix}.${Date.now()}.${Math.random().toString(16).slice(2)}@example.com`;

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
    throw new Error("Set-password token not found in email");
  }
  return decodeURIComponent(match[1]);
};

describe("Company provisioning (e2e)", () => {
  let app: NestExpressApplication;
  let prisma: PrismaService;
  const sentEmails: EmailMessage[] = [];
  const createdUserIds: string[] = [];
  const createdCompanyIds: string[] = [];
  let platformAdminEmail = "";
  const platformAdminPassword = "platform-admin-pass-123";

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

    platformAdminEmail = uniqueEmail("platform-admin");
    const passwordHash = await hashPassword(platformAdminPassword);
    const admin = await prisma.db.user.create({
      data: {
        name: "E2E Platform Admin",
        email: platformAdminEmail,
        passwordHash,
        accountType: AccountType.platform_admin,
        status: UserStatus.active,
      },
    });
    createdUserIds.push(admin.id);
  });

  afterAll(async () => {
    if (createdCompanyIds.length > 0) {
      await prisma.db.company.deleteMany({
        where: { id: { in: createdCompanyIds } },
      });
    }
    if (createdUserIds.length > 0) {
      await prisma.db.user.deleteMany({
        where: { id: { in: createdUserIds } },
      });
    }
    await app.close();
  });

  const loginAs = async (email: string, password: string) => {
    const response = await request(app.getHttpServer())
      .post(`${API_V1_PREFIX}/auth/login`)
      .send({ email, password })
      .expect(200);

    const session = findSetCookie(
      response.headers["set-cookie"] as string[] | undefined,
      "toonexpo_session",
    );
    const csrf = findSetCookie(
      response.headers["set-cookie"] as string[] | undefined,
      CSRF_COOKIE_NAME,
    );

    return {
      cookieHeader: `${cookiePair(session as string)}; ${cookiePair(csrf as string)}`,
      csrfToken: response.body.csrfToken as string,
      user: response.body.user as { id: string; email: string },
    };
  };

  it("provisions company → set-password → me; invite staff; foreign access 403; token reuse fails", async () => {
    sentEmails.length = 0;
    const adminSession = await loginAs(
      platformAdminEmail,
      platformAdminPassword,
    );

    const adminEmail = uniqueEmail("company-admin");
    const provision = await request(app.getHttpServer())
      .post(`${API_V1_PREFIX}/admin/companies`)
      .set("Cookie", adminSession.cookieHeader)
      .set("Origin", CORS_ORIGIN)
      .set(CSRF_HEADER_NAME, adminSession.csrfToken)
      .send({
        name: "E2E Provision Co",
        type: "builder",
        adminName: "E2E Co Admin",
        adminEmail,
        locale: "en",
      })
      .expect(201);

    createdCompanyIds.push(provision.body.company.id as string);
    createdUserIds.push(provision.body.adminUser.id as string);
    expect(provision.body.adminUser.status).toBe("invited");
    expect(sentEmails).toHaveLength(1);

    const setPasswordToken = extractTokenFromEmail(sentEmails[0]);
    const setPasswordResponse = await request(app.getHttpServer())
      .post(`${API_V1_PREFIX}/auth/set-password`)
      .send({ token: setPasswordToken, password: "company-admin-pass" })
      .expect(200);

    expect(setPasswordResponse.body.user).toMatchObject({
      email: adminEmail,
      accountType: "company_member",
      status: "active",
    });

    const companySessionCookie = findSetCookie(
      setPasswordResponse.headers["set-cookie"] as string[] | undefined,
      "toonexpo_session",
    );
    const companyCsrfCookie = findSetCookie(
      setPasswordResponse.headers["set-cookie"] as string[] | undefined,
      CSRF_COOKIE_NAME,
    );
    const companyCookieHeader = `${cookiePair(companySessionCookie as string)}; ${cookiePair(companyCsrfCookie as string)}`;
    const companyCsrfToken = setPasswordResponse.body.csrfToken as string;

    const meResponse = await request(app.getHttpServer())
      .get(`${API_V1_PREFIX}/auth/me`)
      .set("Cookie", cookiePair(companySessionCookie as string))
      .expect(200);
    expect(meResponse.body.email).toBe(adminEmail);

    await request(app.getHttpServer())
      .post(`${API_V1_PREFIX}/auth/set-password`)
      .send({ token: setPasswordToken, password: "another-password" })
      .expect(401);

    sentEmails.length = 0;
    const staffEmail = uniqueEmail("staff");
    const invite = await request(app.getHttpServer())
      .post(`${API_V1_PREFIX}/company/members`)
      .set("Cookie", companyCookieHeader)
      .set("Origin", CORS_ORIGIN)
      .set(CSRF_HEADER_NAME, companyCsrfToken)
      .send({
        name: "E2E Staff",
        email: staffEmail,
        role: "member",
      })
      .expect(201);

    createdUserIds.push(invite.body.user.id as string);
    expect(invite.body.user.status).toBe("invited");
    expect(sentEmails).toHaveLength(1);

    const buyerEmail = uniqueEmail("buyer");
    const buyerRegister = await request(app.getHttpServer())
      .post(`${API_V1_PREFIX}/auth/register`)
      .send({
        name: "E2E Buyer",
        email: buyerEmail,
        phone: "+37491119999",
        password: "buyer-password",
      })
      .expect(201);
    createdUserIds.push(buyerRegister.body.user.id as string);

    const buyerSession = findSetCookie(
      buyerRegister.headers["set-cookie"] as string[] | undefined,
      "toonexpo_session",
    );
    const buyerCsrf = findSetCookie(
      buyerRegister.headers["set-cookie"] as string[] | undefined,
      CSRF_COOKIE_NAME,
    );
    const buyerCookieHeader = `${cookiePair(buyerSession as string)}; ${cookiePair(buyerCsrf as string)}`;

    await request(app.getHttpServer())
      .get(`${API_V1_PREFIX}/company/members`)
      .set("Cookie", cookiePair(buyerSession as string))
      .expect(403);

    await request(app.getHttpServer())
      .post(`${API_V1_PREFIX}/admin/companies`)
      .set("Cookie", buyerCookieHeader)
      .set("Origin", CORS_ORIGIN)
      .set(CSRF_HEADER_NAME, buyerRegister.body.csrfToken as string)
      .send({
        name: "Should Fail",
        type: "partner",
        adminName: "Nope",
        adminEmail: uniqueEmail("nope"),
      })
      .expect(403);

    const members = await request(app.getHttpServer())
      .get(`${API_V1_PREFIX}/company/members`)
      .set("Cookie", cookiePair(companySessionCookie as string))
      .expect(200);
    expect(members.body.data.length).toBeGreaterThanOrEqual(2);
  });
});
