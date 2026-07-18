import type { PrismaClient } from "@toonexpo/db";

import { loadTranslations } from "../../catalog/utils/load-translations.js";
import {
  TRANSLATION_ENTITY,
  type TranslationRow,
} from "../../catalog/utils/resolve-translation.js";

type EntityIdGroups = {
  companyIds: string[];
  projectIds: string[];
};

/**
 * Loads company and project translation rows for exhibition public surfaces.
 */
export const loadEntityTranslations = async (
  db: PrismaClient,
  groups: EntityIdGroups,
): Promise<TranslationRow[]> => {
  const [companyRows, projectRows] = await Promise.all([
    loadTranslations(db, TRANSLATION_ENTITY.company, groups.companyIds),
    loadTranslations(db, TRANSLATION_ENTITY.project, groups.projectIds),
  ]);

  return [...companyRows, ...projectRows];
};
