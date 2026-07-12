import { ANALYTICS_WAIT_MS, DEMO_COMPANY_SLUG, E2E_BASE_URL, SUNRISE_SLUG } from '../config.mjs';
import { countProjectViews } from '../db.mjs';
import { fetchWithJar } from '../http.mjs';
import { assert, runCheck } from '../report.mjs';

/**
 * Analytics: PROJECT_VIEW increments after visiting project detail.
 */
export async function runAnalyticsFlow() {
  console.log('\n[5] Analytics');

  await runCheck('PROJECT_VIEW increments after detail visit', async () => {
    const before = await countProjectViews(SUNRISE_SLUG);
    const url = `${E2E_BASE_URL}/en/projects/${DEMO_COMPANY_SLUG}/${SUNRISE_SLUG}`;
    const res = await fetchWithJar(url);
    assert(res.status === 200, `detail status ${res.status}`);
    // after() is fire-and-forget — brief wait then poll.
    const deadline = Date.now() + ANALYTICS_WAIT_MS * 4;
    let after = before;
    while (Date.now() < deadline) {
      await new Promise((r) => setTimeout(r, ANALYTICS_WAIT_MS));
      after = await countProjectViews(SUNRISE_SLUG);
      if (after.count > before.count) break;
    }
    assert(
      after.count > before.count,
      `view count did not increase (${before.count} → ${after.count})`,
    );
    return `${before.count} → ${after.count}`;
  });
}
