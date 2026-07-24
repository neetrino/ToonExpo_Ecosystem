/**
 * Optional project catalog extras stored in `Project.amenities` / `nearbyPlaces` JSON.
 * Supports legacy string[] / plain-string values and localized `{ hy, ru, en }` payloads.
 */

import {
  parseProjectCatalogLinks,
  type ProjectCatalogLink,
} from '@/features/catalog/utils/project-catalog-links';

export type {
  ProjectCatalogLink,
  ProjectCatalogLinkId,
} from '@/features/catalog/utils/project-catalog-links';
export { PROJECT_CATALOG_LINK_IDS } from '@/features/catalog/utils/project-catalog-links';

export type CatalogContentLocale = 'hy' | 'ru' | 'en';

export type ProjectCatalogDetails = {
  propertyType: string | null;
  country: string | null;
  city: string | null;
  address: string | null;
  brandName: string | null;
  permitNumber: string | null;
  constructionStart: string | null;
  constructionEnd: string | null;
  constructionStatus: string | null;
  partnerBank: string | null;
  pricePerSqmMin: string | null;
  pricePerSqmMax: string | null;
  areaMinSqm: string | null;
  areaMaxSqm: string | null;
  unitPriceMin: string | null;
  unitPriceMax: string | null;
  managementFee: string | null;
  services: string | null;
  paymentTypes: string | null;
  installmentTerms: string | null;
  mortgageTerms: string | null;
  parkingAvailable: string | null;
  storageAvailable: string | null;
  elevator: string | null;
  specialTerms: string | null;
  constructionType: string | null;
  facadeMaterials: string | null;
  seismicStandard: string | null;
  buildingsCount: string | null;
  apartmentsCount: string | null;
  parkingSpaces: string | null;
  ceilingHeightM: string | null;
  floorsCount: string | null;
  heating: string | null;
  hotWater: string | null;
  gas: string | null;
  schoolDistance: string | null;
  kindergartenDistance: string | null;
  commercialAreaSqm: string | null;
  distanceExtra: string | null;
  economicZone: string | null;
  finishingStatus: string | null;
  handoverDescription: string | null;
};

export type ParsedProjectCatalog = {
  amenityLabels: string[];
  nearbyPlaces: string[];
  details: ProjectCatalogDetails;
  links: ProjectCatalogLink[];
};

const EMPTY_DETAILS: ProjectCatalogDetails = {
  propertyType: null,
  country: null,
  city: null,
  address: null,
  brandName: null,
  permitNumber: null,
  constructionStart: null,
  constructionEnd: null,
  constructionStatus: null,
  partnerBank: null,
  pricePerSqmMin: null,
  pricePerSqmMax: null,
  areaMinSqm: null,
  areaMaxSqm: null,
  unitPriceMin: null,
  unitPriceMax: null,
  managementFee: null,
  services: null,
  paymentTypes: null,
  installmentTerms: null,
  mortgageTerms: null,
  parkingAvailable: null,
  storageAvailable: null,
  elevator: null,
  specialTerms: null,
  constructionType: null,
  facadeMaterials: null,
  seismicStandard: null,
  buildingsCount: null,
  apartmentsCount: null,
  parkingSpaces: null,
  ceilingHeightM: null,
  floorsCount: null,
  heating: null,
  hotWater: null,
  gas: null,
  schoolDistance: null,
  kindergartenDistance: null,
  commercialAreaSqm: null,
  distanceExtra: null,
  economicZone: null,
  finishingStatus: null,
  handoverDescription: null,
};

const DETAIL_KEYS = Object.keys(EMPTY_DETAILS) as Array<keyof ProjectCatalogDetails>;

const LOCALE_FALLBACK: CatalogContentLocale[] = ['hy', 'en', 'ru'];

