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

/**
 * Company / builder display name.
 * Admin stores a single scalar name (no per-locale company UI). Use the
 * locale translation when present; otherwise show the scalar name so public
 * EN/RU pages are not blank.
 */
export const resolveCompanyDisplayName = (
  rows: TranslationRow[],
  companyId: string,
  locale: SupportedLocale,
  scalarName: string,
): string => {
  const translated = resolveTranslatedValue(
    rows,
    TRANSLATION_ENTITY.company,
    companyId,
    TRANSLATION_FIELD.name,
    locale,
    scalarName,
  );
  const trimmed = translated?.trim();
  if (trimmed) {
    return trimmed;
  }
  return scalarName.trim();
};

/**
 * Company scalar text from admin (no per-locale company UI).
 * Use the locale translation when present; otherwise show the scalar text.
 */
const resolveCompanyScalarField = (
  rows: TranslationRow[],
  companyId: string,
  fieldName: TranslationFieldName,
  locale: SupportedLocale,
  scalar: string | null,
): string | null => {
  const translated = resolveTranslatedValue(
    rows,
    TRANSLATION_ENTITY.company,
    companyId,
    fieldName,
    locale,
    scalar,
  );
  const trimmed = translated?.trim();
  if (trimmed) {
    return trimmed;
  }
  const fallback = scalar?.trim();
  return fallback ? fallback : null;
};

export const resolveCompanyDisplayDescription = (
  rows: TranslationRow[],
  companyId: string,
  locale: SupportedLocale,
  scalarDescription: string | null,
): string | null =>
  resolveCompanyScalarField(
    rows,
    companyId,
    TRANSLATION_FIELD.description,
    locale,
    scalarDescription,
  );

export const resolveCompanyDisplayShortDescription = (
  rows: TranslationRow[],
  companyId: string,
  locale: SupportedLocale,
  scalarShortDescription: string | null,
): string | null =>
  resolveCompanyScalarField(
    rows,
    companyId,
    TRANSLATION_FIELD.shortDescription,
    locale,
    scalarShortDescription,
  );

export { resolveCatalogLocale };
