import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { ValidationPipe } from "@nestjs/common";
import type { NestExpressApplication } from "@nestjs/platform-express";
import { Test, type TestingModule } from "@nestjs/testing";
import { API_V1_PREFIX } from "@toonexpo/contracts";
import {
  CompanySource,
  CompanyStatus,
  CompanyType,
  PublicationStatus,
  ApartmentSalesStatus,
  PriceVisibility,
  CrmStatusSource,
} from "@toonexpo/db";
import cookieParser from "cookie-parser";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { AppModule } from "../src/app.module.js";
import { AllExceptionsFilter } from "../src/common/filters/all-exceptions.filter.js";
import { PrismaService } from "../src/prisma/prisma.service.js";

const GLOBAL_PREFIX = API_V1_PREFIX.replace(/^\//, "");
const TEST_DIR = fileURLToPath(new URL(".", import.meta.url));
const ROOT_ENV_PATH = resolve(TEST_DIR, "../../../.env");
const FIXTURE_PREFIX = "e2e_catalog_";

describe("Catalog public endpoints (e2e)", () => {
  let app: NestExpressApplication;
  let prisma: PrismaService;
  let publishedProjectId = "";
  let draftProjectId = "";
  let publishedApartmentId = "";
  let draftApartmentId = "";
  let byRequestApartmentId = "";
  let afterLoginApartmentId = "";
  let builderId = "";
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
    await seedFixtures();
  });

  afterAll(async () => {
    if (createdEmails.length > 0) {
      await prisma.db.user.deleteMany({
        where: { email: { in: createdEmails } },
      });
    }
    await cleanupFixtures();
    await app.close();
  });

  it("lists only published projects and supports pagination meta", async () => {
    const response = await request(app.getHttpServer())
      .get(`${API_V1_PREFIX}/projects`)
      .query({ page: 1, pageSize: 10, builderId })
      .expect(200);

    expect(response.body.meta).toMatchObject({
      page: 1,
      pageSize: 10,
    });
    expect(response.body.data.length).toBeGreaterThanOrEqual(1);
    expect(
      response.body.data.some(
        (project: { id: string }) => project.id === publishedProjectId,
      ),
    ).toBe(true);
    expect(
      response.body.data.some(
        (project: { id: string }) => project.id === draftProjectId,
      ),
    ).toBe(false);
  });

  it("filters projects by apartment sales status", async () => {
    const response = await request(app.getHttpServer())
      .get(`${API_V1_PREFIX}/projects`)
      .query({ builderId, salesStatus: "available" })
      .expect(200);

    expect(
      response.body.data.some(
        (project: { id: string }) => project.id === publishedProjectId,
      ),
    ).toBe(true);
  });

  it("returns project detail with buildings and availability", async () => {
    const response = await request(app.getHttpServer())
      .get(`${API_V1_PREFIX}/projects/${publishedProjectId}`)
      .expect(200);

    expect(response.body.id).toBe(publishedProjectId);
    expect(response.body.buildings.length).toBeGreaterThanOrEqual(1);
    expect(response.body.availability.total).toBeGreaterThanOrEqual(1);
  });

  it("hides draft projects and apartments from public detail routes", async () => {
    await request(app.getHttpServer())
      .get(`${API_V1_PREFIX}/projects/${draftProjectId}`)
      .expect(404);

    await request(app.getHttpServer())
      .get(`${API_V1_PREFIX}/apartments/${draftApartmentId}`)
      .expect(404);
  });

  it("returns published apartment detail", async () => {
    const response = await request(app.getHttpServer())
      .get(`${API_V1_PREFIX}/apartments/${publishedApartmentId}`)
      .expect(200);

    expect(response.body.id).toBe(publishedApartmentId);
    expect(response.body.project.id).toBe(publishedProjectId);
    expect(response.body.priceCurrency).toBe("AMD");
  });

  it("lists active builders with published project counts", async () => {
    const response = await request(app.getHttpServer())
      .get(`${API_V1_PREFIX}/builders`)
      .expect(200);

    const builder = response.body.find(
      (item: { id: string }) => item.id === builderId,
    );
    expect(builder).toMatchObject({
      id: builderId,
      name: "E2E Catalog Builder",
    });
    expect(builder.publishedProjectCount).toBeGreaterThanOrEqual(1);
  });

  it("returns localized project text for ?locale=ru with hy fallback", async () => {
    const response = await request(app.getHttpServer())
      .get(`${API_V1_PREFIX}/projects/${publishedProjectId}`)
      .query({ locale: "ru" })
      .expect(200);

    expect(response.body.name).toBe("E2E Опубликованный проект");
    expect(response.body.shortDescription).toBe(
      "Краткое описание на русском",
    );
  });

  it("hides by_request and visible_after_login prices from anonymous callers", async () => {
    const byRequest = await request(app.getHttpServer())
      .get(`${API_V1_PREFIX}/apartments/${byRequestApartmentId}`)
      .expect(200);
    expect(byRequest.body.price).toBeNull();
    expect(byRequest.body.priceVisibility).toBe("by_request");

    const afterLogin = await request(app.getHttpServer())
      .get(`${API_V1_PREFIX}/apartments/${afterLoginApartmentId}`)
      .expect(200);
    expect(afterLogin.body.price).toBeNull();
    expect(afterLogin.body.priceVisibility).toBe("visible_after_login");

    const publicApt = await request(app.getHttpServer())
      .get(`${API_V1_PREFIX}/apartments/${publishedApartmentId}`)
      .expect(200);
    expect(publicApt.body.price).toBe("50000000");
  });

  it("reveals visible_after_login price to authenticated callers but not by_request", async () => {
    const email = `catalog.e2e.${Date.now()}@example.com`;
    createdEmails.push(email);

    const registerResponse = await request(app.getHttpServer())
      .post(`${API_V1_PREFIX}/auth/register`)
      .send({
        name: "Catalog E2E Buyer",
        email,
        phone: "+37491112233",
        password: "password123",
      })
      .expect(201);

    const setCookie = registerResponse.headers["set-cookie"] as
      | string[]
      | undefined;
    const sessionCookie = setCookie?.find((value) =>
      value.startsWith(
        `${process.env["SESSION_COOKIE_NAME"] ?? "toonexpo_session"}=`,
      ),
    );
    expect(sessionCookie).toBeDefined();
    const cookieHeader = sessionCookie!.split(";")[0] ?? "";

    const afterLogin = await request(app.getHttpServer())
      .get(`${API_V1_PREFIX}/apartments/${afterLoginApartmentId}`)
      .set("Cookie", cookieHeader)
      .expect(200);
    expect(afterLogin.body.price).toBe("70000000");

    const byRequest = await request(app.getHttpServer())
      .get(`${API_V1_PREFIX}/apartments/${byRequestApartmentId}`)
      .set("Cookie", cookieHeader)
      .expect(200);
    expect(byRequest.body.price).toBeNull();
  });

  async function seedFixtures(): Promise<void> {
    await cleanupFixtures();

    builderId = `${FIXTURE_PREFIX}builder`;
    publishedProjectId = `${FIXTURE_PREFIX}project_published`;
    draftProjectId = `${FIXTURE_PREFIX}project_draft`;
    const buildingId = `${FIXTURE_PREFIX}building`;
    const floorId = `${FIXTURE_PREFIX}floor`;
    publishedApartmentId = `${FIXTURE_PREFIX}apartment_published`;
    draftApartmentId = `${FIXTURE_PREFIX}apartment_draft`;
    byRequestApartmentId = `${FIXTURE_PREFIX}apartment_by_request`;
    afterLoginApartmentId = `${FIXTURE_PREFIX}apartment_after_login`;

    await prisma.db.company.create({
      data: {
        id: builderId,
        name: "E2E Catalog Builder",
        description: "E2E builder description",
        type: CompanyType.builder,
        status: CompanyStatus.active,
        source: CompanySource.admin,
      },
    });

    await prisma.db.project.create({
      data: {
        id: publishedProjectId,
        builderCompanyId: builderId,
        name: "E2E Published Project",
        slug: `${FIXTURE_PREFIX}published`,
        publicationStatus: PublicationStatus.published,
        city: "Yerevan",
        shortDescription: "Short description in English",
      },
    });

    await prisma.db.translation.createMany({
      data: [
        {
          id: `${FIXTURE_PREFIX}tr_name_hy`,
          entityType: "project",
          entityId: publishedProjectId,
          fieldName: "name",
          locale: "hy",
          value: "E2E Հրապարակված նախագիծ",
        },
        {
          id: `${FIXTURE_PREFIX}tr_name_ru`,
          entityType: "project",
          entityId: publishedProjectId,
          fieldName: "name",
          locale: "ru",
          value: "E2E Опубликованный проект",
        },
        {
          id: `${FIXTURE_PREFIX}tr_name_en`,
          entityType: "project",
          entityId: publishedProjectId,
          fieldName: "name",
          locale: "en",
          value: "E2E Published Project",
        },
        {
          id: `${FIXTURE_PREFIX}tr_short_ru`,
          entityType: "project",
          entityId: publishedProjectId,
          fieldName: "shortDescription",
          locale: "ru",
          value: "Краткое описание на русском",
        },
        {
          id: `${FIXTURE_PREFIX}tr_short_hy`,
          entityType: "project",
          entityId: publishedProjectId,
          fieldName: "shortDescription",
          locale: "hy",
          value: "Կարճ նկարագրություն հայերեն",
        },
      ],
    });

    await prisma.db.project.create({
      data: {
        id: draftProjectId,
        builderCompanyId: builderId,
        name: "E2E Draft Project",
        slug: `${FIXTURE_PREFIX}draft`,
        publicationStatus: PublicationStatus.draft,
        city: "Yerevan",
      },
    });

    await prisma.db.building.create({
      data: {
        id: buildingId,
        projectId: publishedProjectId,
        name: "E2E Building",
        publicationStatus: PublicationStatus.published,
      },
    });

    await prisma.db.floor.create({
      data: {
        id: floorId,
        buildingId,
        number: 1,
        publicationStatus: PublicationStatus.published,
        displayLabel: "Floor 1",
      },
    });

    await prisma.db.apartment.create({
      data: {
        id: publishedApartmentId,
        projectId: publishedProjectId,
        buildingId,
        floorId,
        number: "101",
        salesStatus: ApartmentSalesStatus.available,
        publicationStatus: PublicationStatus.published,
        rooms: 2,
        price: 50_000_000,
        priceCurrency: "AMD",
        priceVisibility: PriceVisibility.public,
        crmStatusSource: CrmStatusSource.manual,
      },
    });

    await prisma.db.apartment.create({
      data: {
        id: draftApartmentId,
        projectId: publishedProjectId,
        buildingId,
        floorId,
        number: "102",
        salesStatus: ApartmentSalesStatus.available,
        publicationStatus: PublicationStatus.draft,
        rooms: 3,
        price: 60_000_000,
        priceCurrency: "AMD",
        priceVisibility: PriceVisibility.public,
        crmStatusSource: CrmStatusSource.manual,
      },
    });

    await prisma.db.apartment.create({
      data: {
        id: byRequestApartmentId,
        projectId: publishedProjectId,
        buildingId,
        floorId,
        number: "103",
        salesStatus: ApartmentSalesStatus.available,
        publicationStatus: PublicationStatus.published,
        rooms: 2,
        price: 65_000_000,
        priceCurrency: "AMD",
        priceVisibility: PriceVisibility.by_request,
        crmStatusSource: CrmStatusSource.manual,
      },
    });

    await prisma.db.apartment.create({
      data: {
        id: afterLoginApartmentId,
        projectId: publishedProjectId,
        buildingId,
        floorId,
        number: "104",
        salesStatus: ApartmentSalesStatus.available,
        publicationStatus: PublicationStatus.published,
        rooms: 3,
        price: 70_000_000,
        priceCurrency: "AMD",
        priceVisibility: PriceVisibility.visible_after_login,
        crmStatusSource: CrmStatusSource.manual,
      },
    });
  }

  async function cleanupFixtures(): Promise<void> {
    await prisma.db.translation.deleteMany({
      where: { id: { startsWith: FIXTURE_PREFIX } },
    });
    await prisma.db.apartment.deleteMany({
      where: { id: { startsWith: FIXTURE_PREFIX } },
    });
    await prisma.db.floor.deleteMany({
      where: { id: { startsWith: FIXTURE_PREFIX } },
    });
    await prisma.db.building.deleteMany({
      where: { id: { startsWith: FIXTURE_PREFIX } },
    });
    await prisma.db.project.deleteMany({
      where: { id: { startsWith: FIXTURE_PREFIX } },
    });
    await prisma.db.company.deleteMany({
      where: { id: { startsWith: FIXTURE_PREFIX } },
    });
  }
});
