import { ValidationPipe } from '@nestjs/common';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { Test, type TestingModule } from '@nestjs/testing';
import { API_V1_PREFIX } from '@toonexpo/contracts';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { AppModule } from '../src/app.module.js';
import { AllExceptionsFilter } from '../src/common/filters/all-exceptions.filter.js';
import { PrismaService } from '../src/prisma/prisma.service.js';
import {
  type CatalogFixtureIds,
  cleanupCatalogFixtures,
  seedCatalogFixtures,
} from './catalog.e2e.fixtures.js';
import { loadRootEnv } from './load-root-env.js';

const GLOBAL_PREFIX = API_V1_PREFIX.replace(/^\//, '');

describe('Catalog public endpoints (e2e)', () => {
  let app: NestExpressApplication;
  let prisma: PrismaService;
  let fixtures: CatalogFixtureIds;
  const createdEmails: string[] = [];

  beforeAll(async () => {
    process.env['NODE_ENV'] = process.env['NODE_ENV'] ?? 'test';
    loadRootEnv();

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
    app.useGlobalFilters(app.get(AllExceptionsFilter));
    await app.init();

    prisma = app.get(PrismaService);
    fixtures = await seedCatalogFixtures(prisma);
  });

  afterAll(async () => {
    if (createdEmails.length > 0) {
      await prisma.db.user.deleteMany({
        where: { email: { in: createdEmails } },
      });
    }
    await cleanupCatalogFixtures(prisma);
    await app.close();
  });

  it('lists only published projects and supports pagination meta', async () => {
    const response = await request(app.getHttpServer())
      .get(`${API_V1_PREFIX}/projects`)
      .query({ page: 1, pageSize: 10, builderId: fixtures.builderId })
      .expect(200);

    expect(response.body.meta).toMatchObject({
      page: 1,
      pageSize: 10,
    });
    expect(response.body.data.length).toBeGreaterThanOrEqual(1);
    expect(
      response.body.data.some(
        (project: { id: string }) => project.id === fixtures.publishedProjectId,
      ),
    ).toBe(true);
    expect(
      response.body.data.some((project: { id: string }) => project.id === fixtures.draftProjectId),
    ).toBe(false);
  });

  it('filters projects by apartment sales status', async () => {
    const response = await request(app.getHttpServer())
      .get(`${API_V1_PREFIX}/projects`)
      .query({ builderId: fixtures.builderId, salesStatus: 'available' })
      .expect(200);

    expect(
      response.body.data.some(
        (project: { id: string }) => project.id === fixtures.publishedProjectId,
      ),
    ).toBe(true);
  });

  it('returns project detail with buildings and availability', async () => {
    const response = await request(app.getHttpServer())
      .get(`${API_V1_PREFIX}/projects/${fixtures.publishedProjectId}`)
      .expect(200);

    expect(response.body.id).toBe(fixtures.publishedProjectId);
    expect(response.body.buildings.length).toBeGreaterThanOrEqual(1);
    expect(response.body.availability.total).toBeGreaterThanOrEqual(1);
  });

  it('hides draft projects and apartments from public detail routes', async () => {
    await request(app.getHttpServer())
      .get(`${API_V1_PREFIX}/projects/${fixtures.draftProjectId}`)
      .expect(404);

    await request(app.getHttpServer())
      .get(`${API_V1_PREFIX}/apartments/${fixtures.draftApartmentId}`)
      .expect(404);
  });

  it('returns published apartment detail', async () => {
    const response = await request(app.getHttpServer())
      .get(`${API_V1_PREFIX}/apartments/${fixtures.publishedApartmentId}`)
      .expect(200);

    expect(response.body.id).toBe(fixtures.publishedApartmentId);
    expect(response.body.project.id).toBe(fixtures.publishedProjectId);
    expect(response.body.priceCurrency).toBe('AMD');
  });

  it('lists active builders with published project counts', async () => {
    const response = await request(app.getHttpServer())
      .get(`${API_V1_PREFIX}/builders`)
      .expect(200);

    const builder = response.body.find((item: { id: string }) => item.id === fixtures.builderId);
    expect(builder).toMatchObject({
      id: fixtures.builderId,
      name: 'E2E Catalog Builder',
    });
    expect(builder.publishedProjectCount).toBeGreaterThanOrEqual(1);
  });

  it('returns builder profile with published projects', async () => {
    const response = await request(app.getHttpServer())
      .get(`${API_V1_PREFIX}/builders/${fixtures.builderId}`)
      .expect(200);

    expect(response.body).toMatchObject({
      id: fixtures.builderId,
      name: 'E2E Catalog Builder',
    });
    expect(response.body.projects.length).toBeGreaterThanOrEqual(1);
    expect(
      response.body.projects.some(
        (project: { id: string }) => project.id === fixtures.publishedProjectId,
      ),
    ).toBe(true);
  });

  it('returns published building detail', async () => {
    const response = await request(app.getHttpServer())
      .get(`${API_V1_PREFIX}/buildings/${fixtures.catalogBuildingId}`)
      .expect(200);

    expect(response.body.id).toBe(fixtures.catalogBuildingId);
    expect(response.body.project.id).toBe(fixtures.publishedProjectId);
    expect(response.body.floors.length).toBeGreaterThanOrEqual(1);
  });

  it('returns published floor detail', async () => {
    const response = await request(app.getHttpServer())
      .get(`${API_V1_PREFIX}/floors/${fixtures.catalogFloorId}`)
      .expect(200);

    expect(response.body.id).toBe(fixtures.catalogFloorId);
    expect(response.body.building.id).toBe(fixtures.catalogBuildingId);
    expect(response.body.apartments.length).toBeGreaterThanOrEqual(1);
  });

  it('returns localized project text for ?locale=ru with hy fallback', async () => {
    const response = await request(app.getHttpServer())
      .get(`${API_V1_PREFIX}/projects/${fixtures.publishedProjectId}`)
      .query({ locale: 'ru' })
      .expect(200);

    expect(response.body.name).toBe('E2E Опубликованный проект');
    expect(response.body.shortDescription).toBe('Краткое описание на русском');
  });

  it('hides by_request and visible_after_login prices from anonymous callers', async () => {
    const byRequest = await request(app.getHttpServer())
      .get(`${API_V1_PREFIX}/apartments/${fixtures.byRequestApartmentId}`)
      .expect(200);
    expect(byRequest.body.price).toBeNull();
    expect(byRequest.body.priceVisibility).toBe('by_request');

    const afterLogin = await request(app.getHttpServer())
      .get(`${API_V1_PREFIX}/apartments/${fixtures.afterLoginApartmentId}`)
      .expect(200);
    expect(afterLogin.body.price).toBeNull();
    expect(afterLogin.body.priceVisibility).toBe('visible_after_login');

    const publicApt = await request(app.getHttpServer())
      .get(`${API_V1_PREFIX}/apartments/${fixtures.publishedApartmentId}`)
      .expect(200);
    expect(publicApt.body.price).toBe('50000000');
  });

  it('reveals visible_after_login price to authenticated callers but not by_request', async () => {
    const email = `catalog.e2e.${Date.now()}@example.com`;
    createdEmails.push(email);

    const registerResponse = await request(app.getHttpServer())
      .post(`${API_V1_PREFIX}/auth/register`)
      .send({
        name: 'Catalog E2E Buyer',
        email,
        phone: '+37491112233',
        password: 'password123',
      })
      .expect(201);

    const setCookie = registerResponse.headers['set-cookie'] as string[] | undefined;
    const sessionCookie = setCookie?.find((value) =>
      value.startsWith(`${process.env['SESSION_COOKIE_NAME'] ?? 'toonexpo_session'}=`),
    );
    expect(sessionCookie).toBeDefined();
    const cookieHeader = sessionCookie!.split(';')[0] ?? '';

    const afterLogin = await request(app.getHttpServer())
      .get(`${API_V1_PREFIX}/apartments/${fixtures.afterLoginApartmentId}`)
      .set('Cookie', cookieHeader)
      .expect(200);
    expect(afterLogin.body.price).toBe('70000000');

    const byRequest = await request(app.getHttpServer())
      .get(`${API_V1_PREFIX}/apartments/${fixtures.byRequestApartmentId}`)
      .set('Cookie', cookieHeader)
      .expect(200);
    expect(byRequest.body.price).toBeNull();
  });
});
