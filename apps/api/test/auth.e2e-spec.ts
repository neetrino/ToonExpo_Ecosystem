import { ValidationPipe } from '@nestjs/common';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { Test, type TestingModule } from '@nestjs/testing';
import { API_V1_PREFIX, CSRF_COOKIE_NAME, CSRF_HEADER_NAME } from '@toonexpo/contracts';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { AppModule } from '../src/app.module.js';
import { AllExceptionsFilter } from '../src/common/filters/all-exceptions.filter.js';
import { PrismaService } from '../src/prisma/prisma.service.js';
import { loadRootEnv } from './load-root-env.js';

const GLOBAL_PREFIX = API_V1_PREFIX.replace(/^\//, '');
const CORS_ORIGIN = 'http://localhost:3000';

const uniqueEmail = (suffix: string): string =>
  `auth.e2e.${suffix}.${Date.now()}.${Math.random().toString(16).slice(2)}@example.com`;

const findSetCookie = (setCookieHeader: string[] | undefined, name: string): string | undefined => {
  if (!setCookieHeader) {
    return undefined;
  }

  return setCookieHeader.find((value) => value.startsWith(`${name}=`));
};

const cookiePair = (setCookie: string): string => setCookie.split(';')[0] ?? '';

const cookieValue = (setCookie: string): string => {
  const pair = cookiePair(setCookie);
  const separatorIndex = pair.indexOf('=');
  return separatorIndex >= 0 ? pair.slice(separatorIndex + 1) : '';
};

describe('Auth endpoints (e2e)', () => {
  let app: NestExpressApplication;
  let prisma: PrismaService;
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
  });

  afterAll(async () => {
    if (createdEmails.length > 0) {
      await prisma.db.user.deleteMany({
        where: { email: { in: createdEmails } },
      });
    }
    await app.close();
  });

  it('register → login → me → logout happy path', async () => {
    const email = uniqueEmail('happy');
    createdEmails.push(email);
    const password = 'password123';

    const registerResponse = await request(app.getHttpServer())
      .post(`${API_V1_PREFIX}/auth/register`)
      .send({
        name: 'E2E Buyer',
        email,
        phone: '+37491110001',
        password,
      })
      .expect(201);

    expect(registerResponse.body.user).toMatchObject({
      email,
      accountType: 'buyer',
      name: 'E2E Buyer',
    });
    expect(registerResponse.body.csrfToken).toEqual(expect.any(String));
    expect(registerResponse.body.user).not.toHaveProperty('passwordHash');

    const registerSession = findSetCookie(
      registerResponse.headers['set-cookie'] as string[] | undefined,
      'toonexpo_session',
    );
    const registerCsrf = findSetCookie(
      registerResponse.headers['set-cookie'] as string[] | undefined,
      CSRF_COOKIE_NAME,
    );
    expect(registerSession).toBeDefined();
    expect(registerCsrf).toBeDefined();

    await request(app.getHttpServer())
      .post(`${API_V1_PREFIX}/auth/logout`)
      .set(
        'Cookie',
        `${cookiePair(registerSession as string)}; ${cookiePair(registerCsrf as string)}`,
      )
      .set('Origin', CORS_ORIGIN)
      .set(CSRF_HEADER_NAME, registerResponse.body.csrfToken as string)
      .expect(204);

    const loginResponse = await request(app.getHttpServer())
      .post(`${API_V1_PREFIX}/auth/login`)
      .send({ email, password })
      .expect(200);

    const loginSession = findSetCookie(
      loginResponse.headers['set-cookie'] as string[] | undefined,
      'toonexpo_session',
    );
    const loginCsrf = findSetCookie(
      loginResponse.headers['set-cookie'] as string[] | undefined,
      CSRF_COOKIE_NAME,
    );
    expect(loginSession).toBeDefined();
    expect(loginCsrf).toBeDefined();
    expect(loginResponse.body.csrfToken).toEqual(expect.any(String));

    const meResponse = await request(app.getHttpServer())
      .get(`${API_V1_PREFIX}/auth/me`)
      .set('Cookie', cookiePair(loginSession as string))
      .expect(200);

    expect(meResponse.body).toMatchObject({
      email,
      accountType: 'buyer',
    });

    await request(app.getHttpServer())
      .post(`${API_V1_PREFIX}/auth/logout`)
      .set('Cookie', `${cookiePair(loginSession as string)}; ${cookiePair(loginCsrf as string)}`)
      .set('Origin', CORS_ORIGIN)
      .set(CSRF_HEADER_NAME, loginResponse.body.csrfToken as string)
      .expect(204);

    await request(app.getHttpServer())
      .get(`${API_V1_PREFIX}/auth/me`)
      .set('Cookie', cookiePair(loginSession as string))
      .expect(204);
  });

  it('rejects authenticated mutations without or with invalid CSRF tokens', async () => {
    const email = uniqueEmail('csrf');
    createdEmails.push(email);

    const registerResponse = await request(app.getHttpServer())
      .post(`${API_V1_PREFIX}/auth/register`)
      .send({
        name: 'CSRF Buyer',
        email,
        phone: '+37491110004',
        password: 'password123',
      })
      .expect(201);

    const sessionCookie = findSetCookie(
      registerResponse.headers['set-cookie'] as string[] | undefined,
      'toonexpo_session',
    );
    const csrfCookie = findSetCookie(
      registerResponse.headers['set-cookie'] as string[] | undefined,
      CSRF_COOKIE_NAME,
    );
    const csrfToken = registerResponse.body.csrfToken as string;
    const cookieHeader = `${cookiePair(sessionCookie as string)}; ${cookiePair(csrfCookie as string)}`;

    await request(app.getHttpServer())
      .post(`${API_V1_PREFIX}/auth/logout`)
      .set('Cookie', cookieHeader)
      .set('Origin', CORS_ORIGIN)
      .expect(403);

    await request(app.getHttpServer())
      .post(`${API_V1_PREFIX}/auth/logout`)
      .set('Cookie', cookieHeader)
      .set('Origin', CORS_ORIGIN)
      .set(CSRF_HEADER_NAME, 'totally-invalid-csrf-token-value')
      .expect(403);

    await request(app.getHttpServer())
      .post(`${API_V1_PREFIX}/auth/logout`)
      .set('Cookie', cookieHeader)
      .set('Origin', CORS_ORIGIN)
      .set(CSRF_HEADER_NAME, csrfToken)
      .expect(204);

    expect(cookieValue(csrfCookie as string)).toBe(csrfToken);
  });

  it('rejects login with a foreign Origin and allows login without Origin', async () => {
    const email = uniqueEmail('origin');
    createdEmails.push(email);
    const password = 'password123';

    await request(app.getHttpServer())
      .post(`${API_V1_PREFIX}/auth/register`)
      .send({
        name: 'Origin Buyer',
        email,
        phone: '+37491110005',
        password,
      })
      .expect(201);

    await request(app.getHttpServer())
      .post(`${API_V1_PREFIX}/auth/login`)
      .set('Origin', 'https://evil.example.com')
      .send({ email, password })
      .expect(403);

    await request(app.getHttpServer())
      .post(`${API_V1_PREFIX}/auth/login`)
      .set('Origin', CORS_ORIGIN)
      .send({ email, password })
      .expect(200);

    await request(app.getHttpServer())
      .post(`${API_V1_PREFIX}/auth/login`)
      .send({ email, password })
      .expect(200);
  });

  it('rejects wrong password with the same generic error', async () => {
    const email = uniqueEmail('wrong-pass');
    createdEmails.push(email);

    await request(app.getHttpServer())
      .post(`${API_V1_PREFIX}/auth/register`)
      .send({
        name: 'Wrong Pass',
        email,
        phone: '+37491110002',
        password: 'password123',
      })
      .expect(201);

    const response = await request(app.getHttpServer())
      .post(`${API_V1_PREFIX}/auth/login`)
      .send({ email, password: 'wrong-password' })
      .expect(401);

    expect(response.body.message).toBe('Invalid email or password');
  });

  it('rejects duplicate email registration', async () => {
    const email = uniqueEmail('duplicate');
    createdEmails.push(email);
    const payload = {
      name: 'Dup User',
      email,
      phone: '+37491110003',
      password: 'password123',
    };

    await request(app.getHttpServer())
      .post(`${API_V1_PREFIX}/auth/register`)
      .send(payload)
      .expect(201);

    const duplicate = await request(app.getHttpServer())
      .post(`${API_V1_PREFIX}/auth/register`)
      .send(payload)
      .expect(409);

    expect(duplicate.body.message).toBe('Email is already registered');
  });

  it('returns 204 for /auth/me without a session cookie', async () => {
    await request(app.getHttpServer()).get(`${API_V1_PREFIX}/auth/me`).expect(204);
  });
});
