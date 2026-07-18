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
import {
  AccountType,
  CompanyMemberRole,
  CompanyMemberStatus,
  CompanySource,
  CompanyStatus,
  CompanyType,
  UserStatus,
} from "@toonexpo/db";
import cookieParser from "cookie-parser";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { AppModule } from "../src/app.module.js";
import { hashPassword } from "../src/auth/utils/password.util.js";
import { AllExceptionsFilter } from "../src/common/filters/all-exceptions.filter.js";
import { PrismaService } from "../src/prisma/prisma.service.js";

const GLOBAL_PREFIX = API_V1_PREFIX.replace(/^\//, "");
const TEST_DIR = fileURLToPath(new URL(".", import.meta.url));
const ROOT_ENV_PATH = resolve(TEST_DIR, "../../../.env");
const CORS_ORIGIN = "http://localhost:3000";
const FIXTURE_PREFIX = "e2e_portal_";

const uniqueEmail = (suffix: string): string =>
  `${FIXTURE_PREFIX}${suffix}.${Date.now()}.${Math.random().toString(16).slice(2)}@example.com`;

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

describe("Builder portal inventory CRUD (e2e)", () => {
  let app: NestExpressApplication;
  let prisma: PrismaService;

  let companyAId = "";
  let companyBId = "";
  let adminAEmail = "";
  let memberAEmail = "";
  let adminBEmail = "";
  const password = "portal-e2e-pass-123";
  const createdUserIds: string[] = [];
  const createdCompanyIds: string[] = [];
  const createdProjectIds: string[] = [];

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
    await seedUsers();
  });

  afterAll(async () => {
    if (createdProjectIds.length > 0) {
      await prisma.db.project.deleteMany({
        where: { id: { in: createdProjectIds } },
      });
    }
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

  const loginAs = async (email: string) => {
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
    };
  };

  const authHeaders = (session: {
    cookieHeader: string;
    csrfToken: string;
  }) => ({
    Cookie: session.cookieHeader,
    Origin: CORS_ORIGIN,
    [CSRF_HEADER_NAME]: session.csrfToken,
  });

  it("creates project→building→floor→apartments; draft hidden publicly", async () => {
    const admin = await loginAs(adminAEmail);

    const projectRes = await request(app.getHttpServer())
      .post(`${API_V1_PREFIX}/portal/projects`)
      .set(authHeaders(admin))
      .send({
        name: "Portal E2E Tower",
        city: "Yerevan",
        translations: {
          name: { en: "Portal E2E Tower EN", ru: "Башня E2E" },
          shortDescription: { en: "Short EN" },
        },
      })
      .expect(201);

    const projectId = projectRes.body.id as string;
    createdProjectIds.push(projectId);
    expect(projectRes.body.publicationStatus).toBe("draft");
    expect(projectRes.body.builderCompanyId).toBe(companyAId);
    expect(projectRes.body.translations?.name?.en).toBe("Portal E2E Tower EN");
    expect(projectRes.body.translations?.name?.ru).toBe("Башня E2E");
    expect(projectRes.body.translations?.shortDescription?.en).toBe("Short EN");

    const projectGet = await request(app.getHttpServer())
      .get(`${API_V1_PREFIX}/portal/projects/${projectId}`)
      .set("Cookie", admin.cookieHeader)
      .expect(200);
    expect(projectGet.body.translations?.name?.en).toBe("Portal E2E Tower EN");
    expect(projectGet.body.translations?.name?.ru).toBe("Башня E2E");
    expect(projectGet.body.translations?.shortDescription?.en).toBe("Short EN");

    const buildingRes = await request(app.getHttpServer())
      .post(`${API_V1_PREFIX}/portal/projects/${projectId}/buildings`)
      .set(authHeaders(admin))
      .send({ name: "Building A", displayOrder: 1 })
      .expect(201);

    const buildingId = buildingRes.body.id as string;

    const floorRes = await request(app.getHttpServer())
      .post(`${API_V1_PREFIX}/portal/buildings/${buildingId}/floors`)
      .set(authHeaders(admin))
      .send({ floorNumber: 3, name: "Floor 3" })
      .expect(201);

    const floorId = floorRes.body.id as string;

    const bulkRes = await request(app.getHttpServer())
      .post(`${API_V1_PREFIX}/portal/floors/${floorId}/apartments/bulk`)
      .set(authHeaders(admin))
      .send({
        apartments: [
          { number: "301", rooms: 2, price: 45_000_000, priceVisibility: "public" },
          { number: "302", rooms: 3, price: 62_000_000, priceVisibility: "by_request" },
        ],
      })
      .expect(201);

    expect(bulkRes.body).toHaveLength(2);

    await request(app.getHttpServer())
      .get(`${API_V1_PREFIX}/projects`)
      .query({ builderId: companyAId })
      .expect(200)
      .expect((res) => {
        expect(
          res.body.data.some((p: { id: string }) => p.id === projectId),
        ).toBe(false);
      });

    await request(app.getHttpServer())
      .get(`${API_V1_PREFIX}/projects/${projectId}`)
      .expect(404);
  });

  it("returns 404 for foreign company entities", async () => {
    const adminA = await loginAs(adminAEmail);
    const adminB = await loginAs(adminBEmail);

    const projectRes = await request(app.getHttpServer())
      .post(`${API_V1_PREFIX}/portal/projects`)
      .set(authHeaders(adminA))
      .send({ name: "Company A Private" })
      .expect(201);

    const projectId = projectRes.body.id as string;
    createdProjectIds.push(projectId);

    await request(app.getHttpServer())
      .get(`${API_V1_PREFIX}/portal/projects/${projectId}`)
      .set("Cookie", adminB.cookieHeader)
      .expect(404);

    await request(app.getHttpServer())
      .patch(`${API_V1_PREFIX}/portal/projects/${projectId}`)
      .set(authHeaders(adminB))
      .send({ name: "Hijack" })
      .expect(404);
  });

  it("allows member write but blocks publish/delete for member", async () => {
    const admin = await loginAs(adminAEmail);
    const member = await loginAs(memberAEmail);

    const projectRes = await request(app.getHttpServer())
      .post(`${API_V1_PREFIX}/portal/projects`)
      .set(authHeaders(member))
      .send({ name: "Member Created Draft" })
      .expect(201);

    const projectId = projectRes.body.id as string;
    createdProjectIds.push(projectId);

    await request(app.getHttpServer())
      .patch(`${API_V1_PREFIX}/portal/projects/${projectId}`)
      .set(authHeaders(member))
      .send({ city: "Gyumri" })
      .expect(200);

    await request(app.getHttpServer())
      .patch(`${API_V1_PREFIX}/portal/projects/${projectId}/publication`)
      .set(authHeaders(member))
      .send({ publicationStatus: "published" })
      .expect(403);

    await request(app.getHttpServer())
      .delete(`${API_V1_PREFIX}/portal/projects/${projectId}`)
      .set(authHeaders(member))
      .expect(403);

    await request(app.getHttpServer())
      .patch(`${API_V1_PREFIX}/portal/projects/${projectId}/publication`)
      .set(authHeaders(admin))
      .send({ publicationStatus: "published" })
      .expect(200);

    await request(app.getHttpServer())
      .get(`${API_V1_PREFIX}/projects/${projectId}`)
      .expect(200);

    await request(app.getHttpServer())
      .patch(`${API_V1_PREFIX}/portal/projects/${projectId}/publication`)
      .set(authHeaders(admin))
      .send({ publicationStatus: "draft" })
      .expect(200);

    await request(app.getHttpServer())
      .delete(`${API_V1_PREFIX}/portal/projects/${projectId}`)
      .set(authHeaders(admin))
      .expect(204);

    createdProjectIds.splice(createdProjectIds.indexOf(projectId), 1);
  });

  it("records apartment sales status history on change", async () => {
    const admin = await loginAs(adminAEmail);

    const projectRes = await request(app.getHttpServer())
      .post(`${API_V1_PREFIX}/portal/projects`)
      .set(authHeaders(admin))
      .send({ name: "Status History Project" })
      .expect(201);
    const projectId = projectRes.body.id as string;
    createdProjectIds.push(projectId);

    const buildingRes = await request(app.getHttpServer())
      .post(`${API_V1_PREFIX}/portal/projects/${projectId}/buildings`)
      .set(authHeaders(admin))
      .send({ name: "B1" })
      .expect(201);

    const floorRes = await request(app.getHttpServer())
      .post(
        `${API_V1_PREFIX}/portal/buildings/${buildingRes.body.id as string}/floors`,
      )
      .set(authHeaders(admin))
      .send({ floorNumber: 1 })
      .expect(201);

    const aptRes = await request(app.getHttpServer())
      .post(
        `${API_V1_PREFIX}/portal/floors/${floorRes.body.id as string}/apartments`,
      )
      .set(authHeaders(admin))
      .send({
        number: "101",
        price: 10_000_000,
        translations: {
          description: { en: "Bright EN", ru: "Светлая RU" },
        },
      })
      .expect(201);

    const apartmentId = aptRes.body.id as string;

    const aptGet = await request(app.getHttpServer())
      .get(`${API_V1_PREFIX}/portal/apartments/${apartmentId}`)
      .set("Cookie", admin.cookieHeader)
      .expect(200);
    expect(aptGet.body.translations?.description?.en).toBe("Bright EN");
    expect(aptGet.body.translations?.description?.ru).toBe("Светлая RU");

    await request(app.getHttpServer())
      .patch(`${API_V1_PREFIX}/portal/apartments/${apartmentId}`)
      .set(authHeaders(admin))
      .send({
        salesStatus: "reserved",
        statusChangeReason: "Buyer hold",
      })
      .expect(200);

    const history = await prisma.db.apartmentStatusHistory.findMany({
      where: { apartmentId },
      orderBy: { createdAt: "asc" },
    });

    expect(history.length).toBeGreaterThanOrEqual(2);
    const last = history[history.length - 1]!;
    expect(last.previousStatus).toBe("available");
    expect(last.newStatus).toBe("reserved");
    expect(last.reason).toBe("Buyer hold");
    expect(last.changedByUserId).toBeTruthy();
  });

  it("returns company profile for member and company_admin", async () => {
    const admin = await loginAs(adminAEmail);
    const member = await loginAs(memberAEmail);

    const adminProfile = await request(app.getHttpServer())
      .get(`${API_V1_PREFIX}/company/me`)
      .set("Cookie", admin.cookieHeader)
      .expect(200);
    expect(adminProfile.body.id).toBe(companyAId);
    expect(adminProfile.body.name).toBe(`${FIXTURE_PREFIX}Company A`);
    expect(adminProfile.body.type).toBe("builder");
    expect(adminProfile.body.status).toBe("active");
    expect(adminProfile.body.role).toBe("company_admin");
    expect(adminProfile.body).toHaveProperty("logoUrl");

    const memberProfile = await request(app.getHttpServer())
      .get(`${API_V1_PREFIX}/company/me`)
      .set("Cookie", member.cookieHeader)
      .expect(200);
    expect(memberProfile.body.id).toBe(companyAId);
    expect(memberProfile.body.role).toBe("member");
  });

  it("allows member to list team but blocks invite", async () => {
    const member = await loginAs(memberAEmail);

    const listRes = await request(app.getHttpServer())
      .get(`${API_V1_PREFIX}/company/members`)
      .set("Cookie", member.cookieHeader)
      .expect(200);
    expect(listRes.body.data.length).toBeGreaterThanOrEqual(2);

    await request(app.getHttpServer())
      .post(`${API_V1_PREFIX}/company/members`)
      .set(authHeaders(member))
      .send({
        name: "Should Fail",
        email: uniqueEmail("blocked-invite"),
        role: "member",
      })
      .expect(403);
  });

  async function seedUsers(): Promise<void> {
    const passwordHash = await hashPassword(password);

    const companyA = await prisma.db.company.create({
      data: {
        name: `${FIXTURE_PREFIX}Company A`,
        type: CompanyType.builder,
        status: CompanyStatus.active,
        source: CompanySource.admin,
      },
    });
    companyAId = companyA.id;
    createdCompanyIds.push(companyA.id);

    const companyB = await prisma.db.company.create({
      data: {
        name: `${FIXTURE_PREFIX}Company B`,
        type: CompanyType.builder,
        status: CompanyStatus.active,
        source: CompanySource.admin,
      },
    });
    companyBId = companyB.id;
    createdCompanyIds.push(companyB.id);

    adminAEmail = uniqueEmail("admin-a");
    memberAEmail = uniqueEmail("member-a");
    adminBEmail = uniqueEmail("admin-b");

    const adminA = await prisma.db.user.create({
      data: {
        name: "Portal Admin A",
        email: adminAEmail,
        passwordHash,
        accountType: AccountType.company_member,
        status: UserStatus.active,
        companyMembership: {
          create: {
            companyId: companyAId,
            role: CompanyMemberRole.company_admin,
            status: CompanyMemberStatus.active,
            joinedAt: new Date(),
          },
        },
      },
    });
    createdUserIds.push(adminA.id);

    const memberA = await prisma.db.user.create({
      data: {
        name: "Portal Member A",
        email: memberAEmail,
        passwordHash,
        accountType: AccountType.company_member,
        status: UserStatus.active,
        companyMembership: {
          create: {
            companyId: companyAId,
            role: CompanyMemberRole.member,
            status: CompanyMemberStatus.active,
            joinedAt: new Date(),
          },
        },
      },
    });
    createdUserIds.push(memberA.id);

    const adminB = await prisma.db.user.create({
      data: {
        name: "Portal Admin B",
        email: adminBEmail,
        passwordHash,
        accountType: AccountType.company_member,
        status: UserStatus.active,
        companyMembership: {
          create: {
            companyId: companyBId,
            role: CompanyMemberRole.company_admin,
            status: CompanyMemberStatus.active,
            joinedAt: new Date(),
          },
        },
      },
    });
    createdUserIds.push(adminB.id);
  }
});
