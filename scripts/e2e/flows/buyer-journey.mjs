import {
  BUYER_NAME,
  BUYER_PASSWORD,
  BUYER_PHONE,
  E2E_BASE_URL,
  buyerEmail,
  e2eMarker,
} from '../config.mjs';
import { createPublicRequestDeal, seedBuyer } from '../db.mjs';
import { CookieJar, fetchWithJar, loginWithCredentials } from '../http.mjs';
import { assert, runCheck } from '../report.mjs';

/**
 * Buyer journey: seed register (server-action limitation) → login → account → request.
 * @param {{ runId: string; track: (partial: Record<string, unknown>) => void; setBuyerJar: (jar: CookieJar) => void }} ctx
 */
export async function runBuyerJourneyFlow(ctx) {
  console.log('\n[2] Buyer journey');
  const email = buyerEmail(ctx.runId);
  const jar = new CookieJar();
  /** @type {string | undefined} */
  let userId;

  ctx.track({ emails: [email] });

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

  await runCheck('Login buyer via csrf → credentials', async () => {
    await loginWithCredentials(E2E_BASE_URL, jar, { email, password: BUYER_PASSWORD });
    ctx.setBuyerJar(jar);
  });

  await runCheck('GET /en/account shows My QR + empty requests', async () => {
    const res = await fetchWithJar(`${E2E_BASE_URL}/en/account`, { jar });
    assert(res.status === 200, `status ${res.status}`);
    const html = await res.text();
    assert(html.includes('buyer-qr') || html.includes('My QR'), 'My QR section missing');
    // Table is only rendered when deals exist — safer than i18n empty-copy strings.
    assert(!html.includes('buyer-deals-table'), 'expected no deals table yet');
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

  await runCheck('GET /en/account lists the new request', async () => {
    const res = await fetchWithJar(`${E2E_BASE_URL}/en/account`, {
      jar,
      headers: { 'cache-control': 'no-cache' },
    });
    assert(res.status === 200, `status ${res.status}`);
    const html = await res.text();
    assert(html.includes('buyer-deals-table'), 'deals table not rendered');
    assert(html.includes('Sunrise Residence'), 'project name missing from requests table');
    assert(html.includes('Request sent'), 'buyer-facing status missing');
  });
}
