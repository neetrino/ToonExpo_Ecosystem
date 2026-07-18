/**
 * Idempotent catalog seed for local/dev demos.
 * Removes previous seed rows (ids prefixed with `seed_`) then recreates them.
 */
import path from "node:path";
import { fileURLToPath } from "node:url";

import { config as loadEnv } from "dotenv";

import {
  CompanySource,
  CompanyStatus,
  CompanyType,
  createPrismaClient,
  CrmStatusSource,
  MediaAssetType,
  PublicationStatus,
} from "../src/index.js";
import {
  buildApartments,
  DEFAULT_PRICE_CURRENCY,
  imageUrl,
  SEED_BUILDERS,
  SEED_ID_PREFIX,
  SEED_PROJECTS,
} from "./seed-data.js";
import { buildSeedTranslations } from "./seed-translations.js";

const packageRoot = path.dirname(fileURLToPath(import.meta.url));
const monorepoRoot = path.resolve(packageRoot, "../..", "..");

loadEnv({ path: path.join(monorepoRoot, ".env") });
loadEnv({ path: path.join(packageRoot, "../.env") });

const resolveConnectionString = (): string => {
  const url = process.env["DIRECT_URL"]?.trim() || process.env["DATABASE_URL"]?.trim();
  if (!url) {
    throw new Error("Set DATABASE_URL or DIRECT_URL before running db:seed");
  }
  return url;
};

const clearSeedData = async (
  prisma: ReturnType<typeof createPrismaClient>,
): Promise<void> => {
  await prisma.translation.deleteMany({
    where: { id: { startsWith: SEED_ID_PREFIX } },
  });
  await prisma.apartmentStatusHistory.deleteMany({
    where: { apartmentId: { startsWith: SEED_ID_PREFIX } },
  });
  await prisma.apartment.deleteMany({
    where: { id: { startsWith: SEED_ID_PREFIX } },
  });
  await prisma.floor.deleteMany({
    where: { id: { startsWith: SEED_ID_PREFIX } },
  });
  await prisma.building.deleteMany({
    where: { id: { startsWith: SEED_ID_PREFIX } },
  });
  await prisma.project.deleteMany({
    where: { id: { startsWith: SEED_ID_PREFIX } },
  });
  await prisma.company.updateMany({
    where: { id: { startsWith: SEED_ID_PREFIX } },
    data: { logoMediaId: null },
  });
  await prisma.mediaAsset.deleteMany({
    where: { id: { startsWith: SEED_ID_PREFIX } },
  });
  await prisma.company.deleteMany({
    where: { id: { startsWith: SEED_ID_PREFIX } },
  });
};

const seedBuilders = async (
  prisma: ReturnType<typeof createPrismaClient>,
): Promise<void> => {
  for (const builder of SEED_BUILDERS) {
    await prisma.mediaAsset.create({
      data: {
        id: builder.logoId,
        ownerCompanyId: null,
        type: MediaAssetType.image,
        fileUrl: imageUrl(builder.name),
        title: `${builder.name} logo`,
        altText: builder.name,
      },
    });
    await prisma.company.create({
      data: {
        id: builder.id,
        name: builder.name,
        description: `${builder.name} — residential developer in Yerevan.`,
        type: CompanyType.builder,
        status: CompanyStatus.active,
        source: CompanySource.admin,
        logoMediaId: builder.logoId,
      },
    });
    await prisma.mediaAsset.update({
      where: { id: builder.logoId },
      data: { ownerCompanyId: builder.id },
    });
  }
};

