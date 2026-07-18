import type {
  ApartmentAvailabilitySummary,
  FloorApartmentSummary,
  PriceVisibility,
  ProjectDetail,
  ProjectListItem,
} from "@toonexpo/contracts";
import type { ApartmentSalesStatus, Prisma } from "@toonexpo/db";

import { DEFAULT_CATALOG_CURRENCY } from "../catalog.constants.js";
import {
  decimalToString,
  emptyAvailability,
  shouldRevealPublicPrice,
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

const mapFloorApartment = (apartment: {
  id: string;
  number: string;
  salesStatus: ApartmentSalesStatus;
  rooms: number | null;
  areaTotal: Prisma.Decimal | null;
  price: Prisma.Decimal | null;
  priceCurrency: string;
  priceVisibility: string;
}): FloorApartmentSummary => {
  const revealPrice = shouldRevealPublicPrice(apartment.priceVisibility);

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

const aggregatePrices = (
  apartments: ApartmentPriceRow[],
): {
  minPrice: string | null;
  maxPrice: string | null;
  priceCurrency: string | null;
} => {
  const publicPrices = apartments.filter(
    (apartment) =>
      apartment.priceVisibility === "public" && apartment.price != null,
  );

  if (publicPrices.length === 0) {
    return { minPrice: null, maxPrice: null, priceCurrency: null };
  }

  let min = publicPrices[0]?.price;
  let max = publicPrices[0]?.price;

  for (const apartment of publicPrices) {
    if (apartment.price == null) {
      continue;
    }
    if (min == null || apartment.price.lt(min)) {
      min = apartment.price;
    }
    if (max == null || apartment.price.gt(max)) {
      max = apartment.price;
    }
  }

  return {
    minPrice: decimalToString(min),
    maxPrice: decimalToString(max),
    priceCurrency: publicPrices[0]?.priceCurrency ?? DEFAULT_CATALOG_CURRENCY,
  };
};

export const mapProjectListItem = (project: ProjectListSource): ProjectListItem => {
  const prices = aggregatePrices(project.apartments);

  return {
    id: project.id,
    name: project.name,
    slug: project.slug,
    shortDescription: project.shortDescription,
    locationText: project.locationText,
    address: project.address,
    city: project.city,
    district: project.district,
    cover: toMediaSummary(project.coverMedia),
    builder: {
      id: project.builderCompany.id,
      name: project.builderCompany.name,
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

export const mapProjectDetail = (project: ProjectDetailSource): ProjectDetail => {
  const listBase = mapProjectListItem(project);
  const prices = aggregatePrices(project.apartments);

  return {
    ...listBase,
    fullDescription: project.fullDescription,
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
        apartments: floor.apartments.map(mapFloorApartment),
      })),
    })),
    minPrice: prices.minPrice,
    maxPrice: prices.maxPrice,
    priceCurrency: prices.priceCurrency,
  };
};
