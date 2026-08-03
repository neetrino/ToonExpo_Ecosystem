import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

import { PrismaClient } from './generated/prisma/client.js';

export { Prisma, PrismaClient } from './generated/prisma/client.js';
export * from './generated/prisma/enums.js';
export {
  QR_TOKEN_BYTES,
  createQrToken,
  decryptQrToken,
  encryptQrToken,
  hashQrToken,
} from './qr-token.js';

/** Approved starting points — tune after load test (see docs/SETTINGS.md). */
export const DEFAULT_DB_POOL_MAX = 8;
export const DEFAULT_DB_POOL_CONNECTION_TIMEOUT_MS = 5_000;
export const DEFAULT_DB_STATEMENT_TIMEOUT_MS = 10_000;
/**
 * Close idle pool clients so Neon scale-to-zero does not leave dead sockets.
 * Keep below typical Neon auto-suspend (~5 min).
 */
export const DEFAULT_DB_POOL_IDLE_TIMEOUT_MS = 30_000;
/**
 * Typical Neon compute auto-suspend after no queries (scale-to-zero).
 * Used by the API for local idle console notices — not a keepalive.
 */
export const DEFAULT_NEON_AUTO_SUSPEND_MS = 5 * 60 * 1000;

/** pg v8 aliases these to verify-full; set explicitly to silence the SSL warning. */
const LEGACY_SSL_MODES = new Set(['prefer', 'require', 'verify-ca']);

/**
 * Maps legacy `sslmode` values to `verify-full` (current pg behavior) so
 * pg-connection-string / pg@9 do not warn. Leaves other modes unchanged.
 */
export const normalizePgConnectionString = (connectionString: string): string => {
  let url: URL;
  try {
    url = new URL(connectionString);
  } catch {
    return connectionString;
  }

  const sslmode = url.searchParams.get('sslmode');
  if (sslmode !== null && LEGACY_SSL_MODES.has(sslmode)) {
    url.searchParams.set('sslmode', 'verify-full');
  }

  return url.toString();
};

export type CreatePrismaClientOptions = {
  connectionString: string;
  /** Max connections per process (Cloud Run instance). Default 8. */
  poolMax?: number;
  /** Fail-fast wait for a free pool slot, ms. Default 5000. */
  poolConnectionTimeoutMs?: number;
  /**
   * Drop idle clients from the pool after this many ms. Default 30000.
   */
  poolIdleTimeoutMs?: number;
  /**
   * Postgres statement_timeout applied on each new connection, ms.
   * Default 10000. Set via `SET` after connect (Neon pooled URLs reject
   * statement_timeout as a libpq startup `options` parameter).
   */
  statementTimeoutMs?: number;
  /** Fires when the pool checks out a client (real query activity). */
  onQueryActivity?: () => void;
};

/** `onConnect` shipped in pg 8.20; @types/pg may lag behind. */
type PoolConfigWithOnConnect = pg.PoolConfig & {
  onConnect?: (client: pg.PoolClient) => void | Promise<void>;
};

/**
 * Creates a Prisma 7 client backed by the `pg` driver adapter.
 * Runtime usage is allowed only from `apps/api`.
 */
export const createPrismaClient = (options: CreatePrismaClientOptions): PrismaClient => {
  const poolMax = options.poolMax ?? DEFAULT_DB_POOL_MAX;
  const connectionTimeoutMillis =
    options.poolConnectionTimeoutMs ?? DEFAULT_DB_POOL_CONNECTION_TIMEOUT_MS;
  const idleTimeoutMillis = options.poolIdleTimeoutMs ?? DEFAULT_DB_POOL_IDLE_TIMEOUT_MS;
  const statementTimeoutMs = options.statementTimeoutMs ?? DEFAULT_DB_STATEMENT_TIMEOUT_MS;

  const poolConfig: PoolConfigWithOnConnect = {
    connectionString: normalizePgConnectionString(options.connectionString),
    max: poolMax,
    connectionTimeoutMillis,
    idleTimeoutMillis,
    allowExitOnIdle: true,
    // Awaited before the client is handed to callers (avoids pg@9 concurrent-query error).
    onConnect: async (client) => {
      await client.query(`SET statement_timeout TO ${Math.trunc(statementTimeoutMs)}`);
    },
  };

  const pool = new pg.Pool(poolConfig);

  if (options.onQueryActivity !== undefined) {
    pool.on('acquire', () => {
      options.onQueryActivity?.();
    });
  }

  // Idle Neon suspend / network drops emit here; without a listener the process can crash.
  pool.on('error', () => {
    // Intentionally empty: next checkout opens a fresh client.
  });

  const adapter = new PrismaPg(pool, { disposeExternalPool: true });

  return new PrismaClient({ adapter });
};
