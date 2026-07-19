import { ValidationPipe } from '@nestjs/common';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { Test, type TestingModule } from '@nestjs/testing';
import { API_V1_PREFIX, CSRF_COOKIE_NAME, CSRF_HEADER_NAME } from '@toonexpo/contracts';
import {
  AccountType,
  ApartmentSalesStatus,
  CompanyMemberRole,
  CompanyMemberStatus,
  CompanySource,
  CompanyStatus,
  CompanyType,
  CrmStatusSource,
  PriceVisibility,
  PublicationStatus,
  QrScanContext,
  QrScanResultStatus,
  UserStatus,
} from '@toonexpo/db';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { AppModule } from '../src/app.module.js';
import { hashPassword } from '../src/auth/utils/password.util.js';
import { AllExceptionsFilter } from '../src/common/filters/all-exceptions.filter.js';
import { PrismaService } from '../src/prisma/prisma.service.js';
import { loadRootEnv } from './load-root-env.js';

const GLOBAL_PREFIX = API_V1_PREFIX.replace(/^\//, '');
const FIXTURE_PREFIX = 'e2e_crm_';

const uniqueEmail = (suffix: string): string =>
  `${FIXTURE_PREFIX}${suffix}.${Date.now()}.${Math.random().toString(16).slice(2)}@example.com`;

const findSetCookie = (setCookieHeader: string[] | undefined, name: string): string | undefined => {
  if (!setCookieHeader) {
    return undefined;
  }
  return setCookieHeader.find((value) => value.startsWith(`${name}=`));
};

const cookiePair = (setCookie: string): string => setCookie.split(';')[0] ?? '';

describe('CRM lead intake + Constructor CRM (e2e)', () => {
  let app: NestExpressApplication;
  let prisma: PrismaService;

  let companyId = '';
  let otherCompanyId = '';
  let buyerEmail = '';
  let otherBuyerEmail = '';
  let builderEmail = '';
  let otherBuilderEmail = '';
  let buyerProfileId = '';
  let projectId = '';
  let apartmentId = '';
  let foreignApartmentId = '';
  let qrCodeId = '';
  let scanEventId = '';
  const password = 'crm-e2e-pass-123';
  const createdUserIds: string[] = [];
  const createdCompanyIds: string[] = [];
  const sessionCache = new Map<string, { cookie: string; csrf: string }>();

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
    await seedFixtures();
  });

  afterAll(async () => {
    if (createdCompanyIds.length > 0) {
      await prisma.db.crmFollowUpActivity.deleteMany({
        where: { crmDeal: { companyId: { in: createdCompanyIds } } },
      });
      await prisma.db.crmNote.deleteMany({
        where: { crmDeal: { companyId: { in: createdCompanyIds } } },
      });
      await prisma.db.crmDealApartmentLink.deleteMany({
        where: { crmDeal: { companyId: { in: createdCompanyIds } } },
      });
      await prisma.db.crmDeal.updateMany({
        where: { companyId: { in: createdCompanyIds } },
        data: { primaryRequestId: null },
      });
      await prisma.db.request.deleteMany({
        where: { builderCompanyId: { in: createdCompanyIds } },
      });
      await prisma.db.crmDeal.deleteMany({
        where: { companyId: { in: createdCompanyIds } },
      });
      await prisma.db.project.deleteMany({
        where: { builderCompanyId: { in: createdCompanyIds } },
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

  const login = async (email: string): Promise<{ cookie: string; csrf: string }> => {
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

  it('buyer creates request → deal appears in builder CRM', async () => {
    const buyer = await login(buyerEmail);
    const create = await request(app.getHttpServer())
      .post(`${API_V1_PREFIX}/requests`)
      .set('Cookie', buyer.cookie)
      .set(CSRF_HEADER_NAME, buyer.csrf)
      .set('Origin', 'http://localhost:3000')
      .send({ projectId, note: 'Interested in prices' })
      .expect(201);

    expect(create.body.deduplicated).toBe(false);
    expect(create.body.dealStatus).toBe('new_request');
    expect(create.body.source).toBe('buyer_project_request');

    const builder = await login(builderEmail);
    const list = await request(app.getHttpServer())
      .get(`${API_V1_PREFIX}/portal/crm/deals`)
      .set('Cookie', builder.cookie)
      .expect(200);

    expect(list.body.data.some((d: { id: string }) => d.id === create.body.dealId)).toBe(true);
  });

  it('repeat buyer request deduplicates into same open deal', async () => {
    const buyer = await login(buyerEmail);
    const first = await request(app.getHttpServer())
      .post(`${API_V1_PREFIX}/requests`)
      .set('Cookie', buyer.cookie)
      .set(CSRF_HEADER_NAME, buyer.csrf)
      .set('Origin', 'http://localhost:3000')
      .send({ projectId, note: 'First' })
      .expect(201);

    const second = await request(app.getHttpServer())
      .post(`${API_V1_PREFIX}/requests`)
      .set('Cookie', buyer.cookie)
      .set(CSRF_HEADER_NAME, buyer.csrf)
      .set('Origin', 'http://localhost:3000')
      .send({ projectId, note: 'Second' })
      .expect(201);

    expect(second.body.deduplicated).toBe(true);
    expect(second.body.dealId).toBe(first.body.dealId);
    expect(second.body.requestId).not.toBe(first.body.requestId);

    const builder = await login(builderEmail);
    const detail = await request(app.getHttpServer())
      .get(`${API_V1_PREFIX}/portal/crm/deals/${first.body.dealId}`)
      .set('Cookie', builder.cookie)
      .expect(200);

    expect(detail.body.requests.length).toBeGreaterThanOrEqual(2);
    expect(
      detail.body.activities.some(
        (a: { title: string }) => a.title === 'Additional intake request attached',
      ),
    ).toBe(true);
  });

  it('from-scan creates deal with source and scanEventId', async () => {
    await prisma.db.crmDeal.updateMany({
      where: {
        companyId,
        buyerProfileId,
        status: {
          in: [
            'new_request',
            'assigned',
            'contacted',
            'follow_up_needed',
            'apartment_selected',
            'reserved',
          ],
        },
      },
      data: { status: 'closed' },
    });

    const builder = await login(builderEmail);
    const created = await request(app.getHttpServer())
      .post(`${API_V1_PREFIX}/portal/crm/deals/from-scan`)
      .set('Cookie', builder.cookie)
      .set(CSRF_HEADER_NAME, builder.csrf)
      .set('Origin', 'http://localhost:3000')
      .send({
        scanEventId,
        projectId,
        apartmentId,
        note: 'Met at booth',
      })
      .expect(201);

    expect(created.body.deduplicated).toBe(false);
    expect(created.body.source).toBe('builder_buyer_qr_scan');

    const detail = await request(app.getHttpServer())
      .get(`${API_V1_PREFIX}/portal/crm/deals/${created.body.dealId}`)
      .set('Cookie', builder.cookie)
      .expect(200);

    expect(
      detail.body.requests.some(
        (r: { scanEventId: string | null; source: string }) =>
          r.scanEventId === scanEventId && r.source === 'builder_buyer_qr_scan',
      ),
    ).toBe(true);
  });

  it('manual entry creates deal and links buyer by email', async () => {
    const builder = await login(builderEmail);
    const created = await request(app.getHttpServer())
      .post(`${API_V1_PREFIX}/portal/crm/deals`)
      .set('Cookie', builder.cookie)
      .set(CSRF_HEADER_NAME, builder.csrf)
      .set('Origin', 'http://localhost:3000')
      .send({
        contactName: 'Walk-in Guest',
        contactEmail: otherBuyerEmail,
        contactPhone: '+37490000099',
        note: 'Phone lead',
      })
      .expect(201);

    expect(created.body.source).toBe('manual_builder_entry');

    const detail = await request(app.getHttpServer())
      .get(`${API_V1_PREFIX}/portal/crm/deals/${created.body.dealId}`)
      .set('Cookie', builder.cookie)
      .expect(200);

    expect(detail.body.buyer.email).toBe(otherBuyerEmail);
    expect(detail.body.buyer.buyerProfileId).toBeTruthy();
  });

  it('status transitions validate and lost requires reason', async () => {
    const buyer = await login(buyerEmail);
    const created = await request(app.getHttpServer())
      .post(`${API_V1_PREFIX}/requests`)
      .set('Cookie', buyer.cookie)
      .set(CSRF_HEADER_NAME, buyer.csrf)
      .set('Origin', 'http://localhost:3000')
      .send({ projectId, note: 'Status test' })
      .expect(201);

    const builder = await login(builderEmail);

    await request(app.getHttpServer())
      .patch(`${API_V1_PREFIX}/portal/crm/deals/${created.body.dealId}`)
      .set('Cookie', builder.cookie)
      .set(CSRF_HEADER_NAME, builder.csrf)
      .set('Origin', 'http://localhost:3000')
      .send({ status: 'reserved' })
      .expect(400);

    await request(app.getHttpServer())
      .patch(`${API_V1_PREFIX}/portal/crm/deals/${created.body.dealId}`)
      .set('Cookie', builder.cookie)
      .set(CSRF_HEADER_NAME, builder.csrf)
      .set('Origin', 'http://localhost:3000')
      .send({ status: 'assigned' })
      .expect(200);

    await request(app.getHttpServer())
      .patch(`${API_V1_PREFIX}/portal/crm/deals/${created.body.dealId}`)
      .set('Cookie', builder.cookie)
      .set(CSRF_HEADER_NAME, builder.csrf)
      .set('Origin', 'http://localhost:3000')
      .send({ status: 'lost' })
      .expect(400);

    const lost = await request(app.getHttpServer())
      .patch(`${API_V1_PREFIX}/portal/crm/deals/${created.body.dealId}`)
      .set('Cookie', builder.cookie)
      .set(CSRF_HEADER_NAME, builder.csrf)
      .set('Origin', 'http://localhost:3000')
      .send({ status: 'lost', lostReason: 'Not interested' })
      .expect(200);

    expect(lost.body.status).toBe('lost');
    expect(lost.body.lostReason).toBe('Not interested');
  });

  it('buyer sees own requests without CRM notes; other buyer isolated', async () => {
    const buyer = await login(buyerEmail);
    const create = await request(app.getHttpServer())
      .post(`${API_V1_PREFIX}/requests`)
      .set('Cookie', buyer.cookie)
      .set(CSRF_HEADER_NAME, buyer.csrf)
      .set('Origin', 'http://localhost:3000')
      .send({ projectId, note: 'Visible to me' })
      .expect(201);

    const builder = await login(builderEmail);
    await request(app.getHttpServer())
      .post(`${API_V1_PREFIX}/portal/crm/deals/${create.body.dealId}/notes`)
      .set('Cookie', builder.cookie)
      .set(CSRF_HEADER_NAME, builder.csrf)
      .set('Origin', 'http://localhost:3000')
      .send({ body: 'Internal note — must not leak' })
      .expect(201);

    const mine = await request(app.getHttpServer())
      .get(`${API_V1_PREFIX}/buyer/requests`)
      .set('Cookie', buyer.cookie)
      .expect(200);

    expect(mine.body.data.length).toBeGreaterThanOrEqual(1);
    expect(JSON.stringify(mine.body).includes('Internal note — must not leak')).toBe(false);

    const other = await login(otherBuyerEmail);
    const otherList = await request(app.getHttpServer())
      .get(`${API_V1_PREFIX}/buyer/requests`)
      .set('Cookie', other.cookie)
      .expect(200);

    expect(
      otherList.body.data.some((r: { requestId: string }) => r.requestId === create.body.requestId),
    ).toBe(false);
  });

  it('notes and activities work; cross-company deal is 404', async () => {
    const builder = await login(builderEmail);
    const created = await request(app.getHttpServer())
      .post(`${API_V1_PREFIX}/portal/crm/deals`)
      .set('Cookie', builder.cookie)
      .set(CSRF_HEADER_NAME, builder.csrf)
      .set('Origin', 'http://localhost:3000')
      .send({ contactName: 'Activity Client', note: 'Follow up' })
      .expect(201);

    const note = await request(app.getHttpServer())
      .post(`${API_V1_PREFIX}/portal/crm/deals/${created.body.dealId}/notes`)
      .set('Cookie', builder.cookie)
      .set(CSRF_HEADER_NAME, builder.csrf)
      .set('Origin', 'http://localhost:3000')
      .send({ body: 'Called buyer' })
      .expect(201);
    expect(note.body.body).toBe('Called buyer');

    const activity = await request(app.getHttpServer())
      .post(`${API_V1_PREFIX}/portal/crm/deals/${created.body.dealId}/activities`)
      .set('Cookie', builder.cookie)
      .set(CSRF_HEADER_NAME, builder.csrf)
      .set('Origin', 'http://localhost:3000')
      .send({ type: 'call', title: 'Morning call' })
      .expect(201);

    const done = await request(app.getHttpServer())
      .patch(
        `${API_V1_PREFIX}/portal/crm/deals/${created.body.dealId}/activities/${activity.body.id}`,
      )
      .set('Cookie', builder.cookie)
      .set(CSRF_HEADER_NAME, builder.csrf)
      .set('Origin', 'http://localhost:3000')
      .send({ status: 'done' })
      .expect(200);
    expect(done.body.status).toBe('done');

    const otherBuilder = await login(otherBuilderEmail);
    await request(app.getHttpServer())
      .get(`${API_V1_PREFIX}/portal/crm/deals/${created.body.dealId}`)
      .set('Cookie', otherBuilder.cookie)
      .expect(404);
  });

  it('attach/detach apartment; foreign apartment 404; reserved last-link blocked', async () => {
    const builder = await login(builderEmail);
    const created = await request(app.getHttpServer())
      .post(`${API_V1_PREFIX}/portal/crm/deals`)
      .set('Cookie', builder.cookie)
      .set(CSRF_HEADER_NAME, builder.csrf)
      .set('Origin', 'http://localhost:3000')
      .send({ contactName: 'Apartment Link Client', note: 'Link test' })
      .expect(201);

    const dealId = created.body.dealId as string;

    const attached = await request(app.getHttpServer())
      .post(`${API_V1_PREFIX}/portal/crm/deals/${dealId}/apartments`)
      .set('Cookie', builder.cookie)
      .set(CSRF_HEADER_NAME, builder.csrf)
      .set('Origin', 'http://localhost:3000')
      .send({ apartmentId })
      .expect(201);

    expect(attached.body.apartmentId).toBe(apartmentId);
    expect(attached.body.isPrimary).toBe(true);

    await request(app.getHttpServer())
      .post(`${API_V1_PREFIX}/portal/crm/deals/${dealId}/apartments`)
      .set('Cookie', builder.cookie)
      .set(CSRF_HEADER_NAME, builder.csrf)
      .set('Origin', 'http://localhost:3000')
      .send({ apartmentId })
      .expect(201);

    await request(app.getHttpServer())
      .post(`${API_V1_PREFIX}/portal/crm/deals/${dealId}/apartments`)
      .set('Cookie', builder.cookie)
      .set(CSRF_HEADER_NAME, builder.csrf)
      .set('Origin', 'http://localhost:3000')
      .send({ apartmentId: foreignApartmentId })
      .expect(404);

    await request(app.getHttpServer())
      .delete(`${API_V1_PREFIX}/portal/crm/deals/${dealId}/apartments/${apartmentId}`)
      .set('Cookie', builder.cookie)
      .set(CSRF_HEADER_NAME, builder.csrf)
      .set('Origin', 'http://localhost:3000')
      .expect(204);

    await request(app.getHttpServer())
      .post(`${API_V1_PREFIX}/portal/crm/deals/${dealId}/apartments`)
      .set('Cookie', builder.cookie)
      .set(CSRF_HEADER_NAME, builder.csrf)
      .set('Origin', 'http://localhost:3000')
      .send({ apartmentId })
      .expect(201);

    await request(app.getHttpServer())
      .patch(`${API_V1_PREFIX}/portal/crm/deals/${dealId}`)
      .set('Cookie', builder.cookie)
      .set(CSRF_HEADER_NAME, builder.csrf)
      .set('Origin', 'http://localhost:3000')
      .send({ status: 'assigned' })
      .expect(200);

    await request(app.getHttpServer())
      .patch(`${API_V1_PREFIX}/portal/crm/deals/${dealId}`)
      .set('Cookie', builder.cookie)
      .set(CSRF_HEADER_NAME, builder.csrf)
      .set('Origin', 'http://localhost:3000')
      .send({ status: 'contacted' })
      .expect(200);

    await request(app.getHttpServer())
      .patch(`${API_V1_PREFIX}/portal/crm/deals/${dealId}`)
      .set('Cookie', builder.cookie)
      .set(CSRF_HEADER_NAME, builder.csrf)
      .set('Origin', 'http://localhost:3000')
      .send({ status: 'apartment_selected' })
      .expect(200);

    await request(app.getHttpServer())
      .patch(`${API_V1_PREFIX}/portal/crm/deals/${dealId}`)
      .set('Cookie', builder.cookie)
      .set(CSRF_HEADER_NAME, builder.csrf)
      .set('Origin', 'http://localhost:3000')
      .send({ status: 'reserved' })
      .expect(200);

    await request(app.getHttpServer())
      .delete(`${API_V1_PREFIX}/portal/crm/deals/${dealId}/apartments/${apartmentId}`)
      .set('Cookie', builder.cookie)
      .set(CSRF_HEADER_NAME, builder.csrf)
      .set('Origin', 'http://localhost:3000')
      .expect(400);
  });

  async function seedFixtures(): Promise<void> {
    const passwordHash = await hashPassword(password);
    buyerEmail = uniqueEmail('buyer');
    otherBuyerEmail = uniqueEmail('other_buyer');
    builderEmail = uniqueEmail('builder');
    otherBuilderEmail = uniqueEmail('other_builder');

    const company = await prisma.db.company.create({
      data: {
        name: `${FIXTURE_PREFIX}Builder`,
        type: CompanyType.builder,
        status: CompanyStatus.active,
        source: CompanySource.admin,
      },
    });
    companyId = company.id;
    createdCompanyIds.push(company.id);

    const otherCompany = await prisma.db.company.create({
      data: {
        name: `${FIXTURE_PREFIX}OtherBuilder`,
        type: CompanyType.builder,
        status: CompanyStatus.active,
        source: CompanySource.admin,
      },
    });
    otherCompanyId = otherCompany.id;
    createdCompanyIds.push(otherCompany.id);

    const buyer = await prisma.db.user.create({
      data: {
        name: 'CRM Buyer',
        email: buyerEmail,
        phone: '+37491110001',
        passwordHash,
        accountType: AccountType.buyer,
        status: UserStatus.active,
        buyerProfile: {
          create: {
            name: 'CRM Buyer',
            phone: '+37491110001',
            email: buyerEmail,
          },
        },
      },
      include: { buyerProfile: true },
    });
    createdUserIds.push(buyer.id);
    buyerProfileId = buyer.buyerProfile!.id;

    const otherBuyer = await prisma.db.user.create({
      data: {
        name: 'Other Buyer',
        email: otherBuyerEmail,
        phone: '+37491110002',
        passwordHash,
        accountType: AccountType.buyer,
        status: UserStatus.active,
        buyerProfile: {
          create: {
            name: 'Other Buyer',
            phone: '+37491110002',
            email: otherBuyerEmail,
          },
        },
      },
    });
    createdUserIds.push(otherBuyer.id);

    const builder = await prisma.db.user.create({
      data: {
        name: 'CRM Builder',
        email: builderEmail,
        passwordHash,
        accountType: AccountType.company_member,
        status: UserStatus.active,
        companyMembership: {
          create: {
            companyId,
            role: CompanyMemberRole.company_admin,
            status: CompanyMemberStatus.active,
            joinedAt: new Date(),
          },
        },
      },
    });
    createdUserIds.push(builder.id);

    const otherBuilder = await prisma.db.user.create({
      data: {
        name: 'Other Builder',
        email: otherBuilderEmail,
        passwordHash,
        accountType: AccountType.company_member,
        status: UserStatus.active,
        companyMembership: {
          create: {
            companyId: otherCompanyId,
            role: CompanyMemberRole.company_admin,
            status: CompanyMemberStatus.active,
            joinedAt: new Date(),
          },
        },
      },
    });
    createdUserIds.push(otherBuilder.id);

    const project = await prisma.db.project.create({
      data: {
        builderCompanyId: companyId,
        name: `${FIXTURE_PREFIX}Project`,
        slug: `${FIXTURE_PREFIX}project-${Date.now()}`,
        publicationStatus: PublicationStatus.published,
        shortDescription: 'CRM e2e project',
      },
    });
    projectId = project.id;

    const building = await prisma.db.building.create({
      data: {
        projectId,
        name: 'A',
        publicationStatus: PublicationStatus.published,
      },
    });
    const floor = await prisma.db.floor.create({
      data: {
        buildingId: building.id,
        number: 1,
        publicationStatus: PublicationStatus.published,
      },
    });
    const apartment = await prisma.db.apartment.create({
      data: {
        projectId,
        buildingId: building.id,
        floorId: floor.id,
        number: '101',
        salesStatus: ApartmentSalesStatus.available,
        publicationStatus: PublicationStatus.published,
        price: 50_000_000,
        priceVisibility: PriceVisibility.public,
        crmStatusSource: CrmStatusSource.manual,
      },
    });
    apartmentId = apartment.id;

    const foreignProject = await prisma.db.project.create({
      data: {
        builderCompanyId: otherCompanyId,
        name: `${FIXTURE_PREFIX}ForeignProject`,
        slug: `${FIXTURE_PREFIX}foreign-${Date.now()}`,
        publicationStatus: PublicationStatus.published,
        shortDescription: 'Foreign CRM project',
      },
    });
    const foreignBuilding = await prisma.db.building.create({
      data: {
        projectId: foreignProject.id,
        name: 'B',
        publicationStatus: PublicationStatus.published,
      },
    });
    const foreignFloor = await prisma.db.floor.create({
      data: {
        buildingId: foreignBuilding.id,
        number: 1,
        publicationStatus: PublicationStatus.published,
      },
    });
    const foreignApartment = await prisma.db.apartment.create({
      data: {
        projectId: foreignProject.id,
        buildingId: foreignBuilding.id,
        floorId: foreignFloor.id,
        number: '201',
        salesStatus: ApartmentSalesStatus.available,
        publicationStatus: PublicationStatus.published,
        price: 40_000_000,
        priceVisibility: PriceVisibility.public,
        crmStatusSource: CrmStatusSource.manual,
      },
    });
    foreignApartmentId = foreignApartment.id;

    const qr = await prisma.db.qrCode.create({
      data: {
        buyerProfileId,
        tokenHash: `hash_${FIXTURE_PREFIX}${Date.now()}`,
        tokenEncrypted: 'encrypted-placeholder',
      },
    });
    qrCodeId = qr.id;

    const scan = await prisma.db.qrScanEvent.create({
      data: {
        qrCodeId,
        buyerProfileId,
        scannerUserId: builder.id,
        scannerCompanyId: companyId,
        scannerRole: 'company_member',
        scanContext: QrScanContext.builder_scan,
        resultStatus: QrScanResultStatus.resolved,
      },
    });
    scanEventId = scan.id;
  }
});
