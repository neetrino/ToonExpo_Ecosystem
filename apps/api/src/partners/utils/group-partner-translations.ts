import type {
  PartnerOfferTranslationsInput,
  PartnerProfileTranslationsInput,
  LocaleTextMap,
} from "@toonexpo/contracts";
import { SUPPORTED_LOCALES, type SupportedLocale } from "@toonexpo/shared";

import type {
  TranslationFieldName,
  TranslationRow,
} from "../../catalog/utils/resolve-translation.js";
import { TRANSLATION_FIELD } from "../../catalog/utils/resolve-translation.js";

const isSupportedLocale = (value: string): value is SupportedLocale =>
  (SUPPORTED_LOCALES as readonly string[]).includes(value);

const toLocaleMap = (
  rows: TranslationRow[],
  fieldName: string,
): LocaleTextMap => {
  const map: LocaleTextMap = {};

  for (const row of rows) {
    if (row.fieldName !== fieldName || !isSupportedLocale(row.locale)) {
      continue;
    }
    map[row.locale] = row.value;
  }

  return map;
};

const hasLocales = (map: LocaleTextMap): boolean => Object.keys(map).length > 0;

/**
 * Groups partner profile Translation rows for admin/portal detail responses.
 */
export const groupPartnerProfileTranslations = (
  rows: TranslationRow[],
): PartnerProfileTranslationsInput => {
  const result: PartnerProfileTranslationsInput = {};
  assignProfileField(result, TRANSLATION_FIELD.shortDescription, rows);
  assignProfileField(result, TRANSLATION_FIELD.fullDescription, rows);
  return result;
};

/**
 * Groups partner offer Translation rows for admin/portal detail responses.
 */
export const groupPartnerOfferTranslations = (
  rows: TranslationRow[],
): PartnerOfferTranslationsInput => {
  const result: PartnerOfferTranslationsInput = {};
  assignOfferField(result, TRANSLATION_FIELD.title, rows);
  assignOfferField(result, TRANSLATION_FIELD.description, rows);
  return result;
};

const assignProfileField = (
  result: PartnerProfileTranslationsInput,
  fieldName: TranslationFieldName,
  rows: TranslationRow[],
): void => {
  const locales = toLocaleMap(rows, fieldName);
  if (!hasLocales(locales)) {
    return;
  }

  if (fieldName === TRANSLATION_FIELD.shortDescription) {
    result.shortDescription = locales;
    return;
  }

  if (fieldName === TRANSLATION_FIELD.fullDescription) {
    result.fullDescription = locales;
  }
};

const assignOfferField = (
  result: PartnerOfferTranslationsInput,
  fieldName: TranslationFieldName,
  rows: TranslationRow[],
): void => {
  const locales = toLocaleMap(rows, fieldName);
  if (!hasLocales(locales)) {
    return;
  }

  if (fieldName === TRANSLATION_FIELD.title) {
    result.title = locales;
    return;
  }

  if (fieldName === TRANSLATION_FIELD.description) {
    result.description = locales;
  }
};
