import {
  BUYER_NAME,
  BUYER_PASSWORD,
  BUYER_PHONE,
  E2E_API_URL,
  E2E_BASE_URL,
  buyerEmail,
  e2eMarker,
} from '../config.mjs';
import { createPublicRequestDeal, seedBuyer } from '../db.mjs';
import { CookieJar, fetchWithJar, loginWithCredentials } from '../http.mjs';
import { assert, runCheck } from '../report.mjs';

/**
 * Buyer journey: seed → Nest login → profile / deals via Nest (session on API origin).
 * @param {{ runId: string; track: (partial: Record<string, unknown>) => void; setBuyerJar: (jar: CookieJar) => void; setBuyerEmail: (email: string) => void }} ctx
 */
export async function runBuyerJourneyFlow(ctx) {
  console.log('\n[2] Buyer journey');
  const email = buyerEmail(ctx.runId);
  const jar = new CookieJar();
  /** @type {string | undefined} */
  let userId;

  ctx.track({ emails: [email] });
  ctx.setBuyerEmail(email);

  await runCheck('Register buyer (Prisma seed — server actions not HTTP)', async () => {
    const user = await seedBuyer({
      email,
      name: BUYER_NAME,
      phone: BUYER_PHONE,
      password: BUYER_PASSWORD,
    });
    userId = user.id;
    ctx.track({ userIds: [user.id] });
    return 'PARTIAL: registerBuyer is server-action-only; seeded via Prisma then HTTP login';
  });

  await runCheck('Login buyer via Nest csrf → login', async () => {
    await loginWithCredentials(E2E_API_URL, jar, { email, password: BUYER_PASSWORD }, E2E_BASE_URL);
    ctx.setBuyerJar(jar);
    const me = await fetchWithJar(`${E2E_API_URL}/auth/me`, { jar });
    assert(me.status === 200, `auth/me status ${me.status}`);
    const session = /** @type {{ user?: { email?: string } }} */ (await me.json());
    assert(session.user?.email === email, 'auth/me email mismatch');
  });

  await runCheck('GET /buyer/profile + empty deals (Nest session)', async () => {
    const profile = await fetchWithJar(`${E2E_API_URL}/buyer/profile`, { jar });
    assert(profile.status === 200, `profile status ${profile.status}`);
    const deals = await fetchWithJar(`${E2E_API_URL}/crm/buyer/deals`, { jar });
    assert(deals.status === 200, `deals status ${deals.status}`);
    const list = /** @type {unknown} */ (await deals.json());
    assert(Array.isArray(list) && list.length === 0, 'expected no buyer deals yet');
  });

  await runCheck('Submit public request (UI-less mutation)', async () => {
    assert(userId, 'userId missing');
    const message = `${e2eMarker(ctx.runId)} public request`;
    const { deal } = await createPublicRequestDeal({
      buyerUserId: userId,
      name: BUYER_NAME,
      email,
      phone: BUYER_PHONE,
      message,
    });
    ctx.track({ dealIds: [deal.id] });
    return 'PARTIAL: publicRequestFormAction is server-action-only; deal created via Prisma helper';
  });

  await runCheck('GET /crm/buyer/deals lists the new request', async () => {
    const deals = await fetchWithJar(`${E2E_API_URL}/crm/buyer/deals`, {
      jar,
      headers: { 'cache-control': 'no-cache' },
    });
    assert(deals.status === 200, `deals status ${deals.status}`);
    const list = /** @type {Array<{ project?: { name?: string | null } }>} */ (await deals.json());
    assert(list.length >= 1, 'expected at least one buyer deal');
    assert(
      list.some((d) => d.project?.name === 'Sunrise Residence'),
      'project name missing from buyer deals',
    );
  });
}
