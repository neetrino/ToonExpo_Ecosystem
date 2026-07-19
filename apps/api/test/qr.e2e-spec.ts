import { ValidationPipe } from '@nestjs/common';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { Test, type TestingModule } from '@nestjs/testing';
import { API_V1_PREFIX, CSRF_COOKIE_NAME, CSRF_HEADER_NAME } from '@toonexpo/contracts';
import {
  AccountType,
  CompanyMemberRole,
  CompanyMemberStatus,
  CompanySource,
  CompanyStatus,
  CompanyType,
  QrCodeStatus,
  UserStatus,
  decryptQrToken,
} from '@toonexpo/db';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { AppModule } from '../src/app.module.js';
import { hashPassword } from '../src/auth/utils/password.util.js';
import { AllExceptionsFilter } from '../src/common/filters/all-exceptions.filter.js';
import { QrCodesService } from '../src/qr/qr-codes.service.js';
import { PrismaService } from '../src/prisma/prisma.service.js';
import { loadRootEnv } from './load-root-env.js';

const GLOBAL_PREFIX = API_V1_PREFIX.replace(/^\//, '');
const CORS_ORIGIN = 'http://localhost:3000';
const FIXTURE_PREFIX = 'e2e_qr_';

const uniqueEmail = (suffix: string): string =>
  `${FIXTURE_PREFIX}${suffix}.${Date.now()}.${Math.random().toString(16).slice(2)}@example.com`;

const findSetCookie = (setCookieHeader: string[] | undefined, name: string): string | undefined => {
  if (!setCookieHeader) {
    return undefined;
  }
  return setCookieHeader.find((value) => value.startsWith(`${name}=`));
};

const cookiePair = (setCookie: string): string => setCookie.split(';')[0] ?? '';

describe('Buyer QR system (e2e)', () => {
  let app: NestExpressApplication;
  let prisma: PrismaService;
  let pepper = '';

  let buyerEmail = '';
  let builderEmail = '';
  let companyId = '';
  let buyerUserId = '';
  let qrCodeId = '';
  let rawToken = '';
  const password = 'qr-e2e-pass-123';
  const createdUserIds: string[] = [];
  const createdCompanyIds: string[] = [];

  beforeAll(async () => {
    process.env['NODE_ENV'] = process.env['NODE_ENV'] ?? 'test';
    loadRootEnv();
    pepper = process.env['SESSION_TOKEN_PEPPER'] ?? '';

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
    await seedFixtures();
  });

  afterAll(async () => {
    if (createdUserIds.length > 0) {
      await prisma.db.user.deleteMany({
        where: { id: { in: createdUserIds } },
      });
    }
    if (createdCompanyIds.length > 0) {
      await prisma.db.company.deleteMany({
        where: { id: { in: createdCompanyIds } },
      });
    }
    await app.close();
  });

  const login = async (email: string): Promise<{ cookie: string; csrf: string }> => {
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

    return {
      cookie: `${cookiePair(session as string)}; ${cookiePair(csrfCookie as string)}`,
      csrf: response.body.csrfToken as string,
    };
  };

  it('buyer receives permanent QR payload after registration', async () => {
    const email = uniqueEmail('reg');
    const registerResponse = await request(app.getHttpServer())
      .post(`${API_V1_PREFIX}/auth/register`)
      .send({
        name: 'QR Reg Buyer',
        email,
        phone: '+37491112233',
        password,
      })
      .expect(201);

    createdUserIds.push(registerResponse.body.user.id as string);
    const session = findSetCookie(
      registerResponse.headers['set-cookie'] as string[] | undefined,
      'toonexpo_session',
    );

    const qrResponse = await request(app.getHttpServer())
      .get(`${API_V1_PREFIX}/buyer/qr`)
      .set('Cookie', cookiePair(session as string))
      .expect(200);

    expect(qrResponse.body.payloadUrl).toMatch(/^http:\/\/localhost:3000\/qr\//);
    expect(qrResponse.body.status).toBe('active');
    expect(qrResponse.body).not.toHaveProperty('tokenHash');
  });

  it('builder resolve returns buyer action payload and writes scan event', async () => {
    const auth = await login(builderEmail);

    const resolveResponse = await request(app.getHttpServer())
      .post(`${API_V1_PREFIX}/qr/resolve`)
      .set('Cookie', auth.cookie)
      .set('Origin', CORS_ORIGIN)
      .set(CSRF_HEADER_NAME, auth.csrf)
      .send({ token: rawToken })
      .expect(200);

    expect(resolveResponse.body).toMatchObject({
      kind: 'buyer_action',
      buyerId: buyerUserId,
      name: 'QR E2E Buyer',
      phone: '+37491110099',
      email: buyerEmail,
      scannerCompanyId: companyId,
    });
    expect(resolveResponse.body.scanEventId).toEqual(expect.any(String));

    const event = await prisma.db.qrScanEvent.findUnique({
      where: { id: resolveResponse.body.scanEventId as string },
    });
    expect(event).toMatchObject({
      qrCodeId,
      scanContext: 'builder_scan',
      resultStatus: 'resolved',
      scannerCompanyId: companyId,
    });
  });

  it('anonymous resolve does not expose personal data', async () => {
    const resolveResponse = await request(app.getHttpServer())
      .post(`${API_V1_PREFIX}/qr/resolve`)
      .send({ token: rawToken })
      .expect(404);

    expect(resolveResponse.body).not.toHaveProperty('name');
    expect(resolveResponse.body).not.toHaveProperty('phone');
    expect(resolveResponse.body).not.toHaveProperty('email');

    const unauthorizedEvents = await prisma.db.qrScanEvent.findMany({
      where: {
        qrCodeId,
        resultStatus: 'unauthorized',
        scannerUserId: null,
      },
    });
    expect(unauthorizedEvents.length).toBeGreaterThan(0);
  });

  it('blocked QR returns 404', async () => {
    await prisma.db.qrCode.update({
      where: { id: qrCodeId },
      data: { status: QrCodeStatus.blocked, blockedAt: new Date() },
    });

    await request(app.getHttpServer())
      .post(`${API_V1_PREFIX}/qr/resolve`)
      .send({ token: rawToken })
      .expect(404);

    await prisma.db.qrCode.update({
      where: { id: qrCodeId },
      data: { status: QrCodeStatus.active, blockedAt: null },
    });
  });

  it('buyer scan history shows company name not employee identity', async () => {
    const auth = await login(buyerEmail);

    const historyResponse = await request(app.getHttpServer())
      .get(`${API_V1_PREFIX}/buyer/qr/scans`)
      .set('Cookie', auth.cookie)
      .expect(200);

    expect(Array.isArray(historyResponse.body.data)).toBe(true);
    expect(historyResponse.body.data.length).toBeGreaterThan(0);

    const builderScan = historyResponse.body.data.find(
      (row: { scanContext: string }) => row.scanContext === 'builder_scan',
    );
    expect(builderScan).toMatchObject({
      scannerCompanyName: 'QR E2E Builder Co',
    });
    expect(builderScan).not.toHaveProperty('scannerUserId');
    expect(builderScan).not.toHaveProperty('scannerName');
  });

  async function seedFixtures(): Promise<void> {
    buyerEmail = uniqueEmail('buyer');
    builderEmail = uniqueEmail('builder');
    const passwordHash = await hashPassword(password);

    const company = await prisma.db.company.create({
      data: {
        name: 'QR E2E Builder Co',
        type: CompanyType.builder,
        status: CompanyStatus.active,
        source: CompanySource.admin,
      },
    });
    companyId = company.id;
    createdCompanyIds.push(company.id);

    const buyer = await prisma.db.user.create({
      data: {
        name: 'QR E2E Buyer',
        email: buyerEmail,
        phone: '+37491110099',
        passwordHash,
        accountType: AccountType.buyer,
        status: UserStatus.active,
        buyerProfile: {
          create: {
            name: 'QR E2E Buyer',
            phone: '+37491110099',
            email: buyerEmail,
          },
        },
      },
      include: { buyerProfile: true },
    });
    buyerUserId = buyer.id;
    createdUserIds.push(buyer.id);

    const builder = await prisma.db.user.create({
      data: {
        name: 'QR E2E Builder Staff',
        email: builderEmail,
        passwordHash,
        accountType: AccountType.company_member,
        status: UserStatus.active,
        companyMembership: {
          create: {
            companyId: company.id,
            role: CompanyMemberRole.member,
            status: CompanyMemberStatus.active,
            joinedAt: new Date(),
          },
        },
      },
    });
    createdUserIds.push(builder.id);

    const qrService = app.get(QrCodesService);
    await qrService.createForBuyerProfile(buyer.buyerProfile!.id);

    const qr = await prisma.db.qrCode.findUniqueOrThrow({
      where: { buyerProfileId: buyer.buyerProfile!.id },
    });
    qrCodeId = qr.id;
    rawToken = decryptQrToken(qr.tokenEncrypted, pepper);
  }
});
