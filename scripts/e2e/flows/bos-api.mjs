import { bosEmail, E2E_API_URL, E2E_BOS_API_KEY, e2eMarker } from '../config.mjs';
import { countUsersByEmail } from '../db.mjs';
import { assert, runCheck } from '../report.mjs';

/**
 * @param {string} [apiKey]
 * @param {unknown} [body]
 */
async function postProvisioning(apiKey, body) {
  /** @type {Record<string, string>} */
  const headers = { 'content-type': 'application/json' };
  if (apiKey !== undefined) headers['x-bos-api-key'] = apiKey;
  return fetch(`${E2E_API_URL}/integrations/bos/provisioning`, {
    method: 'POST',
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

/**
 * BOS provisioning API smoke.
 * @param {{ runId: string; track: (partial: Record<string, unknown>) => void }} ctx
 */
export async function runBosApiFlow(ctx) {
  console.log('\n[4] BOS API');
  const requestId = `${e2eMarker(ctx.runId)}-bos-req`;
  const email = bosEmail(ctx.runId);
  const companyName = `${e2eMarker(ctx.runId)} Builder Co`;
  const payload = {
    requestId,
    bosCompanyId: `${e2eMarker(ctx.runId)}-bos-co`,
    companyName,
    companyType: 'builder',
    primaryContactName: 'E2E BOS Contact',
    primaryContactEmail: email,
    primaryContactPhone: '+37499000001',
    requestedModules: ['builder_portal'],
  };

  ctx.track({ emails: [email], requestIds: [requestId] });

  await runCheck('BOS no key → 401', async () => {
    const res = await postProvisioning(undefined, payload);
    const body = await res.text().catch(() => '');
    assert(res.status === 401, `expected 401, got ${res.status} body=${body.slice(0, 300)}`);
  });

  await runCheck('BOS wrong key → 401', async () => {
    const res = await postProvisioning('wrong-key', payload);
    const body = await res.text().catch(() => '');
    assert(res.status === 401, `expected 401, got ${res.status} body=${body.slice(0, 300)}`);
  });

  /** @type {Record<string, unknown> | null} */
  let created = null;

  await runCheck('BOS valid key → success', async () => {
    const res = await postProvisioning(E2E_BOS_API_KEY, payload);
    const bodyText = await res.text();
    assert(
      res.status === 201 || res.status === 200,
      `expected 201/200, got ${res.status} body=${bodyText.slice(0, 300)}`,
    );
    created = /** @type {Record<string, unknown>} */ (JSON.parse(bodyText));
    assert(created.status === 'success', `status=${created.status} body=${bodyText.slice(0, 300)}`);
    assert(typeof created.primaryUserId === 'string', 'primaryUserId missing');
    assert(typeof created.toonexpoCompanyId === 'string', 'companyId missing');
    ctx.track({
      userIds: [/** @type {string} */ (created.primaryUserId)],
      companyIds: [/** @type {string} */ (created.toonexpoCompanyId)],
    });
  });

  await runCheck('BOS replay → idempotent:true', async () => {
    const res = await postProvisioning(E2E_BOS_API_KEY, payload);
    const bodyText = await res.text();
    assert(res.status === 200, `expected 200, got ${res.status} body=${bodyText.slice(0, 300)}`);
    const body = /** @type {Record<string, unknown>} */ (JSON.parse(bodyText));
    assert(body.idempotent === true, `expected idempotent:true, got ${bodyText.slice(0, 300)}`);
    assert(body.primaryUserId === created?.primaryUserId, 'replay user mismatch');
  });

  await runCheck('BOS DB assert single user', async () => {
    const count = await countUsersByEmail(email);
    assert(count === 1, `expected 1 user, got ${count}`);
  });
}
