import { createRequire } from 'node:module';
import { resolve } from 'node:path';

import { DEMO_COMPANY_SLUG, ROOT, SUNRISE_SLUG } from './config.mjs';

const require = createRequire(resolve(ROOT, 'packages/db/package.json'));
const { PrismaClient } = require('@prisma/client');
const argon2 = require('argon2');

const HASH_OPTIONS = { type: argon2.argon2id };

/** @type {import('@prisma/client').PrismaClient | null} */
let client = null;

export function getPrisma() {
  if (!client) client = new PrismaClient();
  return client;
}

export async function disconnectPrisma() {
  if (client) {
    await client.$disconnect();
    client = null;
  }
}

/**
 * Create a BUYER (+ profile) the same way registration would — used because
 * Next.js server actions are not reliably invokable over plain HTTP without
 * build-specific Next-Action IDs.
 *
 * @param {{ email: string; name: string; phone: string; password: string }} input
 */
export async function seedBuyer(input) {
  const prisma = getPrisma();
  const passwordHash = await argon2.hash(input.password, HASH_OPTIONS);
  const user = await prisma.user.create({
    data: {
      email: input.email.toLowerCase(),
      name: input.name,
      phone: input.phone,
      passwordHash,
      role: 'BUYER',
      buyerProfile: { create: {} },
    },
  });
  return user;
}

/**
 * UI-less public request (server action is form-bound). Creates a NEW_REQUEST
 * deal linked to the buyer, mirroring submitPublicRequest shape.
 *
 * @param {{ buyerUserId: string; name: string; email: string; phone: string; message: string }} input
 */
export async function createPublicRequestDeal(input) {
  const prisma = getPrisma();
  const project = await prisma.project.findFirst({
    where: {
      slug: SUNRISE_SLUG,
      status: 'PUBLISHED',
      company: { slug: DEMO_COMPANY_SLUG },
    },
    select: { id: true, companyId: true, name: true },
  });
  if (!project) throw new Error('Sunrise published project not found — run db:seed');

  const now = new Date();
  const deal = await prisma.deal.create({
    data: {
      companyId: project.companyId,
      projectId: project.id,
      stage: 'NEW_REQUEST',
      source: 'PROJECT_PAGE',
      buyerUserId: input.buyerUserId,
      contactName: input.name,
      contactEmail: input.email.toLowerCase(),
      contactPhone: input.phone,
      title: `Request: ${project.name}`,
      message: input.message,
      lastActivityAt: now,
      activities: {
        create: {
          type: 'COMMENT',
          body: input.message,
          authorUserId: input.buyerUserId,
        },
      },
    },
  });
  return { deal, project };
}

/**
 * @param {string} projectSlug
 */
export async function countProjectViews(projectSlug) {
  const prisma = getPrisma();
  const project = await prisma.project.findFirst({
    where: { slug: projectSlug, company: { slug: DEMO_COMPANY_SLUG } },
    select: { id: true },
  });
  if (!project) throw new Error(`project ${projectSlug} not found`);
  const count = await prisma.analyticsEvent.count({
    where: { type: 'PROJECT_VIEW', projectId: project.id },
  });
  return { projectId: project.id, count };
}

/**
 * @param {string} email
 */
export async function countUsersByEmail(email) {
  const prisma = getPrisma();
  return prisma.user.count({ where: { email: email.toLowerCase() } });
}

/**
 * Delete throwaway rows created during a smoke run.
 * @param {{ runId: string; emails?: string[]; requestIds?: string[]; companyIds?: string[]; userIds?: string[]; dealIds?: string[] }} markers
 */
export async function cleanupE2eData(markers) {
  const prisma = getPrisma();
  const emails = (markers.emails ?? []).map((e) => e.toLowerCase());
  const requestIds = markers.requestIds ?? [];
  const companyIds = [...new Set(markers.companyIds ?? [])];
  const userIds = [...new Set(markers.userIds ?? [])];
  const dealIds = [...new Set(markers.dealIds ?? [])];

  if (dealIds.length > 0) {
    await prisma.deal.deleteMany({ where: { id: { in: dealIds } } });
  }

  if (requestIds.length > 0) {
    await prisma.integrationAuditLog.deleteMany({
      where: { OR: [{ requestId: { in: requestIds } }, { externalRef: { in: requestIds } }] },
    });
    await prisma.provisioningRequest.deleteMany({ where: { requestId: { in: requestIds } } });
  }

  const users = await prisma.user.findMany({
    where: {
      OR: [
        emails.length > 0 ? { email: { in: emails } } : undefined,
        userIds.length > 0 ? { id: { in: userIds } } : undefined,
        { email: { contains: `e2e-${markers.runId}` } },
      ].filter(Boolean),
    },
    select: { id: true },
  });
  const ids = users.map((u) => u.id);

  if (ids.length > 0) {
    await prisma.deal.deleteMany({
      where: {
        OR: [{ buyerUserId: { in: ids } }, { contactEmail: { contains: `e2e-${markers.runId}` } }],
      },
    });
    await prisma.user.deleteMany({ where: { id: { in: ids } } });
  }

  if (companyIds.length > 0) {
    await prisma.partner.deleteMany({ where: { companyId: { in: companyIds } } });
    await prisma.company.deleteMany({
      where: {
        id: { in: companyIds },
        slug: { contains: `e2e-${markers.runId}` },
      },
    });
  }

  // Catch BOS companies named with the run marker.
  await prisma.company.deleteMany({
    where: { name: { contains: `e2e-${markers.runId}` } },
  });
}

/**
 * Detect optional seed credentials in process.env (never invents values).
 */
export function detectSeedCredentials() {
  const builderPassword = process.env.SEED_DEMO_BUILDER_PASSWORD;
  const adminEmail = process.env.SEED_ADMIN_EMAIL?.trim();
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;
  return {
    builder: builderPassword
      ? { email: 'builder@demo.toonexpo.local', password: builderPassword }
      : null,
    admin: adminEmail && adminPassword ? { email: adminEmail, password: adminPassword } : null,
  };
}
