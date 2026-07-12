import { defineConfig, devices } from '@playwright/test';

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000';
const IS_CI = Boolean(process.env.CI);

/**
 * Critical-journey UI e2e (alongside `pnpm e2e` fetch smoke).
 * Expects web on BASE_URL, or reuses an already-running server locally.
 * Prefer `pnpm --filter @toonexpo/web dev` (or a production `next start` after build).
 */
export default defineConfig({
  testDir: './e2e/playwright',
  fullyParallel: false,
  forbidOnly: IS_CI,
  retries: IS_CI ? 1 : 0,
  workers: 1,
  reporter: [['list']],
  timeout: 60_000,
  expect: { timeout: 15_000 },
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    // Requires a prior web build if nothing is already listening.
    // Locally prefer `pnpm --filter @toonexpo/web dev` and reuseExistingServer.
    command: 'pnpm --filter @toonexpo/web exec next start -p 3000',
    url: BASE_URL,
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
