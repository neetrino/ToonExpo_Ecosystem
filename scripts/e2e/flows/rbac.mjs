import { DEMO_BUILDER_EMAIL, E2E_API_URL, E2E_BASE_URL } from '../config.mjs';
import {
  detectSeedCredentials,
  getBuyerQrTokenByEmail,
  getPrisma,
  performEntranceCheckInViaPrisma,
} from '../db.mjs';
import { CookieJar, fetchWithJar, loginWithCredentials } from '../http.mjs';
import { assert, runCheck, skipCheck } from '../report.mjs';

/**
 * @param {Response} res
 * @param {string} label
 */
function assertUnauthorized(res, label) {
  assert(
    res.status === 401 || res.status === 403,
    `${label}: expected 401/403, got ${res.status}`,
  );
}

/**
 * RBAC matrix against Nest (session cookies live on the API origin).
 * @param {{ buyerJar: import('../http.mjs').CookieJar | null; buyerEmail?: string }} ctx
 */
export async function runRbacFlow(ctx) {
  console.log('\n[3] RBAC matrix');
  const seeds = detectSeedCredentials();

  await runCheck('Buyer session → /builder/context denied', async () => {
    assert(ctx.buyerJar?.hasSession(), 'buyer session required');
    const res = await fetchWithJar(`${E2E_API_URL}/builder/context`, {
      jar: ctx.buyerJar ?? undefined,
    });
    assertUnauthorized(res, 'builder/context');
  });

  await runCheck('Buyer session → /admin/reports/deals denied', async () => {
    const res = await fetchWithJar(`${E2E_API_URL}/admin/reports/deals`, {
      jar: ctx.buyerJar ?? undefined,
    });
    assertUnauthorized(res, 'admin/reports/deals');
  });

  await runCheck('Buyer session → /qr/check-in denied', async () => {
    const csrf = await fetchWithJar(`${E2E_API_URL}/auth/csrf`, {
      jar: ctx.buyerJar ?? undefined,
    });
    const { csrfToken } = /** @type {{ csrfToken?: string }} */ (await csrf.json());
    assert(csrfToken, 'csrfToken missing');
    const res = await fetchWithJar(`${E2E_API_URL}/qr/check-in`, {
      jar: ctx.buyerJar ?? undefined,
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-csrf-token': csrfToken,
        origin: E2E_BASE_URL,
      },
      body: JSON.stringify({ token: 'not-a-real-token' }),
    });
    assertUnauthorized(res, 'qr/check-in');
  });

  await runCheck('Anonymous → protected Nest routes denied', async () => {
    for (const path of ['/builder/context', '/admin/reports/deals', '/buyer/profile', '/auth/me']) {
      const res = await fetchWithJar(`${E2E_API_URL}${path}`);
      assertUnauthorized(res, path);
    }
  });

  if (!seeds.builder) {
    skipCheck('Builder portal access', 'SEED_DEMO_BUILDER_PASSWORD not set in .env');
  } else {
    await runCheck('Builder login → /builder/context 200', async () => {
      const jar = new CookieJar();
      await loginWithCredentials(
        E2E_API_URL,
        jar,
        {
          email: DEMO_BUILDER_EMAIL,
          password: seeds.builder.password,
        },
        E2E_BASE_URL,
      );
      const res = await fetchWithJar(`${E2E_API_URL}/builder/context`, { jar });
      assert(res.status === 200, `status ${res.status}`);
    });
  }

  if (!seeds.admin) {
    skipCheck('Admin area + reports', 'SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD not set in .env');
  } else {
    await runCheck('Admin login → /admin/reports/deals CSV', async () => {
      const jar = new CookieJar();
      await loginWithCredentials(
        E2E_API_URL,
        jar,
        {
          email: seeds.admin.email,
          password: seeds.admin.password,
        },
        E2E_BASE_URL,
      );
      const me = await fetchWithJar(`${E2E_API_URL}/auth/me`, { jar });
      assert(me.status === 200, `auth/me ${me.status}`);
      const csv = await fetchWithJar(`${E2E_API_URL}/admin/reports/deals`, { jar });
      assert(csv.status === 200, `reports ${csv.status}`);
      const type = csv.headers.get('content-type') ?? '';
      assert(type.includes('text/csv'), `expected csv, got ${type}`);
    });

    await runCheck('Admin with active-company cookie → /builder/context 200', async () => {
      const jar = new CookieJar();
      await loginWithCredentials(
        E2E_API_URL,
        jar,
        {
          email: seeds.admin.email,
          password: seeds.admin.password,
        },
        E2E_BASE_URL,
      );
      const company = await getPrisma().company.findFirst({
        orderBy: { createdAt: 'asc' },
        select: { id: true },
      });
      assert(company?.id, 'demo company required — run db:seed');
      jar.set('toonexpo_active_company', company.id);
      const portal = await fetchWithJar(`${E2E_API_URL}/builder/context`, { jar });
      assert(portal.status === 200, `builder/context ${portal.status}`);
    });
  }

  if (!seeds.entrance) {
    skipCheck(
      'Entrance staff /checkin',
      'SEED_ENTRANCE_EMAIL / SEED_ENTRANCE_PASSWORD not set in .env',
    );
  } else {
    await runCheck('Entrance staff login → auth/me ENTRANCE_STAFF', async () => {
      const jar = new CookieJar();
      await loginWithCredentials(
        E2E_API_URL,
        jar,
        {
          email: seeds.entrance.email,
          password: seeds.entrance.password,
        },
        E2E_BASE_URL,
      );
      const res = await fetchWithJar(`${E2E_API_URL}/auth/me`, { jar });
      assert(res.status === 200, `status ${res.status}`);
      const session = /** @type {{ user?: { role?: string } }} */ (await res.json());
      assert(session.user?.role === 'ENTRANCE_STAFF', `role ${session.user?.role}`);
    });

    if (!ctx.buyerEmail) {
      skipCheck(
        'Entrance staff QR check-in',
        'No e2e buyer email in context (buyer journey did not run)',
      );
    } else {
      const qrToken = await getBuyerQrTokenByEmail(ctx.buyerEmail);
      if (!qrToken) {
        skipCheck(
          'Entrance staff QR check-in',
          'No seeded buyer with active QR; e2e buyer QR not found after account visit',
        );
      } else {
        await runCheck('Entrance staff check-in via e2e buyer QR', async () => {
          const staff = await getPrisma().user.findUnique({
            where: { email: seeds.entrance.email.toLowerCase() },
            select: { id: true },
          });
          assert(staff?.id, 'entrance staff user not found — run db:seed');
          const result = await performEntranceCheckInViaPrisma({
            qrToken,
            staffUserId: staff.id,
          });
          assert(result.ok, `check-in failed: ${result.ok ? '' : result.errorKey}`);
          return 'PARTIAL: performCheckInAction is server-action-only; check-in via Prisma helper';
        });
      }
    }
  }
}
