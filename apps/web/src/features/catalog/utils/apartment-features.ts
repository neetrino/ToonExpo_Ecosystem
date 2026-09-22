import { TRANSLATION_LOCALES } from '@/features/builder/constants';

/**
 * Optional apartment extras stored in `Apartment.features` JSON.
 * Used when dedicated columns are not yet on the schema.
 */
export type LocalizedFeatureText = {
  hy: string;
  ru: string;
  en: string;
};

export type ApartmentFeatureExtras = {
  windowsCount: number | null;
  balconiesCount: number | null;
  ceilingHeightM: number | null;
  finishingStatus: LocalizedFeatureText;
  handoverDescription: LocalizedFeatureText;
};

const EMPTY_LOCALIZED: LocalizedFeatureText = { hy: '', ru: '', en: '' };

const EMPTY_EXTRAS: ApartmentFeatureExtras = {
  windowsCount: null,
  balconiesCount: null,
  ceilingHeightM: null,
  finishingStatus: EMPTY_LOCALIZED,
  handoverDescription: EMPTY_LOCALIZED,
};

type ContentLocale = (typeof TRANSLATION_LOCALES)[number];

const isContentLocale = (value: string): value is ContentLocale =>
  (TRANSLATION_LOCALES as readonly string[]).includes(value);

const asFiniteNumber = (value: unknown): number | null => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

const asNonEmptyString = (value: unknown): string | null => {
  if (typeof value !== 'string') {
    return null;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

/**
 * Reads a plain string or `{ hy, ru, en }` map from features JSON.
 * Legacy plain strings are treated as Armenian (canonical store).
 */
export const parseLocalizedFeatureText = (value: unknown): LocalizedFeatureText => {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed.length > 0 ? { hy: trimmed, ru: '', en: '' } : EMPTY_LOCALIZED;
  }

  if (value == null || typeof value !== 'object' || Array.isArray(value)) {
    return EMPTY_LOCALIZED;
  }

  const record = value as Record<string, unknown>;
  return {
    hy: asNonEmptyString(record['hy']) ?? '',
    ru: asNonEmptyString(record['ru']) ?? '',
    en: asNonEmptyString(record['en']) ?? '',
  };
};

/**
 * Picks localized feature text for the active UI locale (hy → any fallback).
 */
export const resolveLocalizedFeatureText = (
  value: LocalizedFeatureText,
  locale: string,
): string | null => {
  const preferred = isContentLocale(locale) ? locale : 'hy';
  const exact = value[preferred].trim();
  if (exact.length > 0) {
    return exact;
  }

  for (const fallback of TRANSLATION_LOCALES) {
    const candidate = value[fallback].trim();
    if (candidate.length > 0) {
      return candidate;
    }
  }

  return null;
};

const toStoredLocalizedText = (
  value: LocalizedFeatureText,
): LocalizedFeatureText | string | null => {
  const next: LocalizedFeatureText = {
    hy: value.hy.trim(),
    ru: value.ru.trim(),
    en: value.en.trim(),
  };

  if (next.hy.length === 0 && next.ru.length === 0 && next.en.length === 0) {
    return null;
  }

  // Keep a plain string when only Armenian is set (matches legacy rows).
  if (next.hy.length > 0 && next.ru.length === 0 && next.en.length === 0) {
    return next.hy;
  }

  return next;
};

/**
 * Reads known apartment criteria from the opaque `features` payload.
 */
export const parseApartmentFeatureExtras = (features: unknown): ApartmentFeatureExtras => {
  if (features == null || typeof features !== 'object' || Array.isArray(features)) {
    return EMPTY_EXTRAS;
  }

  const record = features as Record<string, unknown>;

  return {
    windowsCount: asFiniteNumber(
      record['windowsCount'] ?? record['windows'] ?? record['windowCount'],
    ),
    balconiesCount: asFiniteNumber(
      record['balconiesCount'] ?? record['balconies'] ?? record['balconyCount'],
    ),
    ceilingHeightM: asFiniteNumber(
      record['ceilingHeightM'] ?? record['ceilingHeight'] ?? record['ceiling'],
    ),
    finishingStatus: parseLocalizedFeatureText(
      record['finishingStatus'] ?? record['finishStatus'] ?? record['finishing'],
    ),
    handoverDescription: parseLocalizedFeatureText(
      record['handoverDescription'] ?? record['handover'] ?? record['deliveryDescription'],
    ),
  };
};

/**
 * Merges finishing/handover form values into apartment `features` JSON.
 * Clears known aliases when the field is emptied.
 */
export const mergeApartmentFeatureExtras = (
  existing: unknown,
  extras: {
    finishingStatus: LocalizedFeatureText;
    handoverDescription: LocalizedFeatureText;
  },
): Record<string, unknown> => {
  const base =
    existing != null && typeof existing === 'object' && !Array.isArray(existing)
      ? { ...(existing as Record<string, unknown>) }
      : {};

  const finishingStatus = toStoredLocalizedText(extras.finishingStatus);
  if (finishingStatus != null) {
    base['finishingStatus'] = finishingStatus;
  } else {
    delete base['finishingStatus'];
    delete base['finishStatus'];
    delete base['finishing'];
  }

  const handoverDescription = toStoredLocalizedText(extras.handoverDescription);
  if (handoverDescription != null) {
    base['handoverDescription'] = handoverDescription;
  } else {
    delete base['handoverDescription'];
    delete base['handover'];
    delete base['deliveryDescription'];
  }

  return base;
};
