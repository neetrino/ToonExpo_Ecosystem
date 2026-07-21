import {
  CompanySource,
  CompanyStatus,
  CompanyType,
  CrmStatusSource,
  MediaAssetType,
  PublicationStatus,
  type PrismaClient,
} from '../src/index.js';
import {
  buildApartments,
  DEFAULT_PRICE_CURRENCY,
  DEMO_APARTMENT_PLAN_URL,
  DEMO_BUILDING_COVER_A,
  DEMO_BUILDING_COVER_B,
  DEMO_FLOOR_PLAN_URL,
  DEMO_ORPHAN_BUILDER_LOGO,
  demoCoverUrl,
  demoLogoUrl,
  SEED_BUILDERS,
  SEED_DRAFT_PROJECT_ID,
  SEED_ID_PREFIX,
  SEED_PROJECTS,
} from './seed-data.js';
import { buildSeedTranslations, type SeedTranslation } from './seed-translations.js';

const upsertBuilderLogo = async (
  prisma: PrismaClient,
  builder: (typeof SEED_BUILDERS)[number],
): Promise<void> => {
  await prisma.mediaAsset.upsert({
    where: { id: builder.logoId },
    create: {
      id: builder.logoId,
      ownerCompanyId: null,
      type: MediaAssetType.image,
      fileUrl: demoLogoUrl(builder.id, builder.name),
      title: `${builder.name} logo`,
      altText: builder.name,
    },
    update: {
      type: MediaAssetType.image,
      fileUrl: demoLogoUrl(builder.id, builder.name),
      title: `${builder.name} logo`,
      altText: builder.name,
    },
  });
};

