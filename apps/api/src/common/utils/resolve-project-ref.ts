import type { Prisma } from "@toonexpo/db";

import type { PrismaService } from "../../prisma/prisma.service.js";

const MAX_URI_DECODE_PASSES = 2;

const decodeOnce = (value: string): string => {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};

/**
 * Unwraps id/slug path params that may still be percent-encoded.
 */
export const normalizeProjectRef = (ref: string): string => {
  let current = ref;
  for (let pass = 0; pass < MAX_URI_DECODE_PASSES; pass += 1) {
    const next = decodeOnce(current);
    if (next === current) {
      return current;
    }
    current = next;
  }
  return current;
};

/**
 * Resolves a project by primary id or globally unique slug.
 */
export const findProjectByRef = async <S extends Prisma.ProjectSelect>(
  prisma: PrismaService,
  ref: string,
  select: S,
): Promise<Prisma.ProjectGetPayload<{ select: S }> | null> => {
  const normalized = normalizeProjectRef(ref);
  const byId = await prisma.db.project.findUnique({
    where: { id: normalized },
    select,
  });
  if (byId) {
    return byId;
  }
  return prisma.db.project.findUnique({
    where: { slug: normalized },
    select,
  });
};

export const projectRefOrFilter = (ref: string): Prisma.ProjectWhereInput => {
  const normalized = normalizeProjectRef(ref);
  return {
    OR: [{ id: normalized }, { slug: normalized }],
  };
};
