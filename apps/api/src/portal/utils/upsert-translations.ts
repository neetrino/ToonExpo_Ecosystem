import type { Prisma } from "@toonexpo/db";
import { SUPPORTED_LOCALES, type SupportedLocale } from "@toonexpo/shared";

import type { LocaleTextMap } from "@toonexpo/contracts";

import {
  TRANSLATION_FIELD,
  type TranslationEntityType,
  type TranslationFieldName,
} from "../../catalog/utils/resolve-translation.js";

type TranslationClient = {
  translation: {
    upsert: (args: {
      where: Prisma.TranslationWhereUniqueInput;
      create: Prisma.TranslationCreateInput;
      update: Prisma.TranslationUpdateInput;
    }) => Promise<unknown>;
  };
};

export type TranslationFieldPayload = Partial<
  Record<TranslationFieldName, LocaleTextMap | undefined>
>;

const isSupportedLocale = (value: string): value is SupportedLocale =>
  (SUPPORTED_LOCALES as readonly string[]).includes(value);

/**
 * Upserts Translation rows for the given entity fields and locales.
 */
export const upsertTranslations = async (
  db: TranslationClient,
  params: {
    entityType: TranslationEntityType;
    entityId: string;
    fields: TranslationFieldPayload;
    updatedByUserId: string;
  },
): Promise<void> => {
  const operations: Array<Promise<unknown>> = [];

  for (const [fieldName, locales] of Object.entries(params.fields)) {
    if (!locales || !isTranslationField(fieldName)) {
      continue;
    }

    for (const [locale, value] of Object.entries(locales)) {
      if (!isSupportedLocale(locale) || value === undefined) {
        continue;
      }

      operations.push(
        db.translation.upsert({
          where: {
            entityType_entityId_fieldName_locale: {
              entityType: params.entityType,
              entityId: params.entityId,
              fieldName,
              locale,
            },
          },
          create: {
            entityType: params.entityType,
            entityId: params.entityId,
            fieldName,
            locale,
            value,
            updatedByUserId: params.updatedByUserId,
          },
          update: {
            value,
            updatedByUserId: params.updatedByUserId,
          },
        }),
      );
    }
  }

  if (operations.length > 0) {
    await Promise.all(operations);
  }
};

const isTranslationField = (value: string): value is TranslationFieldName =>
  Object.values(TRANSLATION_FIELD).includes(value as TranslationFieldName);
