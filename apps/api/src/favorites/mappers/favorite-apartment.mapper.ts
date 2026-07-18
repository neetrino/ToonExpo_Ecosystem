import type {
  FavoriteApartmentCard,
  PriceVisibility,
} from "@toonexpo/contracts";
import type { ApartmentSalesStatus, Prisma } from "@toonexpo/db";
import type { SupportedLocale } from "@toonexpo/shared";

import {
  decimalToString,
  shouldRevealPrice,
  toMediaSummary,
} from "../../catalog/mappers/catalog.mapper.js";
import {
  resolveTranslatedValue,
  TRANSLATION_ENTITY,
  TRANSLATION_FIELD,
  type TranslationRow,
} from "../../catalog/utils/resolve-translation.js";

type ApartmentFavoriteSource = {
  id: string;
  number: string;
  salesStatus: ApartmentSalesStatus;
  rooms: number | null;
  areaTotal: Prisma.Decimal | null;
  price: Prisma.Decimal | null;
  priceCurrency: string;
  priceVisibility: string;
  project: {
    id: string;
    name: string;
    slug: string;
    builderCompany: {
      id: string;
      name: string;
      logoMedia: Parameters<typeof toMediaSummary>[0];
    };
  };
};

type MapApartmentContext = {
  locale: SupportedLocale;
  isAuthenticated: boolean;
  translations: TranslationRow[];
};

export const mapFavoriteApartmentCard = (
  apartment: ApartmentFavoriteSource,
  ctx: MapApartmentContext,
): FavoriteApartmentCard => {
  const revealPrice = shouldRevealPrice(
    apartment.priceVisibility,
    ctx.isAuthenticated,
  );

  const projectName =
    resolveTranslatedValue(
      ctx.translations,
      TRANSLATION_ENTITY.project,
      apartment.project.id,
      TRANSLATION_FIELD.name,
      ctx.locale,
      apartment.project.name,
    ) ?? apartment.project.name;

  const builderName =
    resolveTranslatedValue(
      ctx.translations,
      TRANSLATION_ENTITY.company,
      apartment.project.builderCompany.id,
      TRANSLATION_FIELD.name,
      ctx.locale,
      apartment.project.builderCompany.name,
    ) ?? apartment.project.builderCompany.name;

  return {
    id: apartment.id,
    number: apartment.number,
    salesStatus: apartment.salesStatus,
    rooms: apartment.rooms,
    areaTotal: decimalToString(apartment.areaTotal),
    price: revealPrice ? decimalToString(apartment.price) : null,
    priceCurrency: apartment.priceCurrency,
    priceVisibility: apartment.priceVisibility as PriceVisibility,
    project: {
      id: apartment.project.id,
      name: projectName,
      slug: apartment.project.slug,
    },
    builder: {
      id: apartment.project.builderCompany.id,
      name: builderName,
      logoUrl: apartment.project.builderCompany.logoMedia?.fileUrl ?? null,
    },
  };
};
