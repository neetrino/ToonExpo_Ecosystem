import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { ValidationPipe } from "@nestjs/common";
import type { NestExpressApplication } from "@nestjs/platform-express";
import { Test, type TestingModule } from "@nestjs/testing";
import { API_V1_PREFIX } from "@toonexpo/contracts";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import { AppModule } from "../src/app.module.js";
import { AllExceptionsFilter } from "../src/common/filters/all-exceptions.filter.js";
import { BOS_API_KEY_HEADER } from "../src/common/constants/app.constants.js";
import { EMAIL_SERVICE, type EmailMessage } from "../src/email/email.types.js";
import { PrismaService } from "../src/prisma/prisma.service.js";

const GLOBAL_PREFIX = API_V1_PREFIX.replace(/^\//, "");
const TEST_DIR = fileURLToPath(new URL(".", import.meta.url));
const ROOT_ENV_PATH = resolve(TEST_DIR, "../../../.env");

const uniqueEmail = (suffix: string): string =>
  `bos.e2e.${suffix}.${Date.now()}.${Math.random().toString(16).slice(2)}@example.com`;

const validBody = (overrides: Record<string, unknown> = {}) => ({
  request_id: `req-${Date.now()}-${Math.random().toString(16).slice(2)}`,
  bos_company_id: `bos-${Date.now()}-${Math.random().toString(16).slice(2)}`,
  company_name: "BOS E2E Builder",
  company_type: "builder",
  primary_contact_name: "BOS Primary",
  primary_contact_email: uniqueEmail("primary"),
  requested_modules: ["builder_portal", "constructor_crm"],
  ...overrides,
});

describe("BOS provisioning (e2e)", () => {
  let app: NestExpressApplication;
  let prisma: PrismaService;
  const sentEmails: EmailMessage[] = [];
  const createdRequestIds: string[] = [];
  const createdCompanyIds: string[] = [];
  const createdUserIds: string[] = [];
  let bosApiKey = "";

  beforeAll(async () => {
    process.env["NODE_ENV"] = process.env["NODE_ENV"] ?? "test";
    process.loadEnvFile?.(ROOT_ENV_PATH);
    bosApiKey =
      process.env["BOS_API_KEY"] ??
      "local-bos-test-key-123456789012345678901234567890";
    process.env["BOS_API_KEY"] = bosApiKey;

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
    if (createdRequestIds.length > 0) {
      await prisma.db.integrationAuditLog.deleteMany({
        where: { provisioningRequestId: { in: createdRequestIds } },
      });
      await prisma.db.bosProvisioningRequest.deleteMany({
        where: { id: { in: createdRequestIds } },
      });
    }
    if (createdCompanyIds.length > 0) {
      await prisma.db.companyMember.deleteMany({
        where: { companyId: { in: createdCompanyIds } },
      });
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

  const postProvisioning = (body: Record<string, unknown>, apiKey?: string) =>
    request(app.getHttpServer())
      .post(`${API_V1_PREFIX}/integrations/bos/provisioning`)
      .set(BOS_API_KEY_HEADER, apiKey ?? bosApiKey)
      .send(body);

  it("returns 401 for wrong API key", async () => {
    await postProvisioning(validBody(), "wrong-key-value").expect(401);
  });

  it("rejects invalid requested_modules", async () => {
    await postProvisioning(
      validBody({ requested_modules: ["unknown_module"] }),
    ).expect(400);
  });

  it("provisions account and replays idempotently", async () => {
    sentEmails.length = 0;
    const body = validBody();

    const first = await postProvisioning(body).expect(200);
    const record = await prisma.db.bosProvisioningRequest.findUnique({
      where: { requestId: body.request_id as string },
    });
    expect(record).not.toBeNull();
    createdRequestIds.push(record!.id);
    createdCompanyIds.push(first.body.toonexpo_company_id as string);
    createdUserIds.push(first.body.primary_user_id as string);

    expect(first.body.status).toBe("success");
    expect(sentEmails).toHaveLength(1);

    sentEmails.length = 0;
    const replay = await postProvisioning(body).expect(200);
    expect(replay.body).toEqual(first.body);
    expect(sentEmails).toHaveLength(0);

    const companyCount = await prisma.db.company.count({
      where: { bosCompanyId: body.bos_company_id as string },
    });
    expect(companyCount).toBe(1);
  });

  it("fails when same email is used with a different bos_company_id", async () => {
    const email = uniqueEmail("conflict");
    const firstBody = validBody({
      primary_contact_email: email,
    });
    const first = await postProvisioning(firstBody).expect(200);
    const record = await prisma.db.bosProvisioningRequest.findUnique({
      where: { requestId: firstBody.request_id as string },
    });
    if (record) {
      createdRequestIds.push(record.id);
    }
    createdCompanyIds.push(first.body.toonexpo_company_id as string);
    createdUserIds.push(first.body.primary_user_id as string);

    const conflict = await postProvisioning(
      validBody({
        primary_contact_email: email,
      }),
    ).expect(200);

    expect(conflict.body.status).toBe("failed");
    expect(conflict.body.error_message).toContain("email");
  });
});
