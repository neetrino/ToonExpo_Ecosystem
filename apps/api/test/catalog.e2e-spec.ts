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
  let builderId = "";

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

  async function seedFixtures(): Promise<void> {
    await cleanupFixtures();

    builderId = `${FIXTURE_PREFIX}builder`;
    publishedProjectId = `${FIXTURE_PREFIX}project_published`;
    draftProjectId = `${FIXTURE_PREFIX}project_draft`;
    const buildingId = `${FIXTURE_PREFIX}building`;
    const floorId = `${FIXTURE_PREFIX}floor`;
    publishedApartmentId = `${FIXTURE_PREFIX}apartment_published`;
    draftApartmentId = `${FIXTURE_PREFIX}apartment_draft`;

    await prisma.db.company.create({
      data: {
        id: builderId,
        name: "E2E Catalog Builder",
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
      },
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
  }

  async function cleanupFixtures(): Promise<void> {
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
