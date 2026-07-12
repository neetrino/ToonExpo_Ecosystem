/** Seed credentials from env — never invent values. */

export type SeedCredentials = {
  email: string;
  password: string;
};

const DEMO_BUILDER_EMAIL = 'builder@demo.toonexpo.local';

function requiredPair(emailKey: string, passwordKey: string): SeedCredentials | null {
  const email = process.env[emailKey]?.trim();
  const password = process.env[passwordKey];
  if (!email || !password) {
    return null;
  }
  return { email, password };
}

export function getBuilderSeed(): SeedCredentials | null {
  const password = process.env.SEED_DEMO_BUILDER_PASSWORD;
  if (!password) {
    return null;
  }
  return { email: DEMO_BUILDER_EMAIL, password };
}

export function getAdminSeed(): SeedCredentials | null {
  return requiredPair('SEED_ADMIN_EMAIL', 'SEED_ADMIN_PASSWORD');
}

export function getEntranceSeed(): SeedCredentials | null {
  return requiredPair('SEED_ENTRANCE_EMAIL', 'SEED_ENTRANCE_PASSWORD');
}
