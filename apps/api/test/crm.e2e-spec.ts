import { API_V1_PREFIX, CSRF_HEADER_NAME } from '@toonexpo/contracts';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { type CrmE2eContext, createCrmE2eContext } from './crm.e2e.harness.js';

describe('CRM lead intake + Constructor CRM (e2e)', () => {
  let ctx: CrmE2eContext;

  beforeAll(async () => {
    ctx = await createCrmE2eContext();
  });

  afterAll(async () => {
    await ctx.close();
  });

  it('buyer creates request → deal appears in builder CRM', async () => {
    const { app, fixtures, login } = ctx;
    const buyer = await login(fixtures.buyerEmail);
    const create = await request(app.getHttpServer())
      .post(`${API_V1_PREFIX}/requests`)
      .set('Cookie', buyer.cookie)
      .set(CSRF_HEADER_NAME, buyer.csrf)
      .set('Origin', 'http://localhost:3000')
      .send({ projectId: fixtures.projectId, note: 'Interested in prices' })
      .expect(201);

    expect(create.body.deduplicated).toBe(false);
    expect(create.body.dealStatus).toBe('new_request');
    expect(create.body.source).toBe('buyer_project_request');

    const builder = await login(fixtures.builderEmail);
    const list = await request(app.getHttpServer())
      .get(`${API_V1_PREFIX}/portal/crm/deals`)
      .set('Cookie', builder.cookie)
      .expect(200);

    expect(list.body.data.some((d: { id: string }) => d.id === create.body.dealId)).toBe(true);
  });

  it('repeat buyer request deduplicates into same open deal', async () => {
    const { app, fixtures, login } = ctx;
    const buyer = await login(fixtures.buyerEmail);
    const first = await request(app.getHttpServer())
      .post(`${API_V1_PREFIX}/requests`)
      .set('Cookie', buyer.cookie)
      .set(CSRF_HEADER_NAME, buyer.csrf)
      .set('Origin', 'http://localhost:3000')
      .send({ projectId: fixtures.projectId, note: 'First' })
      .expect(201);

    const second = await request(app.getHttpServer())
      .post(`${API_V1_PREFIX}/requests`)
      .set('Cookie', buyer.cookie)
      .set(CSRF_HEADER_NAME, buyer.csrf)
      .set('Origin', 'http://localhost:3000')
      .send({ projectId: fixtures.projectId, note: 'Second' })
      .expect(201);

    expect(second.body.deduplicated).toBe(true);
    expect(second.body.dealId).toBe(first.body.dealId);
    expect(second.body.requestId).not.toBe(first.body.requestId);

    const builder = await login(fixtures.builderEmail);
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
    const { app, prisma, fixtures, login } = ctx;
    await prisma.db.crmDeal.updateMany({
      where: {
        companyId: fixtures.companyId,
        buyerProfileId: fixtures.buyerProfileId,
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

    const builder = await login(fixtures.builderEmail);
    const created = await request(app.getHttpServer())
      .post(`${API_V1_PREFIX}/portal/crm/deals/from-scan`)
      .set('Cookie', builder.cookie)
      .set(CSRF_HEADER_NAME, builder.csrf)
      .set('Origin', 'http://localhost:3000')
      .send({
        scanEventId: fixtures.scanEventId,
        projectId: fixtures.projectId,
        apartmentId: fixtures.apartmentId,
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
          r.scanEventId === fixtures.scanEventId && r.source === 'builder_buyer_qr_scan',
      ),
    ).toBe(true);
  });

  it('manual entry creates deal and links buyer by email', async () => {
    const { app, fixtures, login } = ctx;
    const builder = await login(fixtures.builderEmail);
    const created = await request(app.getHttpServer())
      .post(`${API_V1_PREFIX}/portal/crm/deals`)
      .set('Cookie', builder.cookie)
      .set(CSRF_HEADER_NAME, builder.csrf)
      .set('Origin', 'http://localhost:3000')
      .send({
        contactName: 'Walk-in Guest',
        contactEmail: fixtures.otherBuyerEmail,
        contactPhone: '+37490000099',
        note: 'Phone lead',
      })
      .expect(201);

    expect(created.body.source).toBe('manual_builder_entry');

    const detail = await request(app.getHttpServer())
      .get(`${API_V1_PREFIX}/portal/crm/deals/${created.body.dealId}`)
      .set('Cookie', builder.cookie)
      .expect(200);

    expect(detail.body.buyer.email).toBe(fixtures.otherBuyerEmail);
    expect(detail.body.buyer.buyerProfileId).toBeTruthy();
  });

  it('status transitions validate and lost requires reason', async () => {
    const { app, fixtures, login } = ctx;
    const buyer = await login(fixtures.buyerEmail);
    const created = await request(app.getHttpServer())
      .post(`${API_V1_PREFIX}/requests`)
      .set('Cookie', buyer.cookie)
      .set(CSRF_HEADER_NAME, buyer.csrf)
      .set('Origin', 'http://localhost:3000')
      .send({ projectId: fixtures.projectId, note: 'Status test' })
      .expect(201);

    const builder = await login(fixtures.builderEmail);

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
});
