import type { ReadinessCategoryUpsertInput } from '@toonexpo/contracts';
import { prisma } from '@toonexpo/db';

import {
  type AdminMutationResult,
  UNIQUE_CONSTRAINT_ERROR,
} from './mutation-result';

export async function upsertReadinessCategory(
  input: ReadinessCategoryUpsertInput,
): Promise<AdminMutationResult<{ categoryId: string }>> {
  if (input.categoryId) {
    return updateCategory(input);
  }
  return createCategory(input);
}

async function createCategory(
  input: ReadinessCategoryUpsertInput,
): Promise<AdminMutationResult<{ categoryId: string }>> {
  const key = input.key;
  if (!key) {
    return { ok: false, errorKey: 'invalidInput' };
  }

  try {
    const created = await prisma.readinessCategory.create({
      data: {
        key,
        name: input.name,
        description: input.description ?? null,
        weight: input.weight ?? null,
        sortOrder: input.sortOrder,
        serviceCategoryKey: input.serviceCategoryKey ?? null,
        active: input.active,
      },
      select: { id: true },
    });
    return { ok: true, categoryId: created.id };
  } catch (error) {
    return mapUniqueKeyError(error);
  }
}

async function updateCategory(
  input: ReadinessCategoryUpsertInput,
): Promise<AdminMutationResult<{ categoryId: string }>> {
  const categoryId = input.categoryId as string;
  const existing = await prisma.readinessCategory.findUnique({
    where: { id: categoryId },
    select: { id: true },
  });
  if (!existing) {
    return { ok: false, errorKey: 'notFound' };
  }

  const updated = await prisma.readinessCategory.update({
    where: { id: categoryId },
    data: {
      name: input.name,
      description: input.description ?? null,
      weight: input.weight ?? null,
      sortOrder: input.sortOrder,
      serviceCategoryKey: input.serviceCategoryKey ?? null,
      active: input.active,
    },
    select: { id: true },
  });

  return { ok: true, categoryId: updated.id };
}

function mapUniqueKeyError(error: unknown): AdminMutationResult<{ categoryId: string }> {
  if (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code: unknown }).code === UNIQUE_CONSTRAINT_ERROR
  ) {
    return { ok: false, errorKey: 'keyTaken' };
  }
  throw error;
}
