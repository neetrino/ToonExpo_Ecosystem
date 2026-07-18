import {
  CATALOG_CONTENT_FALLBACK_LOCALE,
  resolveCatalogLocale,
  type SupportedLocale,
} from "@toonexpo/shared";

export const TRANSLATION_ENTITY = {
  company: "company",
  project: "project",
  apartment: "apartment",
} as const;

export type TranslationEntityType =
  (typeof TRANSLATION_ENTITY)[keyof typeof TRANSLATION_ENTITY];

export const TRANSLATION_FIELD = {
  name: "name",
  description: "description",
  shortDescription: "shortDescription",
  fullDescription: "fullDescription",
  locationText: "locationText",
} as const;

export type TranslationFieldName =
  (typeof TRANSLATION_FIELD)[keyof typeof TRANSLATION_FIELD];

export type TranslationRow = {
  entityType: string;
  entityId: string;
  fieldName: string;
  locale: string;
  value: string;
};

/**
 * Picks translated text for a field: requested locale → hy → scalar fallback.
 */
export const resolveTranslatedValue = (
  rows: TranslationRow[],
  entityType: string,
  entityId: string,
  fieldName: string,
  locale: SupportedLocale,
  scalarFallback: string | null,
): string | null => {
  const matches = rows.filter(
    (row) =>
      row.entityType === entityType &&
      row.entityId === entityId &&
      row.fieldName === fieldName,
  );

  const exact = matches.find((row) => row.locale === locale);
  if (exact) {
    return exact.value;
  }

  if (locale !== CATALOG_CONTENT_FALLBACK_LOCALE) {
    const fallbackLocale = matches.find(
      (row) => row.locale === CATALOG_CONTENT_FALLBACK_LOCALE,
    );
    if (fallbackLocale) {
      return fallbackLocale.value;
    }
  }

  return scalarFallback;
};

export { resolveCatalogLocale };