export const upsertSeedBuilders = async (prisma: PrismaClient): Promise<void> => {
  for (const builder of SEED_BUILDERS) {
    await upsertBuilderLogo(prisma, builder);
    await prisma.company.upsert({
      where: { id: builder.id },
      create: {
        id: builder.id,
        name: builder.name,
        description: `${builder.name} — residential developer in Yerevan.`,
        type: CompanyType.builder,
        status: CompanyStatus.active,
        source: CompanySource.admin,
        logoMediaId: builder.logoId,
      },
      update: {
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

  await ensureOrphanBuilderDemoLogos(prisma);
};

/**
 * Assigns a demo logo to active builders that still have no logoMediaId.
 */
const ensureOrphanBuilderDemoLogos = async (prisma: PrismaClient): Promise<void> => {
  const orphans = await prisma.company.findMany({
    where: {
      type: CompanyType.builder,
      status: CompanyStatus.active,
      logoMediaId: null,
    },
    select: { id: true, name: true },
  });

  for (const orphan of orphans) {
    const logoId = `${SEED_ID_PREFIX}media_logo_orphan_${orphan.id}`;
    await prisma.mediaAsset.upsert({
      where: { id: logoId },
      create: {
        id: logoId,
        ownerCompanyId: orphan.id,
        type: MediaAssetType.image,
        fileUrl: DEMO_ORPHAN_BUILDER_LOGO,
        title: `${orphan.name} logo`,
        altText: orphan.name,
      },
      update: {
        ownerCompanyId: orphan.id,
        type: MediaAssetType.image,
        fileUrl: DEMO_ORPHAN_BUILDER_LOGO,
        title: `${orphan.name} logo`,
        altText: orphan.name,
      },
    });
    await prisma.company.update({
      where: { id: orphan.id },
      data: { logoMediaId: logoId },
    });
  }
};

const upsertSeedBuildings = async (
  prisma: PrismaClient,
  project: (typeof SEED_PROJECTS)[number],
): Promise<number> => {
  let apartmentCount = 0;

  for (const [buildingIndex, building] of project.buildings.entries()) {
    const buildingCoverId = `${SEED_ID_PREFIX}media_building_cover_${building.id}`;
    const buildingCoverUrl =
      buildingIndex % 2 === 0 ? DEMO_BUILDING_COVER_A : DEMO_BUILDING_COVER_B;

    await prisma.mediaAsset.upsert({
      where: { id: buildingCoverId },
      create: {
        id: buildingCoverId,
        ownerCompanyId: project.builderId,
        type: MediaAssetType.image,
        fileUrl: buildingCoverUrl,
        title: `${building.name} cover`,
        altText: building.name,
        relatedEntityType: 'building',
        relatedEntityId: building.id,
      },
      update: {
        fileUrl: buildingCoverUrl,
        title: `${building.name} cover`,
        altText: building.name,
      },
    });

    await prisma.building.upsert({
      where: { id: building.id },
      create: {
        id: building.id,
        projectId: project.id,
        name: building.name,
        publicationStatus: PublicationStatus.published,
        displayOrder: buildingIndex,
        floorsCount: building.floors.length,
        coverMediaId: buildingCoverId,
      },
      update: {
        projectId: project.id,
        name: building.name,
        publicationStatus: PublicationStatus.published,
        displayOrder: buildingIndex,
        floorsCount: building.floors.length,
        coverMediaId: buildingCoverId,
      },
    });

    for (const [floorIndex, floorNumber] of building.floors.entries()) {
      const floorId = `${SEED_ID_PREFIX}floor_${building.id}_n${floorNumber}`;
      const floorPlanId = `${SEED_ID_PREFIX}media_floorplan_${building.id}_n${floorNumber}`;
      await prisma.mediaAsset.upsert({
        where: { id: floorPlanId },
        create: {
          id: floorPlanId,
          ownerCompanyId: project.builderId,
          type: MediaAssetType.image,
          fileUrl: DEMO_FLOOR_PLAN_URL,
          title: `${building.name} floor ${floorNumber} plan`,
          altText: `Floor ${floorNumber} plan`,
          relatedEntityType: 'floor',
          relatedEntityId: floorId,
        },
        update: {
          fileUrl: DEMO_FLOOR_PLAN_URL,
          title: `${building.name} floor ${floorNumber} plan`,
          altText: `Floor ${floorNumber} plan`,
        },
      });

      await prisma.floor.upsert({
        where: { id: floorId },
        create: {
          id: floorId,
          buildingId: building.id,
          number: floorNumber,
          publicationStatus: PublicationStatus.published,
          displayLabel: `Floor ${floorNumber}`,
          displayOrder: floorIndex,
          floorplanMediaId: floorPlanId,
        },
        update: {
          buildingId: building.id,
          number: floorNumber,
          publicationStatus: PublicationStatus.published,
          displayLabel: `Floor ${floorNumber}`,
          displayOrder: floorIndex,
          floorplanMediaId: floorPlanId,
        },
      });

      const apartments = buildApartments(
        project.slug,
        building.name.replace(/\s+/g, '_').toLowerCase(),
        floorNumber,
        building.aptsPerFloor,
        building.basePrice,
      );

      for (const apartment of apartments) {
        await prisma.mediaAsset.upsert({
          where: { id: apartment.planMediaId },
          create: {
            id: apartment.planMediaId,
            ownerCompanyId: project.builderId,
            type: MediaAssetType.image,
            fileUrl: DEMO_APARTMENT_PLAN_URL,
            title: `Apartment ${apartment.number} plan`,
            altText: `Unit ${apartment.number} plan`,
            relatedEntityType: 'apartment',
            relatedEntityId: apartment.id,
          },
          update: {
            fileUrl: DEMO_APARTMENT_PLAN_URL,
            title: `Apartment ${apartment.number} plan`,
            altText: `Unit ${apartment.number} plan`,
          },
        });

        await prisma.apartment.upsert({
          where: { id: apartment.id },
          create: {
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
            planMediaId: apartment.planMediaId,
            crmStatusSource: CrmStatusSource.manual,
            lastStatusChangedAt: new Date(),
          },
          update: {
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
            planMediaId: apartment.planMediaId,
            crmStatusSource: CrmStatusSource.manual,
          },
        });
        apartmentCount += 1;
      }
    }
  }

  return apartmentCount;
};

export const upsertSeedProjects = async (prisma: PrismaClient): Promise<number> => {
  let apartmentCount = 0;

  for (const project of SEED_PROJECTS) {
    await prisma.mediaAsset.upsert({
      where: { id: project.coverId },
      create: {
        id: project.coverId,
        ownerCompanyId: project.builderId,
        type: MediaAssetType.image,
        fileUrl: demoCoverUrl(project.id, project.name),
        title: `${project.name} cover`,
        altText: project.name,
        relatedEntityType: 'project',
        relatedEntityId: project.id,
      },
      update: {
        ownerCompanyId: project.builderId,
        type: MediaAssetType.image,
        fileUrl: demoCoverUrl(project.id, project.name),
        title: `${project.name} cover`,
        altText: project.name,
        relatedEntityType: 'project',
        relatedEntityId: project.id,
      },
    });

    await prisma.project.upsert({
      where: { id: project.id },
      create: {
        id: project.id,
        builderCompanyId: project.builderId,
        name: project.name,
        slug: project.slug,
        publicationStatus: PublicationStatus.published,
        shortDescription: `${project.name} in Yerevan`,
        fullDescription: `${project.name} is a residential development in ${project.district}, Yerevan.`,
        locationText: `${project.district}, Yerevan`,
        address: project.address,
        city: 'Yerevan',
        district: project.district,
        coverMediaId: project.coverId,
        projectType: 'residential',
        constructionStatus: 'under_construction',
        amenities: ['parking', 'playground', 'concierge'],
      },
      update: {
        builderCompanyId: project.builderId,
        name: project.name,
        slug: project.slug,
        publicationStatus: PublicationStatus.published,
        shortDescription: `${project.name} in Yerevan`,
        fullDescription: `${project.name} is a residential development in ${project.district}, Yerevan.`,
        locationText: `${project.district}, Yerevan`,
        address: project.address,
        city: 'Yerevan',
        district: project.district,
        coverMediaId: project.coverId,
        projectType: 'residential',
        constructionStatus: 'under_construction',
        amenities: ['parking', 'playground', 'concierge'],
      },
    });

    apartmentCount += await upsertSeedBuildings(prisma, project);
  }

  await prisma.project.upsert({
    where: { id: SEED_DRAFT_PROJECT_ID },
    create: {
      id: SEED_DRAFT_PROJECT_ID,
      builderCompanyId: SEED_BUILDERS[2]!.id,
      name: 'Hidden Draft Project',
      slug: 'hidden-draft-project',
      publicationStatus: PublicationStatus.draft,
      city: 'Yerevan',
      shortDescription: 'Should not appear in public API',
    },
    update: {
      builderCompanyId: SEED_BUILDERS[2]!.id,
      name: 'Hidden Draft Project',
      slug: 'hidden-draft-project',
      publicationStatus: PublicationStatus.draft,
      city: 'Yerevan',
      shortDescription: 'Should not appear in public API',
    },
  });

  return apartmentCount;
};

export const upsertSeedTranslations = async (prisma: PrismaClient): Promise<SeedTranslation[]> => {
  const translations = buildSeedTranslations();
  for (const row of translations) {
    await prisma.translation.upsert({
      where: { id: row.id },
      create: {
        id: row.id,
        entityType: row.entityType,
        entityId: row.entityId,
        fieldName: row.fieldName,
        locale: row.locale,
        value: row.value,
      },
      update: {
        entityType: row.entityType,
        entityId: row.entityId,
        fieldName: row.fieldName,
        locale: row.locale,
        value: row.value,
      },
    });
  }
  return translations;
};
