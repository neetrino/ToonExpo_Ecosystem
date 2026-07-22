import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { defineConfig, devices } from '@playwright/test';
import { config as loadEnv } from 'dotenv';

import { API_HEALTH_URL, API_ORIGIN, MONOREPO_ROOT, WEB_ORIGIN } from './src/helpers/env.js';

const packageRoot = path.dirname(fileURLToPath(import.meta.url));
loadEnv({ path: path.join(MONOREPO_ROOT, '.env') });

const reuseExistingServer = process.env['CI'] !== 'true';
const webPort = new URL(WEB_ORIGIN).port || '3000';
const apiPort = new URL(API_ORIGIN).port || '4000';

/**
 * Chromium-only smoke suite. Starts built API + Next.js servers unless already up.
 * Database seed runs in `scripts/e2e-with-seed.mjs` before this config loads
 * (Playwright would otherwise start webServer before any globalSetup seed).
 * Run `pnpm e2e:build` first (or root `pnpm e2e`, which builds then tests).
 */
export default defineConfig({
  testDir: path.join(packageRoot, 'src'),
  fullyParallel: false,
  forbidOnly: Boolean(process.env['CI']),
  retries: process.env['CI'] ? 1 : 0,
  workers: 1,
  reporter: process.env['CI'] ? [['github'], ['list']] : 'list',
  timeout: 60_000,
  expect: { timeout: 15_000 },
  use: {
    baseURL: WEB_ORIGIN,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'off',
    locale: 'hy-AM',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: [
    {
      command: 'pnpm --filter @toonexpo/api start',
      cwd: MONOREPO_ROOT,
      url: API_HEALTH_URL,
      reuseExistingServer,
      timeout: 120_000,
      env: {
        ...process.env,
        PORT: apiPort,
        APP_URL: WEB_ORIGIN,
        CORS_ORIGINS: WEB_ORIGIN,
        NEXT_PUBLIC_API_URL: API_ORIGIN,
        NODE_ENV: process.env['NODE_ENV'] ?? 'development',
      },
    },
    {
      command: `pnpm --filter @toonexpo/web exec next start --port ${webPort}`,
      cwd: MONOREPO_ROOT,
      url: WEB_ORIGIN,
      reuseExistingServer,
      timeout: 120_000,
      env: {
        ...process.env,
        APP_URL: WEB_ORIGIN,
        NEXT_PUBLIC_API_URL: API_ORIGIN,
      },
    },
  ],
});
