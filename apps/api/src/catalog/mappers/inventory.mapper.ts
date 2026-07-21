import type { BuildingDetail, FloorDetail } from '@toonexpo/contracts';
import type { ApartmentSalesStatus, Prisma } from '@toonexpo/db';
import type { SupportedLocale } from '@toonexpo/shared';

import {
  resolveTranslatedValue,
  TRANSLATION_ENTITY,
  TRANSLATION_FIELD,
  type TranslationRow,
} from '../utils/resolve-translation.js';
import { shouldRevealPrice, summarizeSalesStatuses, toMediaSummary } from './catalog.mapper.js';

type MapContext = {
  locale: SupportedLocale;
  isAuthenticated: boolean;
  translations: TranslationRow[];
};

type MediaRow = Parameters<typeof toMediaSummary>[0];

const mapFloorApartment = (
  apartment: {
    id: string;
    number: string;
    salesStatus: ApartmentSalesStatus;
    rooms: number | null;
    areaTotal: Prisma.Decimal | null;
    price: Prisma.Decimal | null;
    priceCurrency: string;
    priceVisibility: string;
  },
  isAuthenticated: boolean,
) => ({
  id: apartment.id,
  number: apartment.number,
  salesStatus: apartment.salesStatus,
  rooms: apartment.rooms,
  areaTotal: apartment.areaTotal?.toString() ?? null,
  price: shouldRevealPrice(apartment.priceVisibility, isAuthenticated)
    ? (apartment.price?.toString() ?? null)
    : null,
  priceCurrency: apartment.priceCurrency,
  priceVisibility:
    apartment.priceVisibility as FloorDetail['apartments'][number]['priceVisibility'],
});

export const mapBuildingDetail = (
  building: {
    id: string;
    name: string;
    description: string | null;
    displayOrder: number;
    floorsCount: number | null;
    coverMedia: MediaRow;
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
        areaTotal: Prisma.Decimal | null;
        price: Prisma.Decimal | null;
        priceCurrency: string;
        priceVisibility: string;
      }>;
    }>;
  },
  ctx: MapContext,
): BuildingDetail => {
  const projectName =
    resolveTranslatedValue(
      ctx.translations,
      TRANSLATION_ENTITY.project,
      building.project.id,
      TRANSLATION_FIELD.name,
      ctx.locale,
      building.project.name,
    ) ?? building.project.name;

  return {
    id: building.id,
    name: building.name,
    description: building.description,
    displayOrder: building.displayOrder,
    floorsCount: building.floorsCount,
    cover: toMediaSummary(building.coverMedia),
    availability: summarizeSalesStatuses(
      building.apartments.map((apartment) => apartment.salesStatus),
    ),
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
        mapFloorApartment(apartment, ctx.isAuthenticated),
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
    building: { id: string; name: string };
    project: { id: string; name: string; slug: string };
    apartments: Array<{
      id: string;
      number: string;
      salesStatus: ApartmentSalesStatus;
      rooms: number | null;
      areaTotal: Prisma.Decimal | null;
      price: Prisma.Decimal | null;
      priceCurrency: string;
      priceVisibility: string;
    }>;
  },
  ctx: MapContext,
): FloorDetail => {
  const projectName =
    resolveTranslatedValue(
      ctx.translations,
      TRANSLATION_ENTITY.project,
      floor.project.id,
      TRANSLATION_FIELD.name,
      ctx.locale,
      floor.project.name,
    ) ?? floor.project.name;

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
      mapFloorApartment(apartment, ctx.isAuthenticated),
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
