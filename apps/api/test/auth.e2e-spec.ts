import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { ValidationPipe } from "@nestjs/common";
import type { NestExpressApplication } from "@nestjs/platform-express";
import { Test, type TestingModule } from "@nestjs/testing";
import { API_V1_PREFIX } from "@toonexpo/contracts";
import cookieParser from "cookie-parser";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { AppModule } from "../src/app.module.js";
import { AllExceptionsFilter } from "../src/common/filters/all-exceptions.filter.js";
import { PrismaService } from "../src/prisma/prisma.service.js";

const GLOBAL_PREFIX = API_V1_PREFIX.replace(/^\//, "");
const TEST_DIR = fileURLToPath(new URL(".", import.meta.url));
const ROOT_ENV_PATH = resolve(TEST_DIR, "../../../.env");
const CORS_ORIGIN = "http://localhost:3000";

const uniqueEmail = (suffix: string): string =>
  `auth.e2e.${suffix}.${Date.now()}.${Math.random().toString(16).slice(2)}@example.com`;

const extractSessionCookie = (
  setCookieHeader: string[] | undefined,
): string | undefined => {
  if (!setCookieHeader) {
    return undefined;
  }

  return setCookieHeader.find((value) => value.startsWith("toonexpo_session="));
};

describe("Auth endpoints (e2e)", () => {
  let app: NestExpressApplication;
  let prisma: PrismaService;
  const createdEmails: string[] = [];

  beforeAll(async () => {
    process.env["NODE_ENV"] = process.env["NODE_ENV"] ?? "test";
    process.loadEnvFile?.(ROOT_ENV_PATH);

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

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
    app.useGlobalFilters(new AllExceptionsFilter());
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

  it("register → login → me → logout happy path", async () => {
    const email = uniqueEmail("happy");
    createdEmails.push(email);
    const password = "password123";

    const registerResponse = await request(app.getHttpServer())
      .post(`${API_V1_PREFIX}/auth/register`)
      .send({
        name: "E2E Buyer",
        email,
        phone: "+37491110001",
        password,
      })
      .expect(201);

    expect(registerResponse.body.user).toMatchObject({
      email,
      role: "buyer",
      name: "E2E Buyer",
    });
    expect(registerResponse.body.user).not.toHaveProperty("passwordHash");

    const registerCookie = extractSessionCookie(
      registerResponse.headers["set-cookie"] as string[] | undefined,
    );
    expect(registerCookie).toBeDefined();

    await request(app.getHttpServer())
      .post(`${API_V1_PREFIX}/auth/logout`)
      .set("Cookie", registerCookie as string)
      .set("Origin", CORS_ORIGIN)
      .expect(204);

    const loginResponse = await request(app.getHttpServer())
      .post(`${API_V1_PREFIX}/auth/login`)
      .send({ email, password })
      .expect(200);

    const loginCookie = extractSessionCookie(
      loginResponse.headers["set-cookie"] as string[] | undefined,
    );
    expect(loginCookie).toBeDefined();

    const meResponse = await request(app.getHttpServer())
      .get(`${API_V1_PREFIX}/auth/me`)
      .set("Cookie", loginCookie as string)
      .expect(200);

    expect(meResponse.body).toMatchObject({
      email,
      role: "buyer",
    });

    await request(app.getHttpServer())
      .post(`${API_V1_PREFIX}/auth/logout`)
      .set("Cookie", loginCookie as string)
      .set("Origin", CORS_ORIGIN)
      .expect(204);

    await request(app.getHttpServer())
      .get(`${API_V1_PREFIX}/auth/me`)
      .set("Cookie", loginCookie as string)
      .expect(401);
  });

  it("rejects wrong password with the same generic error", async () => {
    const email = uniqueEmail("wrong-pass");
    createdEmails.push(email);

    await request(app.getHttpServer())
      .post(`${API_V1_PREFIX}/auth/register`)
      .send({
        name: "Wrong Pass",
        email,
        phone: "+37491110002",
        password: "password123",
      })
      .expect(201);

    const response = await request(app.getHttpServer())
      .post(`${API_V1_PREFIX}/auth/login`)
      .send({ email, password: "wrong-password" })
      .expect(401);

    expect(response.body.message).toBe("Invalid email or password");
  });

  it("rejects duplicate email registration", async () => {
    const email = uniqueEmail("duplicate");
    createdEmails.push(email);
    const payload = {
      name: "Dup User",
      email,
      phone: "+37491110003",
      password: "password123",
    };

    await request(app.getHttpServer())
      .post(`${API_V1_PREFIX}/auth/register`)
      .send(payload)
      .expect(201);

    const duplicate = await request(app.getHttpServer())
      .post(`${API_V1_PREFIX}/auth/register`)
      .send(payload)
      .expect(409);

    expect(duplicate.body.message).toBe("Email is already registered");
  });

  it("rejects /auth/me without a session cookie", async () => {
    await request(app.getHttpServer())
      .get(`${API_V1_PREFIX}/auth/me`)
      .expect(401);
  });
});
