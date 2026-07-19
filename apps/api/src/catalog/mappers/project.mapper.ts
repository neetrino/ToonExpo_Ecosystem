import type {
  ApartmentAvailabilitySummary,
  FloorApartmentSummary,
  PriceVisibility,
  ProjectDetail,
  ProjectListItem,
} from "@toonexpo/contracts";
import type { ApartmentSalesStatus, Prisma } from "@toonexpo/db";
import type { SupportedLocale } from "@toonexpo/shared";

import {
  resolveTranslatedValue,
  TRANSLATION_ENTITY,
  TRANSLATION_FIELD,
  type TranslationRow,
} from "../utils/resolve-translation.js";
import { aggregateVisiblePrices } from "./aggregate-prices.js";
import {
  decimalToString,
  emptyAvailability,
  shouldRevealPrice,
  summarizeSalesStatuses,
  toMediaSummary,
} from "./catalog.mapper.js";

type MediaRow = Parameters<typeof toMediaSummary>[0];

type ApartmentPriceRow = {
  salesStatus: ApartmentSalesStatus;
  price: Prisma.Decimal | null;
  priceCurrency: string;
  priceVisibility: string;
};

type ProjectListSource = {
  id: string;
  name: string;
  slug: string;
  shortDescription: string | null;
  locationText: string | null;
  address: string | null;
  city: string | null;
  district: string | null;
  coverMedia: MediaRow;
  builderCompany: {
    id: string;
    name: string;
    logoMedia: MediaRow;
  };
  apartments: ApartmentPriceRow[];
};

type ProjectDetailSource = ProjectListSource & {
  fullDescription: string | null;
  latitude: Prisma.Decimal | null;
  longitude: Prisma.Decimal | null;
  projectType: string | null;
  constructionStatus: string | null;
  completionDate: Date | null;
  amenities: Prisma.JsonValue;
  nearbyPlaces: Prisma.JsonValue;
  buildings: Array<{
    id: string;
    name: string;
    description: string | null;
    displayOrder: number;
    floorsCount: number | null;
    coverMedia: MediaRow;
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
  }>;
};

type MapContext = {
  locale: SupportedLocale;
  isAuthenticated: boolean;
  translations: TranslationRow[];
};

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
): FloorApartmentSummary => {
  const revealPrice = shouldRevealPrice(
    apartment.priceVisibility,
    isAuthenticated,
  );

  return {
    id: apartment.id,
    number: apartment.number,
    salesStatus: apartment.salesStatus,
    rooms: apartment.rooms,
    areaTotal: decimalToString(apartment.areaTotal),
    price: revealPrice ? decimalToString(apartment.price) : null,
    priceCurrency: apartment.priceCurrency,
    priceVisibility: apartment.priceVisibility as PriceVisibility,
  };
};

const statusesToSummary = (
  rows: Array<{ salesStatus: ApartmentSalesStatus }>,
): ApartmentAvailabilitySummary => {
  if (rows.length === 0) {
    return emptyAvailability();
  }

  return summarizeSalesStatuses(rows.map((row) => row.salesStatus));
};

const localizeProjectFields = (
  project: ProjectListSource,
  ctx: MapContext,
): {
  name: string;
  shortDescription: string | null;
  locationText: string | null;
  builderName: string;
} => {
  const { locale, translations } = ctx;
  return {
    name:
      resolveTranslatedValue(
        translations,
        TRANSLATION_ENTITY.project,
        project.id,
        TRANSLATION_FIELD.name,
        locale,
        project.name,
      ) ?? project.name,
    shortDescription: resolveTranslatedValue(
      translations,
      TRANSLATION_ENTITY.project,
      project.id,
      TRANSLATION_FIELD.shortDescription,
      locale,
      project.shortDescription,
    ),
    locationText: resolveTranslatedValue(
      translations,
      TRANSLATION_ENTITY.project,
      project.id,
      TRANSLATION_FIELD.locationText,
      locale,
      project.locationText,
    ),
    builderName:
      resolveTranslatedValue(
        translations,
        TRANSLATION_ENTITY.company,
        project.builderCompany.id,
        TRANSLATION_FIELD.name,
        locale,
        project.builderCompany.name,
      ) ?? project.builderCompany.name,
  };
};

export const mapProjectListItem = (
  project: ProjectListSource,
  ctx: MapContext,
): ProjectListItem => {
  const prices = aggregateVisiblePrices(project.apartments, ctx.isAuthenticated);
  const localized = localizeProjectFields(project, ctx);

  return {
    id: project.id,
    name: localized.name,
    slug: project.slug,
    shortDescription: localized.shortDescription,
    locationText: localized.locationText,
    address: project.address,
    city: project.city,
    district: project.district,
    cover: toMediaSummary(project.coverMedia),
    builder: {
      id: project.builderCompany.id,
      name: localized.builderName,
      logoUrl: project.builderCompany.logoMedia?.fileUrl ?? null,
    },
    availability: summarizeSalesStatuses(
      project.apartments.map((apartment) => apartment.salesStatus),
    ),
    minPrice: prices.minPrice,
    maxPrice: prices.maxPrice,
    priceCurrency: prices.priceCurrency,
  };
};

export const mapProjectDetail = (
  project: ProjectDetailSource,
  ctx: MapContext,
): ProjectDetail => {
  const listBase = mapProjectListItem(project, ctx);
  const prices = aggregateVisiblePrices(project.apartments, ctx.isAuthenticated);
  const fullDescription = resolveTranslatedValue(
    ctx.translations,
    TRANSLATION_ENTITY.project,
    project.id,
    TRANSLATION_FIELD.fullDescription,
    ctx.locale,
    project.fullDescription,
  );

  return {
    ...listBase,
    fullDescription,
    latitude: decimalToString(project.latitude),
    longitude: decimalToString(project.longitude),
    projectType: project.projectType,
    constructionStatus: project.constructionStatus,
    completionDate: project.completionDate
      ? project.completionDate.toISOString().slice(0, 10)
      : null,
    amenities: project.amenities,
    nearbyPlaces: project.nearbyPlaces,
    buildings: project.buildings.map((building) => ({
      id: building.id,
      name: building.name,
      description: building.description,
      displayOrder: building.displayOrder,
      floorsCount: building.floorsCount,
      cover: toMediaSummary(building.coverMedia),
      availability: statusesToSummary(building.apartments),
      floors: building.floors.map((floor) => ({
        id: floor.id,
        number: floor.number,
        name: floor.name,
        displayLabel: floor.displayLabel,
        displayOrder: floor.displayOrder,
        availability: statusesToSummary(floor.apartments),
        apartments: floor.apartments.map((apartment) =>
          mapFloorApartment(apartment, ctx.isAuthenticated),
        ),
      })),
    })),
    minPrice: prices.minPrice,
    maxPrice: prices.maxPrice,
    priceCurrency: prices.priceCurrency,
  };
};
