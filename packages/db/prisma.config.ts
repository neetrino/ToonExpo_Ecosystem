import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { config as loadEnv } from 'dotenv';
import { defineConfig } from 'prisma/config';

const packageRoot = path.dirname(fileURLToPath(import.meta.url));
const monorepoRoot = path.resolve(packageRoot, '../..');

loadEnv({ path: path.join(monorepoRoot, '.env') });
loadEnv({ path: path.join(packageRoot, '.env') });

/** Used by `prisma generate` / validate when no DB env is set (CI, fresh clones). */
const PRISMA_GENERATE_PLACEHOLDER_DATABASE_URL =
  'postgresql://placeholder:placeholder@localhost:5432/placeholder';

const resolveDatabaseUrl = (): string => {
  const directUrl = process.env['DIRECT_URL']?.trim();
  if (directUrl) {
    return directUrl;
  }

  const databaseUrl = process.env['DATABASE_URL']?.trim();
  if (databaseUrl) {
    return databaseUrl;
  }

  return PRISMA_GENERATE_PLACEHOLDER_DATABASE_URL;
};

/**
 * Prisma CLI config (migrations / generate / validate).
 * Prefer DIRECT_URL (owner, non-pooled) for migrations when set.
 */
export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: resolveDatabaseUrl(),
  },
});
