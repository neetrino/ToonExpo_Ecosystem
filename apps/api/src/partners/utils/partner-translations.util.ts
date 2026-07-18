import type { PartnerOfferTranslationsInput, PartnerProfileTranslationsInput } from "@toonexpo/contracts";

import {
  TRANSLATION_ENTITY,
  TRANSLATION_FIELD,
} from "../../catalog/utils/resolve-translation.js";
import { upsertTranslations } from "../../portal/utils/upsert-translations.js";
import type { PrismaService } from "../../prisma/prisma.service.js";

/**
 * Upserts partner profile localized fields.
 */
export const upsertPartnerProfileTranslations = async (
  db: PrismaService["db"],
  partnerId: string,
  userId: string,
  translations?: PartnerProfileTranslationsInput,
): Promise<void> => {
  if (!translations) {
    return;
  }

  await upsertTranslations(db, {
    entityType: TRANSLATION_ENTITY.partnerCompany,
    entityId: partnerId,
    fields: {
      ...(translations.shortDescription
        ? { [TRANSLATION_FIELD.shortDescription]: translations.shortDescription }
        : {}),
      ...(translations.fullDescription
        ? { [TRANSLATION_FIELD.fullDescription]: translations.fullDescription }
        : {}),
    },
    updatedByUserId: userId,
  });
};

/**
 * Upserts partner offer localized fields.
 */
export const upsertPartnerOfferTranslations = async (
  db: PrismaService["db"],
  offerId: string,
  userId: string,
  translations?: PartnerOfferTranslationsInput,
): Promise<void> => {
  if (!translations) {
    return;
  }

  await upsertTranslations(db, {
    entityType: TRANSLATION_ENTITY.partnerOffer,
    entityId: offerId,
    fields: {
      ...(translations.title
        ? { [TRANSLATION_FIELD.title]: translations.title }
        : {}),
      ...(translations.description
        ? { [TRANSLATION_FIELD.description]: translations.description }
        : {}),
    },
    updatedByUserId: userId,
  });
};
