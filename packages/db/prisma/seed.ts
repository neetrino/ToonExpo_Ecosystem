import { PrismaClient } from '@prisma/client';
import argon2 from 'argon2';

const prisma = new PrismaClient();

const HASH_OPTIONS = { type: argon2.argon2id } as const;

async function main(): Promise<void> {
  const email = process.env.SEED_ADMIN_EMAIL?.trim();
  const password = process.env.SEED_ADMIN_PASSWORD;

  if (!email || !password) {
    console.log('Skipping seed: SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD must be set.');
    return;
  }

  const existingAdmin = await prisma.user.findFirst({
    where: { role: 'BIGPROJECTS_ADMIN' },
  });

  if (existingAdmin) {
    console.log('Skipping seed: a BIGPROJECTS_ADMIN user already exists.');
    return;
  }

  const passwordHash = await argon2.hash(password, HASH_OPTIONS);

  await prisma.user.create({
    data: {
      email: email.toLowerCase(),
      name: 'Seed Admin',
      passwordHash,
      role: 'BIGPROJECTS_ADMIN',
    },
  });

  console.log(`Created seed BIGPROJECTS_ADMIN: ${email}`);
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
