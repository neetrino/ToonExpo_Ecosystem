/**
 * Idempotent catalog seed for local/dev demos.
 * Upserts stable `seed_*` rows; clears only runtime dev data that references them.
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { config as loadEnv } from 'dotenv';
import * as argon2 from 'argon2';

import { createPrismaClient } from '../src/index.js';
import { seedAuthAccounts } from './seed-auth.js';
import { upsertSeedBuilders, upsertSeedProjects, upsertSeedTranslations } from './seed-catalog.js';
import { clearSeedRuntimeDependents } from './seed-cleanup.js';
import { SEED_BUILDERS, SEED_PROJECTS } from './seed-data.js';
import { upsertSeedMortgageOffer } from './seed-mortgage.js';

const packageRoot = path.dirname(fileURLToPath(import.meta.url));
const monorepoRoot = path.resolve(packageRoot, '../..', '..');

loadEnv({ path: path.join(monorepoRoot, '.env') });
loadEnv({ path: path.join(packageRoot, '../.env') });

const resolveConnectionString = (): string => {
  const url = process.env['DIRECT_URL']?.trim() || process.env['DATABASE_URL']?.trim();
  if (!url) {
    throw new Error('Set DATABASE_URL or DIRECT_URL before running db:seed');
  }
  return url;
};

const main = async (): Promise<void> => {
  const prisma = createPrismaClient({
    connectionString: resolveConnectionString(),
  });

  try {
    await clearSeedRuntimeDependents(prisma);
    await upsertSeedBuilders(prisma);
    const apartmentCount = await upsertSeedProjects(prisma);
    const translations = await upsertSeedTranslations(prisma);
    await seedAuthAccounts(prisma, (password) => argon2.hash(password, { type: argon2.argon2id }));
    await upsertSeedMortgageOffer(prisma);
    console.info(
      `Seed complete: ${SEED_BUILDERS.length} builders, ${SEED_PROJECTS.length} published projects, ${apartmentCount} apartments, ${translations.length} translations, auth accounts + mortgage offer ready`,
    );
  } finally {
    await prisma.$disconnect();
  }
};

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
