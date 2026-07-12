/**
 * E2E smoke runner — assumes web + API are already running.
 * Usage: pnpm e2e
 */
import { E2E_API_URL, E2E_BASE_URL } from './config.mjs';
import { cleanupE2eData, disconnectPrisma } from './db.mjs';
import { runAnalyticsFlow } from './flows/analytics.mjs';
import { runBosApiFlow } from './flows/bos-api.mjs';
import { runBuyerJourneyFlow } from './flows/buyer-journey.mjs';
import { runPublicCatalogFlow } from './flows/public-catalog.mjs';
import { runRbacFlow } from './flows/rbac.mjs';
import { printSummary } from './report.mjs';

async function main() {
  const runId = `${Date.now().toString(36)}`;
  console.log(`ToonExpo E2E smoke — runId=${runId}`);
  console.log(`  WEB ${E2E_BASE_URL}`);
  console.log(`  API ${E2E_API_URL}`);

  /** @type {{
   *   emails: string[];
   *   requestIds: string[];
   *   companyIds: string[];
   *   userIds: string[];
   *   dealIds: string[];
   * }} */
  const cleanup = {
    emails: [],
    requestIds: [],
    companyIds: [],
    userIds: [],
    dealIds: [],
  };

  /** @type {import('./http.mjs').CookieJar | null} */
  let buyerJar = null;

  const track = (partial) => {
    for (const key of /** @type {const} */ ([
      'emails',
      'requestIds',
      'companyIds',
      'userIds',
      'dealIds',
    ])) {
      if (partial[key]) cleanup[key].push(...partial[key]);
    }
  };

  try {
    await runPublicCatalogFlow();
    await runBuyerJourneyFlow({
      runId,
      track,
      setBuyerJar: (jar) => {
        buyerJar = jar;
      },
    });
    await runRbacFlow({ buyerJar });
    await runBosApiFlow({ runId, track });
    await runAnalyticsFlow();
  } finally {
    console.log('\n[cleanup] removing e2e-* rows…');
    try {
      await cleanupE2eData({ runId, ...cleanup });
      console.log('  cleanup done');
    } catch (err) {
      console.error('  cleanup failed:', err instanceof Error ? err.message : err);
    }
    await disconnectPrisma();
  }

  const ok = printSummary();
  process.exit(ok ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
