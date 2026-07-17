/**
 * Convenience: build → start web:3010 + api:4010 → run smoke → kill servers.
 * Usage: pnpm e2e:local
 */
import { execFileSync, spawn } from 'node:child_process';
import { resolve } from 'node:path';

import {
  E2E_API_URL,
  E2E_BASE_URL,
  E2E_BOS_API_KEY,
  READY_POLL_MS,
  READY_TIMEOUT_MS,
  ROOT,
} from './config.mjs';

/** @type {import('node:child_process').ChildProcess[]} */
const children = [];
let shuttingDown = false;
/** @type {Error | null} */
let serverFailed = null;

const PORT_FREE_WAIT_MS = 500;
const PORT_FREE_ATTEMPTS = 10;

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
 * @param {number} port
 * @returns {number[]}
 */
function listenPids(port) {
  try {
    const out = execFileSync('lsof', ['-nP', `-iTCP:${port}`, '-sTCP:LISTEN', '-t'], {
      encoding: 'utf8',
    }).trim();
    if (!out) return [];
    return out
      .split('\n')
      .map((line) => Number(line.trim()))
      .filter((pid) => Number.isFinite(pid) && pid > 0);
  } catch {
    return [];
  }
}

/**
 * Free a TCP listen port so e2e does not silently attach to a leftover process
 * (e.g. API without BOS_API_KEY=e2e-test-key → exactly 2 BOS FAILs).
 * @param {number} port
 */
async function freeListenPort(port) {
  for (let attempt = 0; attempt < PORT_FREE_ATTEMPTS; attempt += 1) {
    const pids = listenPids(port);
    if (pids.length === 0) return;
    const signal = attempt < PORT_FREE_ATTEMPTS / 2 ? 'SIGTERM' : 'SIGKILL';
    console.log(`Freeing :${port} (pids ${pids.join(', ')}, ${signal})…`);
    for (const pid of pids) {
      try {
        process.kill(pid, signal);
      } catch {
        /* already gone */
      }
    }
    await new Promise((r) => setTimeout(r, PORT_FREE_WAIT_MS));
  }
  const leftover = listenPids(port);
  if (leftover.length > 0) {
    throw new Error(`Could not free port ${port}; still held by pids ${leftover.join(', ')}`);
  }
}

/**
 * Confirm the API we reached accepts the e2e BOS key (not a leftover process).
 * @param {string} apiUrl
 * @param {string} apiKey
 */
async function assertBosKeyAccepted(apiUrl, apiKey) {
  const res = await fetch(`${apiUrl}/integrations/bos/provisioning`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-bos-api-key': apiKey,
    },
    body: '{}',
  });
  if (res.status === 401 || res.status === 503) {
    const body = await res.text().catch(() => '');
    throw new Error(
      `API at ${apiUrl} rejected e2e BOS key (HTTP ${res.status}). ` +
        `Likely a leftover process on the port without BOS_API_KEY=${apiKey}. ` +
        `Body: ${body.slice(0, 300)}`,
    );
  }
}

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
  child.on('exit', (code, signal) => {
    if (!shuttingDown) {
      serverFailed = new Error(`${tag} exited early (code=${code}, signal=${signal})`);
    }
  });
  return child;
}

function throwIfServerFailed() {
  if (serverFailed) throw serverFailed;
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

/**
 * @param {string} url
 * @param {number} timeoutMs
 * @param {number} intervalMs
 * @param {(res: Response) => boolean | Promise<boolean>} [ok]
 */
async function waitForReadyOrFail(url, timeoutMs, intervalMs, ok) {
  const start = Date.now();
  let lastError = '';
  while (Date.now() - start < timeoutMs) {
    throwIfServerFailed();
    try {
      const res = await fetch(url, { redirect: 'manual' });
      if (await (ok ?? ((r) => r.ok))(res)) return;
      lastError = `status ${res.status}`;
    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err);
    }
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  throw new Error(`Timed out waiting for ${url} (${lastError})`);
}

async function main() {
  const webPort = Number(new URL(E2E_BASE_URL).port || '3010');
  const apiPort = Number(new URL(E2E_API_URL).port || '4010');
  const apiUrl = E2E_API_URL;

  console.log(`e2e:local — freeing :${apiPort} and :${webPort}…`);
  await freeListenPort(apiPort);
  await freeListenPort(webPort);

  console.log('e2e:local — prisma generate + building web + api…');
  await runSync(['db:generate']);
  // Root .env may set NODE_ENV=development; Next production build requires production.
  await runSync(['--filter', '@toonexpo/web', '--filter', '@toonexpo/api', 'build'], ROOT, {
    NODE_ENV: 'production',
  });

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
    ['exec', 'next', 'start', '--port', String(webPort)],
    {
      APP_URL: E2E_BASE_URL,
      NEXT_PUBLIC_API_URL: apiUrl,
      NODE_ENV: 'production',
      PORT: String(webPort),
    },
    resolve(ROOT, 'apps/web'),
  );

  try {
    console.log('Waiting for readiness…');
    await waitForReadyOrFail(`${apiUrl}/health`, READY_TIMEOUT_MS, READY_POLL_MS);
    await waitForReadyOrFail(E2E_BASE_URL, READY_TIMEOUT_MS, READY_POLL_MS, (res) => {
      return res.status === 307 || res.status === 308 || res.status === 200;
    });
    throwIfServerFailed();
    await assertBosKeyAccepted(apiUrl, E2E_BOS_API_KEY);
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
