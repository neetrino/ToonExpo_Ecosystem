#!/usr/bin/env node
/**
 * Seeds the DB (unless SKIP_E2E_SEED=1), then runs Playwright.
 * Seed must happen before Playwright boots webServers (API holds DB connections).
 * Playwright starts webServer before globalSetup — seeding there races the API.
 * Retries live in `packages/db/prisma/seed.ts` only (do not nest another retry loop here).
 */
import { spawn } from 'node:child_process';
import console from 'node:console';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const webRoot = path.resolve(scriptDir, '..');
const monorepoRoot = path.resolve(webRoot, '../..');

const shouldSkipSeed = () => {
  if (process.argv.includes('--skip-seed')) {
    return true;
  }
  const raw = process.env['SKIP_E2E_SEED']?.trim().toLowerCase();
  return raw === '1' || raw === 'true' || raw === 'yes';
};

const playwrightArgv = process.argv.slice(2).filter((arg) => arg !== '--skip-seed');

const isWindows = process.platform === 'win32';

/** Quote for cmd.exe when `shell: true` (pipes/spaces in Playwright --grep). */
const escapeCmdArg = (arg) => {
  if (arg.length === 0) {
    return '""';
  }
  if (!/[\s"&<>|^%]/.test(arg)) {
    return arg;
  }
  return `"${arg.replace(/"/g, '""')}"`;
};

const runCommand = (command, args, cwd) =>
  new Promise((resolve, reject) => {
    const child = isWindows
      ? spawn([command, ...args].map(escapeCmdArg).join(' '), {
          cwd,
          env: process.env,
          stdio: 'inherit',
          shell: true,
        })
      : spawn(command, args, {
          cwd,
          env: process.env,
          stdio: 'inherit',
          shell: false,
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

const main = async () => {
  if (shouldSkipSeed()) {
    console.info('[web/e2e] SKIP_E2E_SEED set — skipping database seed.');
  } else {
    console.info('[web/e2e] Running database seed…');
    await runCommand('pnpm', ['run', 'db:seed'], monorepoRoot);
    console.info('[web/e2e] Seed complete.');
  }

  const playwrightArgs = [
    'exec',
    'playwright',
    'test',
    '-c',
    'e2e/playwright.config.ts',
    ...playwrightArgv,
  ];

  await runCommand('pnpm', playwrightArgs, webRoot);
};

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
