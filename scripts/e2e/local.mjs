/**
 * Convenience: build → start web:3010 + api:4010 → run smoke → kill servers.
 * Usage: pnpm e2e:local
 */
import { spawn } from 'node:child_process';
import { resolve } from 'node:path';

import {
  E2E_API_URL,
  E2E_BASE_URL,
  E2E_BOS_API_KEY,
  READY_POLL_MS,
  READY_TIMEOUT_MS,
  ROOT,
} from './config.mjs';
import { waitForReady } from './http.mjs';

/** @type {import('node:child_process').ChildProcess[]} */
const children = [];
let shuttingDown = false;

function killChildren() {
  if (shuttingDown) return;
  shuttingDown = true;
  for (const child of children) {
    if (!child.killed && child.pid) {
      try {
        process.kill(-child.pid, 'SIGTERM');
      } catch {
        try {
          child.kill('SIGTERM');
        } catch {
          /* ignore */
        }
      }
    }
  }
}

process.on('SIGINT', () => {
  killChildren();
  process.exit(130);
});
process.on('SIGTERM', () => {
  killChildren();
  process.exit(143);
});

/**
 * @param {string} command
 * @param {string[]} args
 * @param {NodeJS.ProcessEnv} [env]
 * @param {string} [cwd]
 */
function spawnLogged(command, args, env = {}, cwd = ROOT) {
  const child = spawn(command, args, {
    cwd,
    env: { ...process.env, ...env },
    stdio: ['ignore', 'pipe', 'pipe'],
    detached: true,
  });
  children.push(child);
  const tag = `${command} ${args[0] ?? ''}`;
  child.stdout?.on('data', (buf) => {
    process.stdout.write(`[${tag}] ${buf}`);
  });
  child.stderr?.on('data', (buf) => {
    process.stderr.write(`[${tag}] ${buf}`);
  });
  return child;
}

/**
 * @param {string[]} args
 * @param {string} [cwd]
 * @param {NodeJS.ProcessEnv} [extraEnv]
 */
function runSync(args, cwd = ROOT, extraEnv = {}) {
  return new Promise((resolvePromise, reject) => {
    const child = spawn('pnpm', args, {
      cwd,
      env: { ...process.env, ...extraEnv },
      stdio: 'inherit',
    });
    child.on('exit', (code) => {
      if (code === 0) resolvePromise(undefined);
      else reject(new Error(`pnpm ${args.join(' ')} exited ${code}`));
    });
  });
}

async function main() {
  console.log('e2e:local — building web + api…');
  // Root .env may set NODE_ENV=development; Next production build requires production.
  await runSync(['--filter', '@toonexpo/web', '--filter', '@toonexpo/api', 'build'], ROOT, {
    NODE_ENV: 'production',
  });

  const webPort = new URL(E2E_BASE_URL).port || '3010';
  const apiUrl = E2E_API_URL;

  console.log(`Starting API on ${apiUrl} (BOS_API_KEY inline)…`);
  spawnLogged(
    'node',
    ['dist/main.js'],
    {
      API_URL: apiUrl,
      APP_URL: E2E_BASE_URL,
      BOS_API_KEY: E2E_BOS_API_KEY,
      NODE_ENV: 'production',
    },
    resolve(ROOT, 'apps/api'),
  );

  console.log(`Starting web on ${E2E_BASE_URL}…`);
  spawnLogged(
    'pnpm',
    ['exec', 'next', 'start', '--port', webPort],
    {
      APP_URL: E2E_BASE_URL,
      AUTH_URL: E2E_BASE_URL,
      NODE_ENV: 'production',
      PORT: webPort,
    },
    resolve(ROOT, 'apps/web'),
  );

  try {
    console.log('Waiting for readiness…');
    await waitForReady(`${apiUrl}/health`, READY_TIMEOUT_MS, READY_POLL_MS);
    await waitForReady(E2E_BASE_URL, READY_TIMEOUT_MS, READY_POLL_MS, (res) => {
      return res.status === 307 || res.status === 308 || res.status === 200;
    });
    console.log('Servers ready — running suite…\n');

    await runSync(['e2e']);
  } finally {
    console.log('\nStopping servers…');
    killChildren();
    // Give processes a moment to exit.
    await new Promise((r) => setTimeout(r, 500));
  }
}

main().catch((err) => {
  console.error(err);
  killChildren();
  process.exit(1);
});
