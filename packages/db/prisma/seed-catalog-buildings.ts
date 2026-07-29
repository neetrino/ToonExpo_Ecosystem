import {
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
  SEED_ID_PREFIX,
  toSeedMediaUrl,
} from './seed-data.js';
import { ALL_SEED_PROJECTS } from './seed-entities.js';

const SEED_PROJECTS = ALL_SEED_PROJECTS;

export const upsertSeedBuildings = async (
  prisma: PrismaClient,
  project: (typeof SEED_PROJECTS)[number],
): Promise<number> => {
  let apartmentCount = 0;

  for (const [buildingIndex, building] of project.buildings.entries()) {
    const buildingCoverId = `${SEED_ID_PREFIX}media_building_cover_${building.id}`;
    const buildingCoverUrl = toSeedMediaUrl(
      buildingIndex % 2 === 0 ? DEMO_BUILDING_COVER_A : DEMO_BUILDING_COVER_B,
    );

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
          fileUrl: toSeedMediaUrl(DEMO_FLOOR_PLAN_URL),
          title: `${building.name} floor ${floorNumber} plan`,
          altText: `Floor ${floorNumber} plan`,
          relatedEntityType: 'floor',
          relatedEntityId: floorId,
        },
        update: {
          fileUrl: toSeedMediaUrl(DEMO_FLOOR_PLAN_URL),
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
        project.apartmentDefaults,
      );

      for (const apartment of apartments) {
        await prisma.mediaAsset.upsert({
          where: { id: apartment.planMediaId },
          create: {
            id: apartment.planMediaId,
            ownerCompanyId: project.builderId,
            type: MediaAssetType.image,
            fileUrl: toSeedMediaUrl(DEMO_APARTMENT_PLAN_URL),
            title: `Apartment ${apartment.number} plan`,
            altText: `Unit ${apartment.number} plan`,
            relatedEntityType: 'apartment',
            relatedEntityId: apartment.id,
          },
          update: {
            fileUrl: toSeedMediaUrl(DEMO_APARTMENT_PLAN_URL),
            title: `Apartment ${apartment.number} plan`,
            altText: `Unit ${apartment.number} plan`,
          },
        });

        const features = project.apartmentDefaults
          ? {
              ...(project.apartmentDefaults.ceilingHeightM !== undefined
                ? { ceilingHeightM: project.apartmentDefaults.ceilingHeightM }
                : {}),
              ...(project.apartmentDefaults.finishingStatus !== undefined
                ? { finishingStatus: project.apartmentDefaults.finishingStatus }
                : {}),
              ...(project.apartmentDefaults.handoverDescription !== undefined
                ? { handoverDescription: project.apartmentDefaults.handoverDescription }
                : {}),
            }
          : undefined;

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
            ...(features !== undefined && Object.keys(features).length > 0 ? { features } : {}),
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
            ...(features !== undefined && Object.keys(features).length > 0 ? { features } : {}),
            crmStatusSource: CrmStatusSource.manual,
          },
        });
        apartmentCount += 1;
      }
    }
  }

  return apartmentCount;
};
