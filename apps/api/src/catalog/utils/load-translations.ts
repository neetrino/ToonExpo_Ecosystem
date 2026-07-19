import type { Prisma } from "@toonexpo/db";

import type { TranslationRow } from "../utils/resolve-translation.js";

type TranslationClient = {
  translation: {
    findMany: (args: {
      where: Prisma.TranslationWhereInput;
    }) => Promise<TranslationRow[]>;
  };
};

/**
 * Loads translation rows for the given entity ids (any field/locale).
 */
export const loadTranslations = async (
  db: TranslationClient,
  entityType: string,
  entityIds: string[],
): Promise<TranslationRow[]> => {
  if (entityIds.length === 0) {
    return [];
  }

  return db.translation.findMany({
    where: {
      entityType,
      entityId: { in: entityIds },
    },
  });
};
