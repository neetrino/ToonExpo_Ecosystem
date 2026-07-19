/**
 * Dev-only cleanup: removes runtime rows that reference seed catalog entities.
 * Non-seed user data (other companies, buyers, events) is never touched.
 */
import type { PrismaClient } from "../src/index.js";
import {
  SEED_BUILDERS,
  SEED_DRAFT_PROJECT_ID,
  SEED_ID_PREFIX,
  SEED_PROJECTS,
} from "./seed-data.js";

const SEED_COMPANY_IDS = SEED_BUILDERS.map((builder) => builder.id);

const SEED_PROJECT_IDS = [
  ...SEED_PROJECTS.map((project) => project.id),
  SEED_DRAFT_PROJECT_ID,
];

const logRuntimeCleanup = (label: string, count: number): void => {
  if (count > 0) {
    console.info(
      `[seed] Dev cleanup: removed ${count} runtime ${label} referencing seed entities`,
    );
  }
};

const seedEntityFilter = {
  companyIds: SEED_COMPANY_IDS,
  projectIds: SEED_PROJECT_IDS,
  apartmentIdPrefix: SEED_ID_PREFIX,
};

/**
 * Deletes dev smoke-test rows that reference seed companies/projects/apartments.
 * Required before catalog delete/recreate; optional hygiene when upserting seed rows.
 */
export const clearSeedRuntimeDependents = async (
  prisma: PrismaClient,
): Promise<void> => {
  const { companyIds, projectIds } = seedEntityFilter;

  const seedDeals = await prisma.crmDeal.findMany({
    where: {
      OR: [{ companyId: { in: companyIds } }, { projectId: { in: projectIds } }],
    },
    select: { id: true },
  });
  const seedDealIds = seedDeals.map((deal) => deal.id);

  if (seedDealIds.length > 0) {
    const apartmentLinks = await prisma.crmDealApartmentLink.deleteMany({
      where: {
        OR: [
          { crmDealId: { in: seedDealIds } },
          { apartmentId: { startsWith: SEED_ID_PREFIX } },
        ],
      },
    });
    logRuntimeCleanup("CRM apartment links", apartmentLinks.count);

    await prisma.request.updateMany({
      where: { crmDealId: { in: seedDealIds } },
      data: { crmDealId: null },
    });

    await prisma.crmDeal.updateMany({
      where: { id: { in: seedDealIds } },
      data: { primaryRequestId: null },
    });

    const deals = await prisma.crmDeal.deleteMany({
      where: { id: { in: seedDealIds } },
    });
    logRuntimeCleanup("CRM deals", deals.count);
  }

  const requests = await prisma.request.deleteMany({
    where: {
      OR: [
        { builderCompanyId: { in: companyIds } },
        { projectId: { in: projectIds } },
        { apartmentId: { startsWith: SEED_ID_PREFIX } },
      ],
    },
  });
  logRuntimeCleanup("requests", requests.count);

  const readiness = await prisma.readinessAssessment.deleteMany({
    where: {
      OR: [
        { builderCompanyId: { in: companyIds } },
        { projectId: { in: projectIds } },
      ],
    },
  });
  logRuntimeCleanup("readiness assessments", readiness.count);

  const visualMaps = await prisma.visualMapCanvas.deleteMany({
    where: {
      OR: [
        { ownerCompanyId: { in: companyIds } },
        { projectId: { in: projectIds } },
      ],
    },
  });
  logRuntimeCleanup("visual map canvases", visualMaps.count);

  const boothAssignments = await prisma.boothAssignment.deleteMany({
    where: {
      OR: [
        { companyId: { in: companyIds } },
        { projectId: { in: projectIds } },
      ],
    },
  });
  logRuntimeCleanup("booth assignments", boothAssignments.count);

  const analytics = await prisma.analyticsEvent.deleteMany({
    where: {
      OR: [
        { companyId: { in: companyIds } },
        { projectId: { in: projectIds } },
        { apartmentId: { startsWith: SEED_ID_PREFIX } },
      ],
    },
  });
  logRuntimeCleanup("analytics events", analytics.count);
};
