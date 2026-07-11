import type { Session } from 'next-auth';

import { prisma } from '@toonexpo/db';

import { auth } from '@/auth';

export type BuilderSessionContext = {
  session: Session;
  companyId: string;
  companySlug: string;
  companyName: string;
};

/**
 * Returns builder session context when the caller is a BUILDER with company
 * membership; otherwise null. Server actions and portal routes must use this
 * instead of layout guards, which do not run for actions.
 *
 * v1 binds to the earliest company membership (deterministic). A company
 * switcher is planned for a later release.
 */
export async function assertBuilderSession(): Promise<BuilderSessionContext | null> {
  const session = await auth();
  if (!session?.user || session.user.role !== 'BUILDER') {
    return null;
  }

  const membership = await prisma.companyMember.findFirst({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'asc' },
    select: {
      company: {
        select: { id: true, slug: true, name: true },
      },
    },
  });

  if (!membership) {
    return null;
  }

  return {
    session,
    companyId: membership.company.id,
    companySlug: membership.company.slug,
    companyName: membership.company.name,
  };
}
