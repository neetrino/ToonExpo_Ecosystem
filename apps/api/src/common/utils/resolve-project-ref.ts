import type { Prisma } from "@toonexpo/db";

import type { PrismaService } from "../../prisma/prisma.service.js";

/**
 * Resolves a project by primary id or globally unique slug.
 */
export const findProjectByRef = async <S extends Prisma.ProjectSelect>(
  prisma: PrismaService,
  ref: string,
  select: S,
): Promise<Prisma.ProjectGetPayload<{ select: S }> | null> => {
  const byId = await prisma.db.project.findUnique({
    where: { id: ref },
    select,
  });
  if (byId) {
    return byId;
  }
  return prisma.db.project.findUnique({
    where: { slug: ref },
    select,
  });
};

export const projectRefOrFilter = (ref: string): Prisma.ProjectWhereInput => ({
  OR: [{ id: ref }, { slug: ref }],
});
