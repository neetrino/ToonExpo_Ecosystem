import { API_V1_PREFIX } from '@toonexpo/contracts';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { createPortalE2eContext, type PortalE2eContext } from './portal.e2e.harness.js';

describe('Builder portal inventory CRUD (e2e)', () => {
  let ctx: PortalE2eContext;

  beforeAll(async () => {
    ctx = await createPortalE2eContext();
  });

  afterAll(async () => {
    await ctx.close();
  });

  it('creates project→building→floor→apartments; draft hidden publicly', async () => {
    const { app, fixtures, loginAs, authHeaders, createdProjectIds } = ctx;
    const admin = await loginAs(fixtures.adminAEmail);

    const projectRes = await request(app.getHttpServer())
      .post(`${API_V1_PREFIX}/portal/projects`)
      .set(authHeaders(admin))
      .send({
        name: 'Portal E2E Tower',
        city: 'Yerevan',
        translations: {
          name: { en: 'Portal E2E Tower EN', ru: 'Башня E2E' },
          shortDescription: { en: 'Short EN' },
        },
      })
      .expect(201);

    const projectId = projectRes.body.id as string;
    createdProjectIds.push(projectId);
    expect(projectRes.body.publicationStatus).toBe('draft');
    expect(projectRes.body.builderCompanyId).toBe(fixtures.companyAId);
    expect(projectRes.body.translations?.name?.en).toBe('Portal E2E Tower EN');
    expect(projectRes.body.translations?.name?.ru).toBe('Башня E2E');
    expect(projectRes.body.translations?.shortDescription?.en).toBe('Short EN');

    const projectGet = await request(app.getHttpServer())
      .get(`${API_V1_PREFIX}/portal/projects/${projectId}`)
      .set('Cookie', admin.cookieHeader)
      .expect(200);
    expect(projectGet.body.translations?.name?.en).toBe('Portal E2E Tower EN');
    expect(projectGet.body.translations?.name?.ru).toBe('Башня E2E');
    expect(projectGet.body.translations?.shortDescription?.en).toBe('Short EN');

    const buildingRes = await request(app.getHttpServer())
      .post(`${API_V1_PREFIX}/portal/projects/${projectId}/buildings`)
      .set(authHeaders(admin))
      .send({ name: 'Building A', displayOrder: 1 })
      .expect(201);

    const buildingId = buildingRes.body.id as string;

    const floorRes = await request(app.getHttpServer())
      .post(`${API_V1_PREFIX}/portal/buildings/${buildingId}/floors`)
      .set(authHeaders(admin))
      .send({ floorNumber: 3, name: 'Floor 3' })
      .expect(201);

    const floorId = floorRes.body.id as string;

    const bulkRes = await request(app.getHttpServer())
      .post(`${API_V1_PREFIX}/portal/floors/${floorId}/apartments/bulk`)
      .set(authHeaders(admin))
      .send({
        apartments: [
          { number: '301', rooms: 2, price: 45_000_000, priceVisibility: 'public' },
          { number: '302', rooms: 3, price: 62_000_000, priceVisibility: 'by_request' },
        ],
      })
      .expect(201);

    expect(bulkRes.body).toHaveLength(2);

    const buildingsHub = await request(app.getHttpServer())
      .get(`${API_V1_PREFIX}/portal/buildings`)
      .set('Cookie', admin.cookieHeader)
      .expect(200);
    expect(buildingsHub.body.data.some((row: { id: string }) => row.id === buildingId)).toBe(true);

    const floorsHub = await request(app.getHttpServer())
      .get(`${API_V1_PREFIX}/portal/floors`)
      .set('Cookie', admin.cookieHeader)
      .expect(200);
    expect(floorsHub.body.data.some((row: { id: string }) => row.id === floorId)).toBe(true);

    const apartmentsHub = await request(app.getHttpServer())
      .get(`${API_V1_PREFIX}/portal/apartments`)
      .set('Cookie', admin.cookieHeader)
      .expect(200);
    expect(apartmentsHub.body.data).toHaveLength(2);

    const glanceRes = await request(app.getHttpServer())
      .get(`${API_V1_PREFIX}/portal/buildings/${buildingId}/inventory-glance`)
      .set('Cookie', admin.cookieHeader)
      .expect(200);
    expect(glanceRes.body.id).toBe(buildingId);
    expect(glanceRes.body.floors).toHaveLength(1);

    await request(app.getHttpServer())
      .get(`${API_V1_PREFIX}/projects`)
      .query({ builderId: fixtures.companyAId })
      .expect(200)
      .expect((res) => {
        expect(res.body.data.some((p: { id: string }) => p.id === projectId)).toBe(false);
      });

    await request(app.getHttpServer()).get(`${API_V1_PREFIX}/projects/${projectId}`).expect(404);
  });

  it('returns 404 for foreign company entities', async () => {
    const { app, fixtures, loginAs, authHeaders, createdProjectIds } = ctx;
    const adminA = await loginAs(fixtures.adminAEmail);
    const adminB = await loginAs(fixtures.adminBEmail);

    const projectRes = await request(app.getHttpServer())
      .post(`${API_V1_PREFIX}/portal/projects`)
      .set(authHeaders(adminA))
      .send({ name: 'Company A Private' })
      .expect(201);

    const projectId = projectRes.body.id as string;
    createdProjectIds.push(projectId);

    await request(app.getHttpServer())
      .get(`${API_V1_PREFIX}/portal/projects/${projectId}`)
      .set('Cookie', adminB.cookieHeader)
      .expect(404);

    await request(app.getHttpServer())
      .patch(`${API_V1_PREFIX}/portal/projects/${projectId}`)
      .set(authHeaders(adminB))
      .send({ name: 'Hijack' })
      .expect(404);
  });

  it('allows member write but blocks publish/delete for member', async () => {
    const { app, fixtures, loginAs, authHeaders, createdProjectIds } = ctx;
    const admin = await loginAs(fixtures.adminAEmail);
    const member = await loginAs(fixtures.memberAEmail);

    const projectRes = await request(app.getHttpServer())
      .post(`${API_V1_PREFIX}/portal/projects`)
      .set(authHeaders(member))
      .send({ name: 'Member Created Draft' })
      .expect(201);

    const projectId = projectRes.body.id as string;
    createdProjectIds.push(projectId);

    await request(app.getHttpServer())
      .patch(`${API_V1_PREFIX}/portal/projects/${projectId}`)
      .set(authHeaders(member))
      .send({ city: 'Gyumri' })
      .expect(200);

    await request(app.getHttpServer())
      .patch(`${API_V1_PREFIX}/portal/projects/${projectId}/publication`)
      .set(authHeaders(member))
      .send({ publicationStatus: 'published' })
      .expect(403);

    await request(app.getHttpServer())
      .delete(`${API_V1_PREFIX}/portal/projects/${projectId}`)
      .set(authHeaders(member))
      .expect(403);

    await request(app.getHttpServer())
      .patch(`${API_V1_PREFIX}/portal/projects/${projectId}/publication`)
      .set(authHeaders(admin))
      .send({ publicationStatus: 'published' })
      .expect(200);

    await request(app.getHttpServer()).get(`${API_V1_PREFIX}/projects/${projectId}`).expect(200);

    await request(app.getHttpServer())
      .patch(`${API_V1_PREFIX}/portal/projects/${projectId}/publication`)
      .set(authHeaders(admin))
      .send({ publicationStatus: 'draft' })
      .expect(200);

    await request(app.getHttpServer())
      .delete(`${API_V1_PREFIX}/portal/projects/${projectId}`)
      .set(authHeaders(admin))
      .expect(204);

    createdProjectIds.splice(createdProjectIds.indexOf(projectId), 1);
  });

  it('records apartment sales status history on change', async () => {
    const { app, prisma, fixtures, loginAs, authHeaders, createdProjectIds } = ctx;
    const admin = await loginAs(fixtures.adminAEmail);

    const projectRes = await request(app.getHttpServer())
      .post(`${API_V1_PREFIX}/portal/projects`)
      .set(authHeaders(admin))
      .send({ name: 'Status History Project' })
      .expect(201);
    const projectId = projectRes.body.id as string;
    createdProjectIds.push(projectId);

    const buildingRes = await request(app.getHttpServer())
      .post(`${API_V1_PREFIX}/portal/projects/${projectId}/buildings`)
      .set(authHeaders(admin))
      .send({ name: 'B1' })
      .expect(201);

    const floorRes = await request(app.getHttpServer())
      .post(`${API_V1_PREFIX}/portal/buildings/${buildingRes.body.id as string}/floors`)
      .set(authHeaders(admin))
      .send({ floorNumber: 1 })
      .expect(201);

    const aptRes = await request(app.getHttpServer())
      .post(`${API_V1_PREFIX}/portal/floors/${floorRes.body.id as string}/apartments`)
      .set(authHeaders(admin))
      .send({
        number: '101',
        price: 10_000_000,
        translations: {
          description: { en: 'Bright EN', ru: 'Светлая RU' },
        },
      })
      .expect(201);

    const apartmentId = aptRes.body.id as string;

    const aptGet = await request(app.getHttpServer())
      .get(`${API_V1_PREFIX}/portal/apartments/${apartmentId}`)
      .set('Cookie', admin.cookieHeader)
      .expect(200);
    expect(aptGet.body.translations?.description?.en).toBe('Bright EN');
    expect(aptGet.body.translations?.description?.ru).toBe('Светлая RU');

    await request(app.getHttpServer())
      .patch(`${API_V1_PREFIX}/portal/apartments/${apartmentId}`)
      .set(authHeaders(admin))
      .send({
        salesStatus: 'reserved',
      })
      .expect(200);

    const history = await prisma.db.apartmentStatusHistory.findMany({
      where: { apartmentId },
      orderBy: { createdAt: 'asc' },
    });

    expect(history.length).toBeGreaterThanOrEqual(2);
    const last = history[history.length - 1]!;
    expect(last.previousStatus).toBe('available');
    expect(last.newStatus).toBe('reserved');
    expect(last.changedByUserId).toBeTruthy();
  });
});