const asNonEmptyString = (value: unknown): string | null => {
  if (typeof value !== 'string') {
    return null;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const resolveLocaleText = (value: unknown, locale: CatalogContentLocale): string | null => {
  const plain = asNonEmptyString(value);
  if (plain != null) {
    return plain;
  }

  if (value == null || typeof value !== 'object' || Array.isArray(value)) {
    return null;
  }

  const record = value as Record<string, unknown>;
  const preferred = asNonEmptyString(record[locale]);
  if (preferred != null) {
    return preferred;
  }

  for (const fallback of LOCALE_FALLBACK) {
    const next = asNonEmptyString(record[fallback]);
    if (next != null) {
      return next;
    }
  }

  return null;
};

const asLocalizedStringList = (value: unknown, locale: CatalogContentLocale): string[] => {
  if (Array.isArray(value)) {
    return value
      .map((item) => resolveLocaleText(item, locale))
      .filter((item): item is string => item != null);
  }

  if (value != null && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    const localeList = record[locale];
    if (Array.isArray(localeList)) {
      return localeList
        .map((item) => asNonEmptyString(item))
        .filter((item): item is string => item != null);
    }

    for (const fallback of LOCALE_FALLBACK) {
      const list = record[fallback];
      if (Array.isArray(list)) {
        return list
          .map((item) => asNonEmptyString(item))
          .filter((item): item is string => item != null);
      }
    }
  }

  return [];
};

const parseDetailsRecord = (
  record: Record<string, unknown>,
  locale: CatalogContentLocale,
): ProjectCatalogDetails => {
  const details = { ...EMPTY_DETAILS };
  for (const key of DETAIL_KEYS) {
    details[key] = resolveLocaleText(record[key], locale);
  }
  return details;
};

/**
 * Reads amenity labels + catalog detail fields from `Project.amenities`.
 */
export const parseProjectAmenities = (
  amenities: unknown,
  locale: CatalogContentLocale,
): { labels: string[]; details: ProjectCatalogDetails; links: ProjectCatalogLink[] } => {
  if (Array.isArray(amenities)) {
    return {
      labels: asLocalizedStringList(amenities, locale),
      details: { ...EMPTY_DETAILS },
      links: [],
    };
  }

  if (amenities == null || typeof amenities !== 'object') {
    return { labels: [], details: { ...EMPTY_DETAILS }, links: [] };
  }

  const record = amenities as Record<string, unknown>;
  const labels = asLocalizedStringList(
    record['labels'] ?? record['items'] ?? record['amenities'],
    locale,
  );
  const detailsValue = record['details'];
  const detailsSource =
    detailsValue != null && typeof detailsValue === 'object' && !Array.isArray(detailsValue)
      ? (detailsValue as Record<string, unknown>)
      : record;

  return {
    labels,
    details: parseDetailsRecord(detailsSource, locale),
    links: parseProjectCatalogLinks(record['links']),
  };
};

/**
 * Reads nearby place labels from `Project.nearbyPlaces`.
 */
export const parseProjectNearbyPlaces = (
  nearbyPlaces: unknown,
  locale: CatalogContentLocale,
): string[] => {
  if (Array.isArray(nearbyPlaces)) {
    return asLocalizedStringList(nearbyPlaces, locale);
  }

  if (nearbyPlaces == null || typeof nearbyPlaces !== 'object') {
    return [];
  }

  const record = nearbyPlaces as Record<string, unknown>;
  return asLocalizedStringList(record['places'] ?? record['items'] ?? record['nearby'], locale);
};

const toCatalogLocale = (locale: string): CatalogContentLocale => {
  if (locale === 'ru' || locale === 'en' || locale === 'hy') {
    return locale;
  }
  return 'hy';
};

/**
 * Parses both JSON columns into one catalog payload for the project detail page.
 */
export const parseProjectCatalog = (
  amenities: unknown,
  nearbyPlaces: unknown,
  locale: string,
): ParsedProjectCatalog => {
  const contentLocale = toCatalogLocale(locale);
  const parsedAmenities = parseProjectAmenities(amenities, contentLocale);
  return {
    amenityLabels: parsedAmenities.labels,
    nearbyPlaces: parseProjectNearbyPlaces(nearbyPlaces, contentLocale),
    details: parsedAmenities.details,
    links: parsedAmenities.links,
  };
};

/**
 * True when there is at least one non-empty catalog detail field.
 */
export const hasProjectCatalogDetails = (details: ProjectCatalogDetails): boolean =>
  DETAIL_KEYS.some((key) => details[key] != null);
