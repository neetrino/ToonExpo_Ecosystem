import type { CompanyTranslationsInput } from '@toonexpo/contracts';

import { loadTranslations } from '../../catalog/utils/load-translations.js';
import {
  TRANSLATION_ENTITY,
  TRANSLATION_FIELD,
} from '../../catalog/utils/resolve-translation.js';
import { groupPortalTranslations } from '../../portal/utils/group-translations.js';
import {
  upsertTranslations,
  type TranslationFieldPayload,
} from '../../portal/utils/upsert-translations.js';
import type { PrismaService } from '../../prisma/prisma.service.js';

const COMPANY_TRANSLATION_FIELDS = [
  TRANSLATION_FIELD.name,
  TRANSLATION_FIELD.shortDescription,
  TRANSLATION_FIELD.description,
] as const;

type TranslationDb = PrismaService['db'];

const toCompanyTranslationFields = (
  translations: CompanyTranslationsInput,
): TranslationFieldPayload => ({
  ...(translations.name ? { [TRANSLATION_FIELD.name]: translations.name } : {}),
  ...(translations.shortDescription
    ? { [TRANSLATION_FIELD.shortDescription]: translations.shortDescription }
    : {}),
  ...(translations.description
    ? { [TRANSLATION_FIELD.description]: translations.description }
    : {}),
});

const toCompanyTranslations = (
  grouped: ReturnType<typeof groupPortalTranslations>,
): CompanyTranslationsInput | undefined => {
  const translations: CompanyTranslationsInput = {
    ...(grouped.name ? { name: grouped.name } : {}),
    ...(grouped.shortDescription ? { shortDescription: grouped.shortDescription } : {}),
    ...(grouped.description ? { description: grouped.description } : {}),
  };
  return Object.keys(translations).length > 0 ? translations : undefined;
};

/**
 * Loads hy/ru/en company copy grouped for admin detail responses.
 */
export const loadGroupedCompanyTranslations = async (
  db: TranslationDb,
  companyId: string,
): Promise<CompanyTranslationsInput | undefined> => {
  const rows = await loadTranslations(db, TRANSLATION_ENTITY.company, [companyId]);
  return toCompanyTranslations(groupPortalTranslations(rows, COMPANY_TRANSLATION_FIELDS));
};

/**
 * Upserts company name and description translations.
 */
export const upsertCompanyTranslations = async (
  db: TranslationDb,
  companyId: string,
  userId: string,
  translations?: CompanyTranslationsInput,
): Promise<void> => {
  if (!translations) {
    return;
  }

  await upsertTranslations(db, {
    entityType: TRANSLATION_ENTITY.company,
    entityId: companyId,
    fields: toCompanyTranslationFields(translations),
    updatedByUserId: userId,
  });
};
