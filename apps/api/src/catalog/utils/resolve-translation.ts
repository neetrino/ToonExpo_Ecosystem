import {
  CATALOG_CONTENT_FALLBACK_LOCALE,
  resolveCatalogLocale,
  type SupportedLocale,
} from '@toonexpo/shared';

export const TRANSLATION_ENTITY = {
  company: 'company',
  project: 'project',
  apartment: 'apartment',
  partnerCompany: 'partner_company',
  partnerOffer: 'partner_offer',
} as const;

export type TranslationEntityType = (typeof TRANSLATION_ENTITY)[keyof typeof TRANSLATION_ENTITY];

export const TRANSLATION_FIELD = {
  name: 'name',
  description: 'description',
  shortDescription: 'shortDescription',
  fullDescription: 'fullDescription',
  locationText: 'locationText',
  title: 'title',
} as const;

export type TranslationFieldName = (typeof TRANSLATION_FIELD)[keyof typeof TRANSLATION_FIELD];

export type TranslationRow = {
  entityType: string;
  entityId: string;
  fieldName: string;
  locale: string;
  value: string;
};

/**
 * Picks translated text for the requested locale only.
 * Armenian scalar fallback applies only for `hy` (canonical store).
 * Never returns another language's text — missing locale yields null.
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
      row.entityType === entityType && row.entityId === entityId && row.fieldName === fieldName,
  );

  const exact = matches.find((row) => row.locale === locale);
  if (exact) {
    return exact.value;
  }

  if (locale === CATALOG_CONTENT_FALLBACK_LOCALE) {
    return scalarFallback;
  }

  return null;
};

/**
 * Required display name: translated value, or empty when the locale has no text.
 */
export const resolveTranslatedName = (
  rows: TranslationRow[],
  entityType: string,
  entityId: string,
  fieldName: string,
  locale: SupportedLocale,
  scalarFallback: string | null,
): string => {
  return (
    resolveTranslatedValue(rows, entityType, entityId, fieldName, locale, scalarFallback) ?? ''
  );
};

export { resolveCatalogLocale };
