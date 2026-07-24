/**
 * Optional project catalog extras stored in `Project.amenities` / `nearbyPlaces` JSON.
 * Supports legacy string[] payloads and the structured object shape used for rich catalog pages.
 */

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

const asNonEmptyString = (value: unknown): string | null => {
  if (typeof value !== 'string') {
    return null;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const asStringList = (value: unknown): string[] => {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .map((item) => (typeof item === 'string' ? item.trim() : ''))
    .filter((item) => item.length > 0);
};

const parseDetailsRecord = (record: Record<string, unknown>): ProjectCatalogDetails => {
  const details = { ...EMPTY_DETAILS };
  for (const key of DETAIL_KEYS) {
    details[key] = asNonEmptyString(record[key]);
  }
  return details;
};

/**
 * Reads amenity labels + catalog detail fields from `Project.amenities`.
 */
export const parseProjectAmenities = (
  amenities: unknown,
): { labels: string[]; details: ProjectCatalogDetails } => {
  if (Array.isArray(amenities)) {
    return { labels: asStringList(amenities), details: { ...EMPTY_DETAILS } };
  }

  if (amenities == null || typeof amenities !== 'object') {
    return { labels: [], details: { ...EMPTY_DETAILS } };
  }

  const record = amenities as Record<string, unknown>;
  const labels = asStringList(record.labels ?? record.items ?? record.amenities);
  const detailsSource =
    record.details != null && typeof record.details === 'object' && !Array.isArray(record.details)
      ? (record.details as Record<string, unknown>)
      : record;

  return {
    labels,
    details: parseDetailsRecord(detailsSource),
  };
};

/**
 * Reads nearby place labels from `Project.nearbyPlaces`.
 */
export const parseProjectNearbyPlaces = (nearbyPlaces: unknown): string[] => {
  if (Array.isArray(nearbyPlaces)) {
    return asStringList(nearbyPlaces);
  }

  if (nearbyPlaces == null || typeof nearbyPlaces !== 'object') {
    return [];
  }

  const record = nearbyPlaces as Record<string, unknown>;
  return asStringList(record.places ?? record.items ?? record.nearby);
};

/**
 * Parses both JSON columns into one catalog payload for the project detail page.
 */
export const parseProjectCatalog = (
  amenities: unknown,
  nearbyPlaces: unknown,
): ParsedProjectCatalog => {
  const parsedAmenities = parseProjectAmenities(amenities);
  return {
    amenityLabels: parsedAmenities.labels,
    nearbyPlaces: parseProjectNearbyPlaces(nearbyPlaces),
    details: parsedAmenities.details,
  };
};

/**
 * True when there is at least one non-empty catalog detail field.
 */
export const hasProjectCatalogDetails = (details: ProjectCatalogDetails): boolean =>
  DETAIL_KEYS.some((key) => details[key] != null);
