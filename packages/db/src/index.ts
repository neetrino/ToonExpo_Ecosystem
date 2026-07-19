import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

import { PrismaClient } from "./generated/prisma/client.js";

export { Prisma, PrismaClient } from "./generated/prisma/client.js";
export * from "./generated/prisma/enums.js";
export {
  QR_TOKEN_BYTES,
  createQrToken,
  decryptQrToken,
  encryptQrToken,
  hashQrToken,
} from "./qr-token.js";

/** Approved starting points — tune after load test (see docs/SETTINGS.md). */
export const DEFAULT_DB_POOL_MAX = 8;
export const DEFAULT_DB_POOL_CONNECTION_TIMEOUT_MS = 5_000;
export const DEFAULT_DB_STATEMENT_TIMEOUT_MS = 10_000;

export type CreatePrismaClientOptions = {
  connectionString: string;
  /** Max connections per process (Cloud Run instance). Default 8. */
  poolMax?: number;
  /** Fail-fast wait for a free pool slot, ms. Default 5000. */
  poolConnectionTimeoutMs?: number;
  /**
   * Postgres statement_timeout applied on each new connection, ms.
   * Default 10000. Set via `SET` after connect (Neon pooled URLs reject
   * statement_timeout as a libpq startup `options` parameter).
   */
  statementTimeoutMs?: number;
};

/**
 * Creates a Prisma 7 client backed by the `pg` driver adapter.
 * Runtime usage is allowed only from `apps/api`.
 */
export const createPrismaClient = (
  options: CreatePrismaClientOptions,
): PrismaClient => {
  const poolMax = options.poolMax ?? DEFAULT_DB_POOL_MAX;
  const connectionTimeoutMillis =
    options.poolConnectionTimeoutMs ?? DEFAULT_DB_POOL_CONNECTION_TIMEOUT_MS;
  const statementTimeoutMs =
    options.statementTimeoutMs ?? DEFAULT_DB_STATEMENT_TIMEOUT_MS;

  const pool = new pg.Pool({
    connectionString: options.connectionString,
    max: poolMax,
    connectionTimeoutMillis,
  });

  pool.on("connect", (client) => {
    // Integer-only; Neon pooler rejects statement_timeout in startup options.
    void client.query(`SET statement_timeout TO ${Math.trunc(statementTimeoutMs)}`);
  });

  const adapter = new PrismaPg(pool, { disposeExternalPool: true });

  return new PrismaClient({ adapter });
};
