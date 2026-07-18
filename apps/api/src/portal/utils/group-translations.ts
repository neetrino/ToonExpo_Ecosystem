import type { LocaleTextMap, PortalTranslationsInput } from "@toonexpo/contracts";
import { SUPPORTED_LOCALES, type SupportedLocale } from "@toonexpo/shared";

import type {
  TranslationFieldName,
  TranslationRow,
} from "../../catalog/utils/resolve-translation.js";

const isSupportedLocale = (value: string): value is SupportedLocale =>
  (SUPPORTED_LOCALES as readonly string[]).includes(value);

/**
 * Groups Translation rows into `{ field: { hy, ru, en } }` for portal detail responses.
 */
export const groupPortalTranslations = (
  rows: TranslationRow[],
  fieldNames: readonly TranslationFieldName[],
): PortalTranslationsInput => {
  const result: PortalTranslationsInput = {};

  for (const fieldName of fieldNames) {
    const locales = toLocaleMap(rows, fieldName);
    if (Object.keys(locales).length === 0) {
      continue;
    }
    assignField(result, fieldName, locales);
  }

  return result;
};

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

const assignField = (
  result: PortalTranslationsInput,
  fieldName: TranslationFieldName,
  locales: LocaleTextMap,
): void => {
  switch (fieldName) {
    case "name":
      result.name = locales;
      break;
    case "shortDescription":
      result.shortDescription = locales;
      break;
    case "fullDescription":
      result.fullDescription = locales;
      break;
    case "locationText":
      result.locationText = locales;
      break;
    case "description":
      result.description = locales;
      break;
    default:
      break;
  }
};
