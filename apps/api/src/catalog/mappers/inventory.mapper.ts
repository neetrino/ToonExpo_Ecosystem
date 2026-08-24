import type { BuildingDetail, FloorDetail } from '@toonexpo/contracts';
import type { ApartmentSalesStatus, Prisma } from '@toonexpo/db';
import type { SupportedLocale } from '@toonexpo/shared';

import {
  resolveTranslatedName,
  TRANSLATION_ENTITY,
  TRANSLATION_FIELD,
  type TranslationRow,
} from '../utils/resolve-translation.js';
import {
  shouldRevealCatalogPrice,
  summarizeSalesStatuses,
  toMediaSummary,
} from './catalog.mapper.js';

type MapContext = {
  locale: SupportedLocale;
  isAuthenticated: boolean;
  translations: TranslationRow[];
};

type MediaRow = Parameters<typeof toMediaSummary>[0];

const mapFloorApartment = (
  apartment: {
    id: string;
    slug: string;
    number: string;
    salesStatus: ApartmentSalesStatus;
    rooms: number | null;
    bedrooms: number | null;
    bathrooms: number | null;
    areaTotal: Prisma.Decimal | null;
    price: Prisma.Decimal | null;
    priceCurrency: string;
    priceVisibility: string;
    tinderMedia?: MediaRow;
  },
  isAuthenticated: boolean,
  priceOnRequestEnabled: boolean,
) => ({
  id: apartment.id,
  slug: apartment.slug,
  number: apartment.number,
  salesStatus: apartment.salesStatus,
  rooms: apartment.rooms,
  bedrooms: apartment.bedrooms,
  bathrooms: apartment.bathrooms,
  areaTotal: apartment.areaTotal?.toString() ?? null,
  price: shouldRevealCatalogPrice(apartment.priceVisibility, isAuthenticated, priceOnRequestEnabled)
    ? (apartment.price?.toString() ?? null)
    : null,
  priceCurrency: apartment.priceCurrency,
  priceVisibility:
    apartment.priceVisibility as FloorDetail['apartments'][number]['priceVisibility'],
  tinder: toMediaSummary(apartment.tinderMedia ?? null),
  priceOnRequest: priceOnRequestEnabled,
});

export const mapBuildingDetail = (
  building: {
    id: string;
    name: string;
    description: string | null;
    displayOrder: number;
    floorsCount: number | null;
    coverMedia: MediaRow;
    verified: boolean;
    priceOnRequestEnabled: boolean;
    project: { id: string; name: string; slug: string };
    apartments: Array<{ salesStatus: ApartmentSalesStatus }>;
    floors: Array<{
      id: string;
      number: number;
      name: string | null;
      displayLabel: string | null;
      displayOrder: number;
      apartments: Array<{
        id: string;
        number: string;
        salesStatus: ApartmentSalesStatus;
        rooms: number | null;
        bedrooms: number | null;
        bathrooms: number | null;
        areaTotal: Prisma.Decimal | null;
        price: Prisma.Decimal | null;
        priceCurrency: string;
        priceVisibility: string;
      }>;
    }>;
  },
  ctx: MapContext,
): BuildingDetail => {
  const projectName = resolveTranslatedName(
    ctx.translations,
    TRANSLATION_ENTITY.project,
    building.project.id,
    TRANSLATION_FIELD.name,
    ctx.locale,
    building.project.name,
  );

  return {
    id: building.id,
    name: building.name,
    description: building.description,
    displayOrder: building.displayOrder,
    floorsCount: building.floorsCount,
    cover: toMediaSummary(building.coverMedia),
    verified: building.verified,
    availability: summarizeSalesStatuses(
      building.apartments.map((apartment) => apartment.salesStatus),
    ),
    priceOnRequestEnabled: building.priceOnRequestEnabled,
    floors: building.floors.map((floor) => ({
      id: floor.id,
      number: floor.number,
      name: floor.name,
      displayLabel: floor.displayLabel,
      displayOrder: floor.displayOrder,
      availability: summarizeSalesStatuses(
        floor.apartments.map((apartment) => apartment.salesStatus),
      ),
      apartments: floor.apartments.map((apartment) =>
        mapFloorApartment(apartment, ctx.isAuthenticated, building.priceOnRequestEnabled),
      ),
    })),
    project: {
      id: building.project.id,
      name: projectName,
      slug: building.project.slug,
    },
  };
};

export const mapFloorDetail = (
  floor: {
    id: string;
    number: number;
    name: string | null;
    displayLabel: string | null;
    displayOrder: number;
    floorplanMedia: MediaRow;
    building: { id: string; name: string; priceOnRequestEnabled: boolean };
    project: { id: string; name: string; slug: string };
    apartments: Array<{
      id: string;
      number: string;
      salesStatus: ApartmentSalesStatus;
      rooms: number | null;
      bedrooms: number | null;
      bathrooms: number | null;
      areaTotal: Prisma.Decimal | null;
      price: Prisma.Decimal | null;
      priceCurrency: string;
      priceVisibility: string;
    }>;
  },
  ctx: MapContext,
): FloorDetail => {
  const projectName = resolveTranslatedName(
    ctx.translations,
    TRANSLATION_ENTITY.project,
    floor.project.id,
    TRANSLATION_FIELD.name,
    ctx.locale,
    floor.project.name,
  );

  return {
    id: floor.id,
    number: floor.number,
    name: floor.name,
    displayLabel: floor.displayLabel,
    displayOrder: floor.displayOrder,
    floorplan: toMediaSummary(floor.floorplanMedia),
    availability: summarizeSalesStatuses(
      floor.apartments.map((apartment) => apartment.salesStatus),
    ),
    apartments: floor.apartments.map((apartment) =>
      mapFloorApartment(apartment, ctx.isAuthenticated, floor.building.priceOnRequestEnabled),
    ),
    project: {
      id: floor.project.id,
      name: projectName,
      slug: floor.project.slug,
    },
    building: {
      id: floor.building.id,
      name: floor.building.name,
    },
  };
};