const seedProjects = async (
  prisma: ReturnType<typeof createPrismaClient>,
): Promise<number> => {
  let apartmentCount = 0;

  for (const project of SEED_PROJECTS) {
    await prisma.mediaAsset.create({
      data: {
        id: project.coverId,
        ownerCompanyId: project.builderId,
        type: MediaAssetType.image,
        fileUrl: imageUrl(project.name),
        title: `${project.name} cover`,
        altText: project.name,
        relatedEntityType: "project",
        relatedEntityId: project.id,
      },
    });

    await prisma.project.create({
      data: {
        id: project.id,
        builderCompanyId: project.builderId,
        name: project.name,
        slug: project.slug,
        publicationStatus: PublicationStatus.published,
        shortDescription: `${project.name} in Yerevan`,
        fullDescription: `${project.name} is a residential development in ${project.district}, Yerevan.`,
        locationText: `${project.district}, Yerevan`,
        address: project.address,
        city: "Yerevan",
        district: project.district,
        coverMediaId: project.coverId,
        projectType: "residential",
        constructionStatus: "under_construction",
        amenities: ["parking", "playground", "concierge"],
      },
    });

    apartmentCount += await seedBuildings(prisma, project);
  }

  await prisma.project.create({
    data: {
      id: `${SEED_ID_PREFIX}project_draft_hidden`,
      builderCompanyId: SEED_BUILDERS[2]!.id,
      name: "Hidden Draft Project",
      slug: "hidden-draft-project",
      publicationStatus: PublicationStatus.draft,
      city: "Yerevan",
      shortDescription: "Should not appear in public API",
    },
  });

  return apartmentCount;
};

const seedBuildings = async (
  prisma: ReturnType<typeof createPrismaClient>,
  project: (typeof SEED_PROJECTS)[number],
): Promise<number> => {
  let apartmentCount = 0;

  for (const [buildingIndex, building] of project.buildings.entries()) {
    await prisma.building.create({
      data: {
        id: building.id,
        projectId: project.id,
        name: building.name,
        publicationStatus: PublicationStatus.published,
        displayOrder: buildingIndex,
        floorsCount: building.floors.length,
      },
    });

    for (const [floorIndex, floorNumber] of building.floors.entries()) {
      const floorId = `${SEED_ID_PREFIX}floor_${building.id}_n${floorNumber}`;
      await prisma.floor.create({
        data: {
          id: floorId,
          buildingId: building.id,
          number: floorNumber,
          publicationStatus: PublicationStatus.published,
          displayLabel: `Floor ${floorNumber}`,
          displayOrder: floorIndex,
        },
      });

      const apartments = buildApartments(
        project.slug,
        building.name.replace(/\s+/g, "_").toLowerCase(),
        floorNumber,
        building.aptsPerFloor,
        building.basePrice,
      );

      for (const apartment of apartments) {
        await prisma.apartment.create({
          data: {
            id: apartment.id,
            projectId: project.id,
            buildingId: building.id,
            floorId,
            number: apartment.number,
            salesStatus: apartment.salesStatus,
            publicationStatus: PublicationStatus.published,
            rooms: apartment.rooms,
            bedrooms: apartment.bedrooms,
            bathrooms: 1,
            areaTotal: apartment.areaTotal,
            areaLiving: apartment.areaTotal - 8,
            price: apartment.price,
            priceCurrency: DEFAULT_PRICE_CURRENCY,
            priceVisibility: apartment.priceVisibility,
            crmStatusSource: CrmStatusSource.manual,
            lastStatusChangedAt: new Date(),
          },
        });
        apartmentCount += 1;
      }
    }
  }

  return apartmentCount;
};

const main = async (): Promise<void> => {
  const prisma = createPrismaClient({
    connectionString: resolveConnectionString(),
  });

  try {
    await clearSeedData(prisma);
    await seedBuilders(prisma);
    const apartmentCount = await seedProjects(prisma);
    const translations = buildSeedTranslations();
    for (const row of translations) {
      await prisma.translation.create({
        data: {
          id: row.id,
          entityType: row.entityType,
          entityId: row.entityId,
          fieldName: row.fieldName,
          locale: row.locale,
          value: row.value,
        },
      });
    }
    console.info(
      `Seed complete: ${SEED_BUILDERS.length} builders, ${SEED_PROJECTS.length} published projects, ${apartmentCount} apartments, ${translations.length} translations`,
    );
  } finally {
    await prisma.$disconnect();
  }
};

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
