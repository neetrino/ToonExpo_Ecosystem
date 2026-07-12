import { DEMO_BUILDER_EMAIL, E2E_BASE_URL } from '../config.mjs';
import {
  detectSeedCredentials,
  getBuyerQrTokenByEmail,
  getPrisma,
  performEntranceCheckInViaPrisma,
} from '../db.mjs';
import { CookieJar, fetchWithJar, locationOf, loginWithCredentials } from '../http.mjs';
import { assert, runCheck, skipCheck } from '../report.mjs';

/**
 * @param {Response} res
 * @param {string} label
 */
function assertDenied(res, label) {
  const loc = locationOf(res);
  const redirected =
    res.status >= 300 &&
    res.status < 400 &&
    (loc.includes('/login') || loc.endsWith('/') || loc.includes('/en'));
  assert(redirected || res.status !== 200, `${label}: expected deny, got ${res.status} loc=${loc}`);
  assert(res.status !== 200, `${label}: must not be 200`);
}

/**
 * RBAC matrix for buyer / anonymous / optional builder+admin+entrance.
 * @param {{ buyerJar: import('../http.mjs').CookieJar | null; buyerEmail?: string }} ctx
 */
export async function runRbacFlow(ctx) {
  console.log('\n[3] RBAC matrix');
  const seeds = detectSeedCredentials();

  await runCheck('Buyer cookie → /en/portal denied', async () => {
    assert(ctx.buyerJar?.hasSession(), 'buyer session required');
    const res = await fetchWithJar(`${E2E_BASE_URL}/en/portal`, {
      jar: ctx.buyerJar ?? undefined,
      redirect: 'manual',
    });
    assertDenied(res, 'portal');
  });

  await runCheck('Buyer cookie → /en/admin denied', async () => {
    const res = await fetchWithJar(`${E2E_BASE_URL}/en/admin`, {
      jar: ctx.buyerJar ?? undefined,
      redirect: 'manual',
    });
    assertDenied(res, 'admin');
  });

  await runCheck('Buyer cookie → /en/checkin denied', async () => {
    const res = await fetchWithJar(`${E2E_BASE_URL}/en/checkin`, {
      jar: ctx.buyerJar ?? undefined,
      redirect: 'manual',
    });
    assertDenied(res, 'checkin');
  });

  await runCheck('Buyer cookie → /api/admin/reports/deals 401', async () => {
    const res = await fetchWithJar(`${E2E_BASE_URL}/api/admin/reports/deals`, {
      jar: ctx.buyerJar ?? undefined,
    });
    assert(res.status === 401 || res.status === 403, `expected 401/403, got ${res.status}`);
  });

  await runCheck('Anonymous → protected routes denied', async () => {
    for (const path of [
      '/en/portal',
      '/en/portal/company',
      '/en/admin',
      '/en/checkin',
      '/en/account',
    ]) {
      const res = await fetchWithJar(`${E2E_BASE_URL}${path}`, { redirect: 'manual' });
      assertDenied(res, path);
    }
    const api = await fetchWithJar(`${E2E_BASE_URL}/api/admin/reports/deals`);
    assert(api.status === 401 || api.status === 403, `anon reports: ${api.status}`);
  });

  if (!seeds.builder) {
    skipCheck('Builder portal access', 'SEED_DEMO_BUILDER_PASSWORD not set in .env');
  } else {
    await runCheck('Builder login → /en/portal 200', async () => {
      const jar = new CookieJar();
      await loginWithCredentials(E2E_BASE_URL, jar, {
        email: DEMO_BUILDER_EMAIL,
        password: seeds.builder.password,
      });
      const res = await fetchWithJar(`${E2E_BASE_URL}/en/portal`, { jar });
      assert(res.status === 200, `status ${res.status}`);
    });
  }

  if (!seeds.admin) {
    skipCheck('Admin area + reports', 'SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD not set in .env');
  } else {
    await runCheck('Admin login → /en/admin 200 + reports CSV', async () => {
      const jar = new CookieJar();
      await loginWithCredentials(E2E_BASE_URL, jar, {
        email: seeds.admin.email,
        password: seeds.admin.password,
      });
      const page = await fetchWithJar(`${E2E_BASE_URL}/en/admin`, { jar });
      assert(page.status === 200, `admin page ${page.status}`);
      const csv = await fetchWithJar(`${E2E_BASE_URL}/api/admin/reports/deals`, { jar });
      assert(csv.status === 200, `reports ${csv.status}`);
      const type = csv.headers.get('content-type') ?? '';
      assert(type.includes('text/csv'), `expected csv, got ${type}`);
    });

    await runCheck('Admin with active-company cookie → /en/portal 200', async () => {
      const jar = new CookieJar();
      await loginWithCredentials(E2E_BASE_URL, jar, {
        email: seeds.admin.email,
        password: seeds.admin.password,
      });
      const company = await getPrisma().company.findFirst({
        orderBy: { createdAt: 'asc' },
        select: { id: true },
      });
      assert(company?.id, 'demo company required — run db:seed');
      jar.set('toonexpo_active_company', company.id);
      const portal = await fetchWithJar(`${E2E_BASE_URL}/en/portal`, { jar });
      assert(portal.status === 200, `portal ${portal.status}`);
    });
  }

  if (!seeds.entrance) {
    skipCheck(
      'Entrance staff /checkin',
      'SEED_ENTRANCE_EMAIL / SEED_ENTRANCE_PASSWORD not set in .env',
    );
  } else {
    await runCheck('Entrance staff login → /en/checkin 200', async () => {
      const jar = new CookieJar();
      await loginWithCredentials(E2E_BASE_URL, jar, {
        email: seeds.entrance.email,
        password: seeds.entrance.password,
      });
      const res = await fetchWithJar(`${E2E_BASE_URL}/en/checkin`, { jar });
      assert(res.status === 200, `status ${res.status}`);
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
