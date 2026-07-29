import {
  ApartmentSalesStatus,
  CompanySource,
  CompanyStatus,
  CompanyType,
  CrmStatusSource,
  PriceVisibility,
  PublicationStatus,
} from '@toonexpo/db';

import { PrismaService } from '../src/prisma/prisma.service.js';

export const CATALOG_FIXTURE_PREFIX = 'e2e_catalog_';

export type CatalogFixtureIds = {
  publishedProjectId: string;
  draftProjectId: string;
  publishedApartmentId: string;
  draftApartmentId: string;
  byRequestApartmentId: string;
  afterLoginApartmentId: string;
  builderId: string;
  catalogBuildingId: string;
  catalogFloorId: string;
};

export async function cleanupCatalogFixtures(prisma: PrismaService): Promise<void> {
  await prisma.db.translation.deleteMany({
    where: { id: { startsWith: CATALOG_FIXTURE_PREFIX } },
  });
  await prisma.db.apartment.deleteMany({
    where: { id: { startsWith: CATALOG_FIXTURE_PREFIX } },
  });
  await prisma.db.floor.deleteMany({
    where: { id: { startsWith: CATALOG_FIXTURE_PREFIX } },
  });
  await prisma.db.building.deleteMany({
    where: { id: { startsWith: CATALOG_FIXTURE_PREFIX } },
  });
  await prisma.db.project.deleteMany({
    where: { id: { startsWith: CATALOG_FIXTURE_PREFIX } },
  });
  await prisma.db.company.deleteMany({
    where: { id: { startsWith: CATALOG_FIXTURE_PREFIX } },
  });
}

export async function seedCatalogFixtures(prisma: PrismaService): Promise<CatalogFixtureIds> {
  await cleanupCatalogFixtures(prisma);

  const builderId = `${CATALOG_FIXTURE_PREFIX}builder`;
  const publishedProjectId = `${CATALOG_FIXTURE_PREFIX}project_published`;
  const draftProjectId = `${CATALOG_FIXTURE_PREFIX}project_draft`;
  const buildingId = `${CATALOG_FIXTURE_PREFIX}building`;
  const floorId = `${CATALOG_FIXTURE_PREFIX}floor`;
  const publishedApartmentId = `${CATALOG_FIXTURE_PREFIX}apartment_published`;
  const draftApartmentId = `${CATALOG_FIXTURE_PREFIX}apartment_draft`;
  const byRequestApartmentId = `${CATALOG_FIXTURE_PREFIX}apartment_by_request`;
  const afterLoginApartmentId = `${CATALOG_FIXTURE_PREFIX}apartment_after_login`;

  await prisma.db.company.create({
    data: {
      id: builderId,
      name: 'E2E Catalog Builder',
      description: 'E2E builder description',
      type: CompanyType.builder,
      status: CompanyStatus.active,
      source: CompanySource.admin,
    },
  });

  await prisma.db.project.create({
    data: {
      id: publishedProjectId,
      builderCompanyId: builderId,
      name: 'E2E Published Project',
      slug: `${CATALOG_FIXTURE_PREFIX}published`,
      publicationStatus: PublicationStatus.published,
      city: 'Yerevan',
      shortDescription: 'Short description in English',
    },
  });

  await prisma.db.translation.createMany({
    data: [
      {
        id: `${CATALOG_FIXTURE_PREFIX}tr_name_hy`,
        entityType: 'project',
        entityId: publishedProjectId,
        fieldName: 'name',
        locale: 'hy',
        value: 'E2E Հրապարակված նախագիծ',
      },
      {
        id: `${CATALOG_FIXTURE_PREFIX}tr_name_ru`,
        entityType: 'project',
        entityId: publishedProjectId,
        fieldName: 'name',
        locale: 'ru',
        value: 'E2E Опубликованный проект',
      },
      {
        id: `${CATALOG_FIXTURE_PREFIX}tr_name_en`,
        entityType: 'project',
        entityId: publishedProjectId,
        fieldName: 'name',
        locale: 'en',
        value: 'E2E Published Project',
      },
      {
        id: `${CATALOG_FIXTURE_PREFIX}tr_short_ru`,
        entityType: 'project',
        entityId: publishedProjectId,
        fieldName: 'shortDescription',
        locale: 'ru',
        value: 'Краткое описание на русском',
      },
      {
        id: `${CATALOG_FIXTURE_PREFIX}tr_short_hy`,
        entityType: 'project',
        entityId: publishedProjectId,
        fieldName: 'shortDescription',
        locale: 'hy',
        value: 'Կարճ նկարագրություն հայերեն',
      },
    ],
  });

  await prisma.db.project.create({
    data: {
      id: draftProjectId,
      builderCompanyId: builderId,
      name: 'E2E Draft Project',
      slug: `${CATALOG_FIXTURE_PREFIX}draft`,
      publicationStatus: PublicationStatus.draft,
      city: 'Yerevan',
    },
  });

  await prisma.db.building.create({
    data: {
      id: buildingId,
      projectId: publishedProjectId,
      name: 'E2E Building',
      publicationStatus: PublicationStatus.published,
    },
  });

  await prisma.db.floor.create({
    data: {
      id: floorId,
      buildingId,
      number: 1,
      publicationStatus: PublicationStatus.published,
      displayLabel: 'Floor 1',
    },
  });

  await prisma.db.apartment.create({
    data: {
      id: publishedApartmentId,
      projectId: publishedProjectId,
      buildingId,
      floorId,
      number: '101',
      salesStatus: ApartmentSalesStatus.available,
      publicationStatus: PublicationStatus.published,
      rooms: 2,
      price: 50_000_000,
      priceCurrency: 'AMD',
      priceVisibility: PriceVisibility.public,
      crmStatusSource: CrmStatusSource.manual,
    },
  });

  await prisma.db.apartment.create({
    data: {
      id: draftApartmentId,
      projectId: publishedProjectId,
      buildingId,
      floorId,
      number: '102',
      salesStatus: ApartmentSalesStatus.available,
      publicationStatus: PublicationStatus.draft,
      rooms: 3,
      price: 60_000_000,
      priceCurrency: 'AMD',
      priceVisibility: PriceVisibility.public,
      crmStatusSource: CrmStatusSource.manual,
    },
  });

  await prisma.db.apartment.create({
    data: {
      id: byRequestApartmentId,
      projectId: publishedProjectId,
      buildingId,
      floorId,
      number: '103',
      salesStatus: ApartmentSalesStatus.available,
      publicationStatus: PublicationStatus.published,
      rooms: 2,
      price: 65_000_000,
      priceCurrency: 'AMD',
      priceVisibility: PriceVisibility.by_request,
      crmStatusSource: CrmStatusSource.manual,
    },
  });

  await prisma.db.apartment.create({
    data: {
      id: afterLoginApartmentId,
      projectId: publishedProjectId,
      buildingId,
      floorId,
      number: '104',
      salesStatus: ApartmentSalesStatus.available,
      publicationStatus: PublicationStatus.published,
      rooms: 3,
      price: 70_000_000,
      priceCurrency: 'AMD',
      priceVisibility: PriceVisibility.visible_after_login,
      crmStatusSource: CrmStatusSource.manual,
    },
  });

  return {
    publishedProjectId,
    draftProjectId,
    publishedApartmentId,
    draftApartmentId,
    byRequestApartmentId,
    afterLoginApartmentId,
    builderId,
    catalogBuildingId: buildingId,
    catalogFloorId: floorId,
  };
}
