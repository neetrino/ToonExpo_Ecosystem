import type { PrismaClient } from '../src/index.js';
import { buildSeedTranslations, type SeedTranslation } from './seed-translations.js';

export const upsertSeedTranslations = async (prisma: PrismaClient): Promise<SeedTranslation[]> => {
  const translations = buildSeedTranslations();
  for (const row of translations) {
    await prisma.translation.upsert({
      where: { id: row.id },
      create: {
        id: row.id,
        entityType: row.entityType,
        entityId: row.entityId,
        fieldName: row.fieldName,
        locale: row.locale,
        value: row.value,
      },
      update: {
        entityType: row.entityType,
        entityId: row.entityId,
        fieldName: row.fieldName,
        locale: row.locale,
        value: row.value,
      },
    });
  }
  return translations;
};
