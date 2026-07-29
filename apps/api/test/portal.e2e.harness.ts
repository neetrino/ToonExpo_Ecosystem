import { ValidationPipe } from '@nestjs/common';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { Test, type TestingModule } from '@nestjs/testing';
import { API_V1_PREFIX, CSRF_COOKIE_NAME, CSRF_HEADER_NAME } from '@toonexpo/contracts';
import cookieParser from 'cookie-parser';
import request from 'supertest';

import { AppModule } from '../src/app.module.js';
import { AllExceptionsFilter } from '../src/common/filters/all-exceptions.filter.js';
import { PrismaService } from '../src/prisma/prisma.service.js';
import { cookiePair, findSetCookie } from './helpers/e2e-http.js';
import { loadRootEnv } from './load-root-env.js';
import {
  cleanupPortalFixtures,
  PORTAL_E2E_PASSWORD,
  type PortalFixtureIds,
  seedPortalFixtures,
} from './portal.e2e.fixtures.js';

const GLOBAL_PREFIX = API_V1_PREFIX.replace(/^\//, '');
export const PORTAL_CORS_ORIGIN = 'http://localhost:3000';

export type PortalE2eSession = { cookieHeader: string; csrfToken: string };

export type PortalE2eContext = {
  app: NestExpressApplication;
  prisma: PrismaService;
  fixtures: PortalFixtureIds;
  password: string;
  createdProjectIds: string[];
  loginAs: (email: string) => Promise<PortalE2eSession>;
  authHeaders: (session: PortalE2eSession) => Record<string, string>;
  close: () => Promise<void>;
};

export async function createPortalE2eContext(): Promise<PortalE2eContext> {
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
  const password = PORTAL_E2E_PASSWORD;
  const fixtures = await seedPortalFixtures(prisma, password);
  const createdProjectIds: string[] = [];

  const loginAs = async (email: string): Promise<PortalE2eSession> => {
    const response = await request(app.getHttpServer())
      .post(`${API_V1_PREFIX}/auth/login`)
      .send({ email, password })
      .expect(200);

    const session = findSetCookie(
      response.headers['set-cookie'] as string[] | undefined,
      'toonexpo_session',
    );
    const csrf = findSetCookie(
      response.headers['set-cookie'] as string[] | undefined,
      CSRF_COOKIE_NAME,
    );

    return {
      cookieHeader: `${cookiePair(session as string)}; ${cookiePair(csrf as string)}`,
      csrfToken: response.body.csrfToken as string,
    };
  };

  const authHeaders = (session: PortalE2eSession): Record<string, string> => ({
    Cookie: session.cookieHeader,
    Origin: PORTAL_CORS_ORIGIN,
    [CSRF_HEADER_NAME]: session.csrfToken,
  });

  const close = async (): Promise<void> => {
    await cleanupPortalFixtures(
      prisma,
      createdProjectIds,
      fixtures.createdCompanyIds,
      fixtures.createdUserIds,
    );
    await app.close();
  };

  return { app, prisma, fixtures, password, createdProjectIds, loginAs, authHeaders, close };
}
