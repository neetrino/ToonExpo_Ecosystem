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

  await runCheck('GET apartment detail 200 with code + public price', async () => {
    const projectUrl = `${E2E_BASE_URL}/en/projects/${DEMO_COMPANY_SLUG}/${SUNRISE_SLUG}`;
    const projectRes = await fetchWithJar(projectUrl);
    assert(projectRes.status === 200, `project status ${projectRes.status}`);
    const projectHtml = await projectRes.text();
    const match = projectHtml.match(
      new RegExp(
        `/projects/${DEMO_COMPANY_SLUG}/${SUNRISE_SLUG}/apartments/(c[a-z0-9]+)[^"]*"[^>]*>\\s*101`,
      ),
    );
    assert(match?.[1], 'apartment 101 detail link missing');
    const apartmentId = match[1];
    const aptRes = await fetchWithJar(
      `${E2E_BASE_URL}/en/projects/${DEMO_COMPANY_SLUG}/${SUNRISE_SLUG}/apartments/${apartmentId}`,
    );
    assert(aptRes.status === 200, `apartment status ${aptRes.status}`);
    const aptHtml = await aptRes.text();
    assert(aptHtml.includes('101'), 'apartment code missing');
    assert(/AMD|֏|85[\s,]?000[\s,]?000/.test(aptHtml), 'expected public AMD price');
  });

  await runCheck('GET BY_REQUEST apartment hides AMD amount anonymously', async () => {
    const projectUrl = `${E2E_BASE_URL}/en/projects/${DEMO_COMPANY_SLUG}/${SUNRISE_SLUG}`;
    const projectRes = await fetchWithJar(projectUrl);
    const projectHtml = await projectRes.text();
    const match = projectHtml.match(
      new RegExp(
        `/projects/${DEMO_COMPANY_SLUG}/${SUNRISE_SLUG}/apartments/(c[a-z0-9]+)[^"]*"[^>]*>\\s*201`,
      ),
    );
    assert(match?.[1], 'apartment 201 detail link missing');
    const aptRes = await fetchWithJar(
      `${E2E_BASE_URL}/en/projects/${DEMO_COMPANY_SLUG}/${SUNRISE_SLUG}/apartments/${match[1]}`,
    );
    assert(aptRes.status === 200, `apartment status ${aptRes.status}`);
    const aptHtml = await aptRes.text();
    assert(aptHtml.includes('Price on request'), 'expected price-on-request copy');
    assert(!/79[\s,]?000[\s,]?000/.test(aptHtml), 'BY_REQUEST price leaked as AMD amount');
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
    const html = await res.text();
    assert(html.includes('Min. down payment'), 'min down payment label missing');
  });

  await runCheck('GET /en/q/invalidtoken generic 200', async () => {
    const res = await fetchWithJar(`${E2E_BASE_URL}/en/q/invalidtoken`);
    assert(res.status === 200, `status ${res.status}`);
    const html = await res.text();
    assert(html.includes('Visitor QR') || html.includes('Sign in'), 'expected generic QR copy');
  });
}
