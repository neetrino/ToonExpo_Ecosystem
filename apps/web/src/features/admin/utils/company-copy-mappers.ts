import type { CompanyResponse, CompanyTranslationsInput } from '@toonexpo/contracts';

import {
  emptyCompanyCopyValues,
  type CompanyCopyFieldsValues,
} from '@/features/admin/schemas/company-copy-fields.schema';

const optionalText = (value: string): string | undefined => (value.length > 0 ? value : undefined);

const buildLocaleMap = (
  hy: string,
  ru: string,
  en: string,
): { hy?: string; ru?: string; en?: string } | undefined => {
  const map: { hy?: string; ru?: string; en?: string } = {};
  if (hy.length > 0) {
    map.hy = hy;
  }
  if (ru.length > 0) {
    map.ru = ru;
  }
  if (en.length > 0) {
    map.en = en;
  }
  return Object.keys(map).length > 0 ? map : undefined;
};

const localeOrFallback = (translated: string | undefined, fallback: string | null): string =>
  translated ?? fallback ?? '';

/**
 * Builds the optional hy/ru/en payload from company copy fields.
 */
export const buildCompanyTranslations = (
  values: CompanyCopyFieldsValues,
): CompanyTranslationsInput | undefined => {
  const translations: CompanyTranslationsInput = {};
  const name = buildLocaleMap(values.nameHy, values.nameRu, values.nameEn);
  const shortDescription = buildLocaleMap(
    values.shortDescriptionHy,
    values.shortDescriptionRu,
    values.shortDescriptionEn,
  );
  const description = buildLocaleMap(
    values.descriptionHy,
    values.descriptionRu,
    values.descriptionEn,
  );

  if (name) {
    translations.name = name;
  }
  if (shortDescription) {
    translations.shortDescription = shortDescription;
  }
  if (description) {
    translations.description = description;
  }

  return Object.keys(translations).length > 0 ? translations : undefined;
};

/**
 * Canonical HY scalars plus translations for PATCH company copy.
 */
export const toCompanyCopyPatch = (
  values: CompanyCopyFieldsValues,
): {
  name: string;
  description: string | null;
  shortDescription: string | null;
  translations?: CompanyTranslationsInput;
} => {
  const translations = buildCompanyTranslations(values);
  return {
    name: values.nameHy,
    description: optionalText(values.descriptionHy) ?? null,
    shortDescription: optionalText(values.shortDescriptionHy) ?? null,
    ...(translations ? { translations } : {}),
  };
};

/**
 * Canonical HY scalars plus translations for create company copy.
 */
export const toCompanyCopyRequest = (
  values: CompanyCopyFieldsValues,
): {
  name: string;
  description?: string;
  shortDescription?: string;
  translations?: CompanyTranslationsInput;
} => {
  const patch = toCompanyCopyPatch(values);
  return {
    name: patch.name,
    ...(patch.description ? { description: patch.description } : {}),
    ...(patch.shortDescription ? { shortDescription: patch.shortDescription } : {}),
    ...(patch.translations ? { translations: patch.translations } : {}),
  };
};

/**
 * Hydrates copy fields from an admin company detail response.
 */
export const companyCopyDefaultsFrom = (company: CompanyResponse): CompanyCopyFieldsValues => {
  const translations = company.translations;
  return {
    ...emptyCompanyCopyValues(),
    nameHy: localeOrFallback(translations?.name?.hy, company.name),
    nameRu: translations?.name?.ru ?? '',
    nameEn: translations?.name?.en ?? '',
    shortDescriptionHy: localeOrFallback(
      translations?.shortDescription?.hy,
      company.shortDescription,
    ),
    shortDescriptionRu: translations?.shortDescription?.ru ?? '',
    shortDescriptionEn: translations?.shortDescription?.en ?? '',
    descriptionHy: localeOrFallback(translations?.description?.hy, company.description),
    descriptionRu: translations?.description?.ru ?? '',
    descriptionEn: translations?.description?.en ?? '',
  };
};
