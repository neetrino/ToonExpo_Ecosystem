import { MediaAssetType, PublicationStatus, type PrismaClient } from '../src/index.js';
import { demoCoverUrl, resolveSeedProjectCoords, SEED_DRAFT_PROJECT_ID } from './seed-data.js';
import {
  buildCatalogDemoAmenities,
  CATALOG_DEMO_FULL_DESCRIPTION_HY,
  CATALOG_DEMO_NEARBY,
} from './seed-catalog-demo.js';
import { upsertSeedBuildings } from './seed-catalog-buildings.js';
import { ALL_SEED_BUILDERS, ALL_SEED_PROJECTS } from './seed-entities.js';

const SEED_BUILDERS = ALL_SEED_BUILDERS;
const SEED_PROJECTS = ALL_SEED_PROJECTS;

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

    const demoAmenities = buildCatalogDemoAmenities();
    const amenities = demoAmenities;
    const nearbyPlaces = CATALOG_DEMO_NEARBY;
    const fullDescription = project.fullDescription ?? CATALOG_DEMO_FULL_DESCRIPTION_HY;
    const constructionStatus = project.constructionStatus ?? 'design_phase';
    const completionDate =
      project.completionDate !== undefined
        ? new Date(project.completionDate)
        : new Date('2027-12-01');
    const coords = resolveSeedProjectCoords(project);

    await prisma.project.upsert({
      where: { id: project.id },
      create: {
        id: project.id,
        builderCompanyId: project.builderId,
        name: project.name,
        slug: project.slug,
        publicationStatus: PublicationStatus.published,
        shortDescription: project.shortDescription ?? `${project.name} in Yerevan`,
        fullDescription,
        locationText: project.locationText ?? `${project.district}, Yerevan`,
        address: project.address,
        city: project.city ?? 'Yerevan',
        district: project.district,
        latitude: coords.latitude,
        longitude: coords.longitude,
        coverMediaId: project.coverId,
        projectType: project.projectType ?? 'residential',
        constructionStatus,
        completionDate,
        amenities,
        nearbyPlaces,
      },
      update: {
        builderCompanyId: project.builderId,
        name: project.name,
        slug: project.slug,
        publicationStatus: PublicationStatus.published,
        shortDescription: project.shortDescription ?? `${project.name} in Yerevan`,
        fullDescription,
        locationText: project.locationText ?? `${project.district}, Yerevan`,
        address: project.address,
        city: project.city ?? 'Yerevan',
        district: project.district,
        latitude: coords.latitude,
        longitude: coords.longitude,
        coverMediaId: project.coverId,
        projectType: project.projectType ?? 'residential',
        constructionStatus,
        completionDate,
        amenities,
        nearbyPlaces,
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
