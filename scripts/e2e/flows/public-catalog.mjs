import {
  DRAFT_PARTNER_NAME,
  E2E_BASE_URL,
  HIDDEN_COURT_NAME,
  SUNRISE_NAME,
  DEMO_COMPANY_SLUG,
  SUNRISE_SLUG,
} from '../config.mjs';
import { fetchWithJar, locationOf } from '../http.mjs';
import { assert, runCheck } from '../report.mjs';

/**
 * Public catalog smoke checks.
 */
export async function runPublicCatalogFlow() {
  console.log('\n[1] Public catalog');

  await runCheck('GET / → 307 /en', async () => {
    const res = await fetchWithJar(`${E2E_BASE_URL}/`, { redirect: 'manual' });
    assert(res.status === 307 || res.status === 308, `expected 307, got ${res.status}`);
    const loc = locationOf(res);
    assert(loc.includes('/en'), `expected /en redirect, got ${loc}`);
  });

  await runCheck('GET /en/projects lists Sunrise, hides Hidden Court', async () => {
    const res = await fetchWithJar(`${E2E_BASE_URL}/en/projects`);
    assert(res.status === 200, `status ${res.status}`);
    const html = await res.text();
    assert(html.includes(SUNRISE_NAME), 'Sunrise Residence missing');
    assert(!html.includes(HIDDEN_COURT_NAME), 'Hidden Court leaked into catalog');
  });

  await runCheck('GET project detail has visual map + request CTA', async () => {
    const url = `${E2E_BASE_URL}/en/projects/${DEMO_COMPANY_SLUG}/${SUNRISE_SLUG}`;
    const res = await fetchWithJar(url);
    assert(res.status === 200, `status ${res.status}`);
    const html = await res.text();
    assert(html.includes(SUNRISE_NAME), 'project name missing');
    assert(html.includes('Request contact'), 'expected request CTA');
    assert(html.includes('Site plan'), 'expected visual map (Site plan)');
  });

  await runCheck('GET /de → 404', async () => {
    const res = await fetchWithJar(`${E2E_BASE_URL}/de`, { redirect: 'manual' });
    assert(res.status === 404, `expected 404, got ${res.status}`);
  });

  await runCheck('GET /en/partners published only', async () => {
    const res = await fetchWithJar(`${E2E_BASE_URL}/en/partners`);
    assert(res.status === 200, `status ${res.status}`);
    const html = await res.text();
    assert(
      html.includes('Converse Bank') || html.includes('PixelRender'),
      'published partners missing',
    );
    assert(!html.includes(DRAFT_PARTNER_NAME), 'draft partner leaked');
  });

  await runCheck('GET /en/mortgage 200', async () => {
    const res = await fetchWithJar(`${E2E_BASE_URL}/en/mortgage`);
    assert(res.status === 200, `status ${res.status}`);
  });

  await runCheck('GET /en/q/invalidtoken generic 200', async () => {
    const res = await fetchWithJar(`${E2E_BASE_URL}/en/q/invalidtoken`);
    assert(res.status === 200, `status ${res.status}`);
    const html = await res.text();
    assert(html.includes('Visitor QR') || html.includes('Sign in'), 'expected generic QR copy');
  });
}
