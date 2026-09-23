import type { ProjectCatalogDetails } from '@/features/catalog/utils/project-catalog-details';

/**
 * Catalog values that are the same in every language: money, counts, dates, codes, measurements.
 * Stored as one string. Legacy `{ hy, ru, en }` objects collapse to a single canonical value.
 */
export const PROJECT_CATALOG_STATIC_DETAIL_KEYS = [
  'zipCode',
  'permitNumber',
  'constructionStart',
  'constructionEnd',
  'bedroomsCount',
  'pricePerSqmMin',
  'pricePerSqmMax',
  'areaMinSqm',
  'areaMaxSqm',
  'unitPriceMin',
  'unitPriceMax',
  'parkingPrice',
  'elevatorsCount',
  'totalLandArea',
  'totalResidentialArea',
  'buildingsCount',
  'apartmentsCount',
  'availableApartmentsCount',
  'parkingSpaces',
  'openParkingSpaces',
  'closedParkingSpaces',
  'ceilingHeightM',
  'floorsCount',
  'commercialAreaSqm',
  'schoolDistance',
  'kindergartenDistance',
] as const satisfies ReadonlyArray<keyof ProjectCatalogDetails>;

export type ProjectCatalogStaticDetailKey = (typeof PROJECT_CATALOG_STATIC_DETAIL_KEYS)[number];

const STATIC_KEY_SET = new Set<string>(PROJECT_CATALOG_STATIC_DETAIL_KEYS);

const CANONICAL_LOCALES = ['hy', 'ru', 'en'] as const;

export type SharedCatalogText = {
  hy: string;
  ru: string;
  en: string;
};

export const isProjectCatalogStaticKey = (
  key: keyof ProjectCatalogDetails,
): key is ProjectCatalogStaticDetailKey => STATIC_KEY_SET.has(key);

const asTrimmedString = (value: unknown): string | null => {
  if (typeof value !== 'string') {
    return null;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

/**
 * One display value for a static catalog field, for every locale.
 * Plain strings win. Legacy locale maps prefer Armenian, then Russian, then English.
 */
export const resolveStaticCatalogText = (value: unknown): string | null => {
  const plain = asTrimmedString(value);
  if (plain != null) {
    return plain;
  }
  if (value == null || typeof value !== 'object' || Array.isArray(value)) {
    return null;
  }
  const record = value as Record<string, unknown>;
  for (const locale of CANONICAL_LOCALES) {
    const localized = asTrimmedString(record[locale]);
    if (localized != null) {
      return localized;
    }
  }
  return null;
};

/** Copies the canonical static value into every locale slot of the admin form. */
export const readSharedCatalogText = (value: unknown): SharedCatalogText => {
  const canonical = resolveStaticCatalogText(value) ?? '';
  return { hy: canonical, ru: canonical, en: canonical };
};

/** Persists a static field as one database string, not a per-locale map. */
export const writeSharedCatalogText = (value: SharedCatalogText): string | undefined => {
  const canonical = value.hy.trim() || value.ru.trim() || value.en.trim();
  return canonical.length > 0 ? canonical : undefined;
};
