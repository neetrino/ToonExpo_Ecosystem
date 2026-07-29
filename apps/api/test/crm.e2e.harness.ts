import { ValidationPipe } from '@nestjs/common';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { Test, type TestingModule } from '@nestjs/testing';
import { API_V1_PREFIX, CSRF_COOKIE_NAME } from '@toonexpo/contracts';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { expect } from 'vitest';

import { AppModule } from '../src/app.module.js';
import { AllExceptionsFilter } from '../src/common/filters/all-exceptions.filter.js';
import { PrismaService } from '../src/prisma/prisma.service.js';
import {
  cleanupCrmFixtures,
  CRM_E2E_PASSWORD,
  type CrmFixtureIds,
  seedCrmFixtures,
} from './crm.e2e.fixtures.js';
import { cookiePair, findSetCookie } from './helpers/e2e-http.js';
import { loadRootEnv } from './load-root-env.js';

const GLOBAL_PREFIX = API_V1_PREFIX.replace(/^\//, '');

export type CrmE2eSession = { cookie: string; csrf: string };

export type CrmE2eContext = {
  app: NestExpressApplication;
  prisma: PrismaService;
  fixtures: CrmFixtureIds;
  password: string;
  login: (email: string) => Promise<CrmE2eSession>;
  close: () => Promise<void>;
};

export async function createCrmE2eContext(): Promise<CrmE2eContext> {
  process.env['NODE_ENV'] = process.env['NODE_ENV'] ?? 'test';
  loadRootEnv();

  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication();
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

  const prisma = app.get(PrismaService);
  const password = CRM_E2E_PASSWORD;
  const fixtures = await seedCrmFixtures(prisma, password);
  const sessionCache = new Map<string, CrmE2eSession>();

  const login = async (email: string): Promise<CrmE2eSession> => {
    const cached = sessionCache.get(email);
    if (cached) {
      return cached;
    }

    const response = await request(app.getHttpServer())
      .post(`${API_V1_PREFIX}/auth/login`)
      .send({ email, password })
      .expect(200);

    const session = findSetCookie(
      response.headers['set-cookie'] as string[] | undefined,
      'toonexpo_session',
    );
    const csrfCookie = findSetCookie(
      response.headers['set-cookie'] as string[] | undefined,
      CSRF_COOKIE_NAME,
    );
    expect(session).toBeDefined();
    expect(csrfCookie).toBeDefined();

    const auth = {
      cookie: `${cookiePair(session as string)}; ${cookiePair(csrfCookie as string)}`,
      csrf: response.body.csrfToken as string,
    };
    sessionCache.set(email, auth);
    return auth;
  };

  const close = async (): Promise<void> => {
    await cleanupCrmFixtures(prisma, fixtures.createdCompanyIds, fixtures.createdUserIds);
    await app.close();
  };

  return { app, prisma, fixtures, password, login, close };
}
