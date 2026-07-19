import { ValidationPipe } from '@nestjs/common';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { Test, type TestingModule } from '@nestjs/testing';
import { API_V1_PREFIX } from '@toonexpo/contracts';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { AppModule } from '../src/app.module.js';
import { AllExceptionsFilter } from '../src/common/filters/all-exceptions.filter.js';
import { loadRootEnv } from './load-root-env.js';

const GLOBAL_PREFIX = API_V1_PREFIX.replace(/^\//, '');

describe('Health endpoint (e2e)', () => {
  let app: NestExpressApplication;

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
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/v1/health returns HealthResponse', async () => {
    const response = await request(app.getHttpServer()).get(`${API_V1_PREFIX}/health`).expect(200);

    expect(response.body).toMatchObject({
      status: expect.stringMatching(/^(ok|degraded|error)$/),
      service: expect.stringContaining('toonexpo-api'),
      timestamp: expect.any(String),
    });
    expect(Number.isNaN(Date.parse(response.body.timestamp as string))).toBe(false);
  });
});
