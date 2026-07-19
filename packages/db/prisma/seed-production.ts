/**
 * Production-safe bootstrap: creates exactly one platform_admin when the DB is empty.
 * Refuses to run if users already exist or env/password guardrails fail.
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { config as loadEnv } from 'dotenv';
import * as argon2 from 'argon2';

import { AccountType, UserStatus, createPrismaClient } from '../src/index.js';

const packageRoot = path.dirname(fileURLToPath(import.meta.url));
const monorepoRoot = path.resolve(packageRoot, '../..', '..');

/** Minimum length for PROD_ADMIN_PASSWORD (stricter than buyer registration). */
export const PROD_ADMIN_PASSWORD_MIN_LENGTH = 12;

loadEnv({ path: path.join(monorepoRoot, '.env') });
loadEnv({ path: path.join(packageRoot, '../.env') });

const fail = (message: string): never => {
  console.error(`[seed-production] ${message}`);
  process.exit(1);
};

const resolveConnectionString = (): string => {
  const url = process.env['DIRECT_URL']?.trim() || process.env['DATABASE_URL']?.trim();
  if (!url) {
    fail('Set DATABASE_URL or DIRECT_URL before running db:seed:prod');
  }
  return url;
};

const readRequiredEnv = (key: 'PROD_ADMIN_EMAIL' | 'PROD_ADMIN_PASSWORD'): string => {
  const value = process.env[key]?.trim();
  if (!value) {
    fail(`Both PROD_ADMIN_EMAIL and PROD_ADMIN_PASSWORD must be set`);
  }
  return value;
};

const main = async (): Promise<void> => {
  const email = readRequiredEnv('PROD_ADMIN_EMAIL').toLowerCase();
  const password = readRequiredEnv('PROD_ADMIN_PASSWORD');

  if (password.length < PROD_ADMIN_PASSWORD_MIN_LENGTH) {
    fail(`PROD_ADMIN_PASSWORD must be at least ${PROD_ADMIN_PASSWORD_MIN_LENGTH} characters`);
  }

  const prisma = createPrismaClient({
    connectionString: resolveConnectionString(),
  });

  try {
    const existingUsers = await prisma.user.count();
    if (existingUsers > 0) {
      fail(
        `Refusing to seed: database already has ${existingUsers} user(s). Production seed runs only on an empty database.`,
      );
    }

    const passwordHash = await argon2.hash(password, { type: argon2.argon2id });

    await prisma.user.create({
      data: {
        name: 'Platform Admin',
        email,
        passwordHash,
        accountType: AccountType.platform_admin,
        status: UserStatus.active,
      },
    });

    console.info(
      `[seed-production] Created platform_admin for ${email}. Unset PROD_ADMIN_PASSWORD from your shell history when done.`,
    );
  } finally {
    await prisma.$disconnect();
  }
};

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
