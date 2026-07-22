#!/usr/bin/env node
/**
 * Seeds the DB, then runs Playwright.
 * Seed must happen before Playwright boots webServers (API holds DB connections).
 * Playwright starts webServer before globalSetup — seeding there races the API.
 */
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SEED_MAX_ATTEMPTS = 3;
const SEED_RETRY_DELAY_MS = 1_500;

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const webRoot = path.resolve(scriptDir, '..');
const monorepoRoot = path.resolve(webRoot, '../..');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const runCommand = (command, args, cwd) =>
  new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd,
      env: process.env,
      stdio: 'inherit',
      shell: process.platform === 'win32',
    });
    child.on('error', reject);
    child.on('exit', (code, signal) => {
      if (signal) {
        reject(new Error(`Command killed by signal ${signal}`));
        return;
      }
      if (code !== 0) {
        reject(new Error(`Command failed with exit code ${code ?? 1}`));
        return;
      }
      resolve();
    });
  });

const runSeedWithRetry = async () => {
  let lastError;
  for (let attempt = 1; attempt <= SEED_MAX_ATTEMPTS; attempt += 1) {
    try {
      console.info(`[web/e2e] Running database seed (attempt ${attempt}/${SEED_MAX_ATTEMPTS})…`);
      await runCommand('pnpm', ['run', 'db:seed'], monorepoRoot);
      console.info('[web/e2e] Seed complete.');
      return;
    } catch (error) {
      lastError = error;
      console.warn(`[web/e2e] Seed attempt ${attempt} failed: ${error instanceof Error ? error.message : error}`);
      if (attempt < SEED_MAX_ATTEMPTS) {
        await sleep(SEED_RETRY_DELAY_MS * attempt);
      }
    }
  }
  throw lastError instanceof Error
    ? lastError
    : new Error(`[web/e2e] Database seed failed after ${SEED_MAX_ATTEMPTS} attempts`);
};

const main = async () => {
  await runSeedWithRetry();

  const playwrightArgs = [
    'exec',
    'playwright',
    'test',
    '-c',
    'e2e/playwright.config.ts',
    ...process.argv.slice(2),
  ];

  await runCommand('pnpm', playwrightArgs, webRoot);
};

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
