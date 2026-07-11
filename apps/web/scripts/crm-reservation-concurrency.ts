/**
 * Real-DB concurrency check: two deals racing updateDealStage → RESERVED.
 * Uses root .env DATABASE_URL; cleans up all temp rows in finally.
 *
 * Run from repo root (absolute --env-file avoids pnpm cwd ambiguity):
 *   pnpm --filter @toonexpo/db exec tsx --env-file="$PWD/.env" "$PWD/apps/web/scripts/crm-reservation-concurrency.ts"
 */
import { prisma } from '@toonexpo/db';

import { updateDealStage } from '../src/lib/crm/deal-stage-mutations';

const RUN_ID = `crm-race-${Date.now()}`;

type TempIds = {
  companyId?: string;
  projectId?: string;
  buildingId?: string;
  floorId?: string;
  apartmentId?: string;
  dealAId?: string;
  dealBId?: string;
};

async function seed(ids: TempIds): Promise<void> {
  const company = await prisma.company.create({
    data: {
      name: `Race Co ${RUN_ID}`,
      slug: RUN_ID,
    },
  });
  ids.companyId = company.id;

  const project = await prisma.project.create({
    data: {
      companyId: company.id,
      name: `Race Project ${RUN_ID}`,
      slug: RUN_ID,
    },
  });
  ids.projectId = project.id;

  const building = await prisma.building.create({
    data: { projectId: project.id, name: 'B1' },
  });
  ids.buildingId = building.id;

  const floor = await prisma.floor.create({
    data: { buildingId: building.id, name: 'F1', level: 1 },
  });
  ids.floorId = floor.id;

  const apartment = await prisma.apartment.create({
    data: {
      floorId: floor.id,
      code: 'A1',
      status: 'AVAILABLE',
    },
  });
  ids.apartmentId = apartment.id;

  const dealA = await prisma.deal.create({
    data: {
      companyId: company.id,
      stage: 'APARTMENT_SELECTED',
      source: 'MANUAL_BUILDER_ENTRY',
      contactName: 'Deal A',
      projectId: null,
    },
  });
  ids.dealAId = dealA.id;

  const dealB = await prisma.deal.create({
    data: {
      companyId: company.id,
      stage: 'APARTMENT_SELECTED',
      source: 'MANUAL_BUILDER_ENTRY',
      contactName: 'Deal B',
      projectId: null,
    },
  });
  ids.dealBId = dealB.id;

  await prisma.dealApartment.createMany({
    data: [
      { dealId: dealA.id, apartmentId: apartment.id },
      { dealId: dealB.id, apartmentId: apartment.id },
    ],
  });
}

async function cleanup(ids: TempIds): Promise<void> {
  if (ids.dealAId || ids.dealBId) {
    const dealIds = [ids.dealAId, ids.dealBId].filter((id): id is string => Boolean(id));
    await prisma.dealActivity.deleteMany({ where: { dealId: { in: dealIds } } });
    await prisma.dealApartment.deleteMany({ where: { dealId: { in: dealIds } } });
    await prisma.deal.deleteMany({ where: { id: { in: dealIds } } });
  }
  if (ids.apartmentId) {
    await prisma.apartment.deleteMany({ where: { id: ids.apartmentId } });
  }
  if (ids.floorId) {
    await prisma.floor.deleteMany({ where: { id: ids.floorId } });
  }
  if (ids.buildingId) {
    await prisma.building.deleteMany({ where: { id: ids.buildingId } });
  }
  if (ids.projectId) {
    await prisma.project.deleteMany({ where: { id: ids.projectId } });
  }
  if (ids.companyId) {
    await prisma.company.deleteMany({ where: { id: ids.companyId } });
  }
}

async function main(): Promise<void> {
  if (!process.env.DATABASE_URL) {
    console.error('[crm-race] DATABASE_URL is missing (pass --env-file to root .env)');
    process.exitCode = 1;
    return;
  }

  const ids: TempIds = {};
  console.log(`[crm-race] starting ${RUN_ID}`);

  try {
    await seed(ids);
    console.log('[crm-race] seeded company/project/apartment + two deals');

    const [resultA, resultB] = await Promise.all([
      updateDealStage(ids.companyId!, { dealId: ids.dealAId!, stage: 'RESERVED' }),
      updateDealStage(ids.companyId!, { dealId: ids.dealBId!, stage: 'RESERVED' }),
    ]);

    const successes = [resultA, resultB].filter((r) => r.ok);
    const conflicts = [resultA, resultB].filter(
      (r) => !r.ok && r.errorKey === 'reservationConflict',
    );

    const apartment = await prisma.apartment.findUniqueOrThrow({
      where: { id: ids.apartmentId! },
      select: { status: true },
    });

    const reservedDeals = await prisma.deal.count({
      where: {
        id: { in: [ids.dealAId!, ids.dealBId!] },
        stage: 'RESERVED',
      },
    });

    console.log('[crm-race] resultA', resultA);
    console.log('[crm-race] resultB', resultB);
    console.log('[crm-race] apartment.status', apartment.status);
    console.log('[crm-race] reservedDealCount', reservedDeals);
    console.log('[crm-race] successCount', successes.length);
    console.log('[crm-race] conflictCount', conflicts.length);

    const ok =
      successes.length === 1 &&
      conflicts.length === 1 &&
      apartment.status === 'RESERVED' &&
      reservedDeals === 1;

    if (!ok) {
      console.error(
        '[crm-race] FAIL: expected exactly one success, one conflict, apartment RESERVED once',
      );
      process.exitCode = 1;
      return;
    }

    console.log('[crm-race] PASS');
  } finally {
    await cleanup(ids);
    console.log('[crm-race] cleaned up temp rows');
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => {
  console.error('[crm-race] fatal', error);
  process.exitCode = 1;
});
