import { API_V1_PREFIX, CSRF_HEADER_NAME } from '@toonexpo/contracts';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { type CrmE2eContext, createCrmE2eContext } from './crm.e2e.harness.js';

describe('CRM notes, isolation, apartments (e2e)', () => {
  let ctx: CrmE2eContext;

  beforeAll(async () => {
    ctx = await createCrmE2eContext();
  });

  afterAll(async () => {
    await ctx.close();
  });

  it('buyer sees own requests without CRM notes; other buyer isolated', async () => {
    const { app, fixtures, login } = ctx;
    const buyer = await login(fixtures.buyerEmail);
    const create = await request(app.getHttpServer())
      .post(`${API_V1_PREFIX}/requests`)
      .set('Cookie', buyer.cookie)
      .set(CSRF_HEADER_NAME, buyer.csrf)
      .set('Origin', 'http://localhost:3000')
      .send({ projectId: fixtures.projectId, note: 'Visible to me' })
      .expect(201);

    const builder = await login(fixtures.builderEmail);
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

    const other = await login(fixtures.otherBuyerEmail);
    const otherList = await request(app.getHttpServer())
      .get(`${API_V1_PREFIX}/buyer/requests`)
      .set('Cookie', other.cookie)
      .expect(200);

    expect(
      otherList.body.data.some((r: { requestId: string }) => r.requestId === create.body.requestId),
    ).toBe(false);
  });

  it('notes and activities work; cross-company deal is 404', async () => {
    const { app, fixtures, login } = ctx;
    const builder = await login(fixtures.builderEmail);
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

    const otherBuilder = await login(fixtures.otherBuilderEmail);
    await request(app.getHttpServer())
      .get(`${API_V1_PREFIX}/portal/crm/deals/${created.body.dealId}`)
      .set('Cookie', otherBuilder.cookie)
      .expect(404);
  });

  it('attach/detach apartment; foreign apartment 404; reserved last-link blocked', async () => {
    const { app, fixtures, login } = ctx;
    const builder = await login(fixtures.builderEmail);
    const created = await request(app.getHttpServer())
      .post(`${API_V1_PREFIX}/portal/crm/deals`)
      .set('Cookie', builder.cookie)
      .set(CSRF_HEADER_NAME, builder.csrf)
      .set('Origin', 'http://localhost:3000')
      .send({ contactName: 'Apartment Link Client', note: 'Link test' })
      .expect(201);

    const dealId = created.body.dealId as string;
    const { apartmentId, foreignApartmentId } = fixtures;

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
});
