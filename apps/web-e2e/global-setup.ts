import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

import { MONOREPO_ROOT } from './src/helpers/env.js';

const execFileAsync = promisify(execFile);

/**
 * Seeds the database before the Playwright suite (idempotent).
 */
const globalSetup = async (): Promise<void> => {
  console.info('[web-e2e] Running Prisma seed…');
  await execFileAsync('pnpm', ['--filter', '@toonexpo/db', 'run', 'db:seed'], {
    cwd: MONOREPO_ROOT,
    env: process.env,
    maxBuffer: 10 * 1024 * 1024,
  });
  console.info('[web-e2e] Seed complete.');
};

export default globalSetup;
