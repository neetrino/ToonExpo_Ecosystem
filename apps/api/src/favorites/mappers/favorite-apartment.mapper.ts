import type { FavoriteApartmentCard, PriceVisibility } from '@toonexpo/contracts';
import type { ApartmentSalesStatus, Prisma } from '@toonexpo/db';
import type { SupportedLocale } from '@toonexpo/shared';

import {
  decimalToString,
  shouldRevealCatalogPrice,
  toMediaSummary,
} from '../../catalog/mappers/catalog.mapper.js';
import {
  resolveCompanyDisplayName,
  resolveTranslatedName,
  resolveTranslatedValue,
  TRANSLATION_ENTITY,
  TRANSLATION_FIELD,
  type TranslationRow,
} from '../../catalog/utils/resolve-translation.js';
import { toPublicFileUrl } from '../../media/public-file-url.js';

type ApartmentFavoriteSource = {
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
  coverMedia: Parameters<typeof toMediaSummary>[0];
  verified: boolean;
  building: { priceOnRequestEnabled: boolean };
  project: {
    id: string;
    name: string;
    slug: string;
    city: string | null;
    district: string | null;
    locationText: string | null;
    priceOnRequestEnabled: boolean;
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
  const priceOnRequest =
    apartment.building.priceOnRequestEnabled || apartment.project.priceOnRequestEnabled;
  const revealPrice = shouldRevealCatalogPrice(
    apartment.priceVisibility,
    ctx.isAuthenticated,
    priceOnRequest,
  );

  const projectName = resolveTranslatedName(
    ctx.translations,
    TRANSLATION_ENTITY.project,
    apartment.project.id,
    TRANSLATION_FIELD.name,
    ctx.locale,
    apartment.project.name,
  );

  const builderName = resolveCompanyDisplayName(
    ctx.translations,
    apartment.project.builderCompany.id,
    ctx.locale,
    apartment.project.builderCompany.name,
  );

  return {
    id: apartment.id,
    slug: apartment.slug,
    number: apartment.number,
    salesStatus: apartment.salesStatus,
    rooms: apartment.rooms,
    bedrooms: apartment.bedrooms,
    bathrooms: apartment.bathrooms,
    areaTotal: decimalToString(apartment.areaTotal),
    price: revealPrice ? decimalToString(apartment.price) : null,
    priceCurrency: apartment.priceCurrency,
    priceVisibility: apartment.priceVisibility as PriceVisibility,
    priceOnRequest,
    cover: toMediaSummary(apartment.coverMedia),
    verified: apartment.verified,
    city: apartment.project.city,
    district: apartment.project.district,
    locationText: resolveTranslatedValue(
      ctx.translations,
      TRANSLATION_ENTITY.project,
      apartment.project.id,
      TRANSLATION_FIELD.locationText,
      ctx.locale,
      apartment.project.locationText,
    ),
    project: {
      id: apartment.project.id,
      name: projectName,
      slug: apartment.project.slug,
    },
    builder: {
      id: apartment.project.builderCompany.id,
      name: builderName,
      logoUrl: apartment.project.builderCompany.logoMedia
        ? toPublicFileUrl(apartment.project.builderCompany.logoMedia.fileUrl)
        : null,
    },
  };
};
