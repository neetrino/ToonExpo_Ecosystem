import { API_V1_PREFIX } from '@toonexpo/contracts';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { uniqueEmail } from './helpers/e2e-http.js';
import { createPortalE2eContext, type PortalE2eContext } from './portal.e2e.harness.js';
import { PORTAL_FIXTURE_PREFIX } from './portal.e2e.fixtures.js';

describe('Builder portal company profile + team (e2e)', () => {
  let ctx: PortalE2eContext;

  beforeAll(async () => {
    ctx = await createPortalE2eContext();
  });

  afterAll(async () => {
    await ctx.close();
  });

  it('returns company profile for member and company_admin', async () => {
    const { app, fixtures, loginAs } = ctx;
    const admin = await loginAs(fixtures.adminAEmail);
    const member = await loginAs(fixtures.memberAEmail);

    const adminProfile = await request(app.getHttpServer())
      .get(`${API_V1_PREFIX}/company/me`)
      .set('Cookie', admin.cookieHeader)
      .expect(200);
    expect(adminProfile.body.id).toBe(fixtures.companyAId);
    expect(adminProfile.body.name).toBe(`${PORTAL_FIXTURE_PREFIX}Company A`);
    expect(adminProfile.body.type).toBe('builder');
    expect(adminProfile.body.status).toBe('active');
    expect(adminProfile.body.role).toBe('company_admin');
    expect(adminProfile.body).toHaveProperty('logoUrl');

    const memberProfile = await request(app.getHttpServer())
      .get(`${API_V1_PREFIX}/company/me`)
      .set('Cookie', member.cookieHeader)
      .expect(200);
    expect(memberProfile.body.id).toBe(fixtures.companyAId);
    expect(memberProfile.body.role).toBe('member');
  });

  it('allows member to list team but blocks invite', async () => {
    const { app, fixtures, loginAs, authHeaders } = ctx;
    const member = await loginAs(fixtures.memberAEmail);

    const listRes = await request(app.getHttpServer())
      .get(`${API_V1_PREFIX}/company/members`)
      .set('Cookie', member.cookieHeader)
      .expect(200);
    expect(listRes.body.data.length).toBeGreaterThanOrEqual(2);

    await request(app.getHttpServer())
      .post(`${API_V1_PREFIX}/company/members`)
      .set(authHeaders(member))
      .send({
        name: 'Should Fail',
        email: uniqueEmail(PORTAL_FIXTURE_PREFIX, 'blocked-invite'),
        role: 'member',
      })
      .expect(403);
  });
});
