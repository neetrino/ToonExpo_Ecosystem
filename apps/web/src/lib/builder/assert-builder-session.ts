import type { Session } from 'next-auth';

import { prisma } from '@toonexpo/db';

import { auth } from '@/auth';
import { readActiveCompanyId } from '@/lib/builder/active-company-cookie';

export type BuilderSessionContext = {
  session: Session;
  companyId: string;
  companySlug: string;
  companyName: string;
  /** True when a BIGPROJECTS_ADMIN is operating via active-company cookie. */
  actingOnBehalf: boolean;
  /** Builder membership count; 0 for admin acting-on-behalf. */
  membershipCount: number;
};

type CompanyRef = {
  id: string;
  slug: string;
  name: string;
};

/**
 * Returns builder-portal session context when the caller may operate as a
 * builder company: BUILDER (membership-scoped) or BIGPROJECTS_ADMIN with a
 * valid active-company cookie. Other roles → null.
 *
 * Server actions and portal routes must use this instead of layout guards.
 */
export async function assertBuilderSession(): Promise<BuilderSessionContext | null> {
  const session = await auth();
  if (!session?.user) {
    return null;
  }

  if (session.user.role === 'BUILDER') {
    return resolveBuilderContext(session);
  }

  if (session.user.role === 'BIGPROJECTS_ADMIN') {
    return resolveAdminActingContext(session);
  }

  return null;
}

async function resolveBuilderContext(session: Session): Promise<BuilderSessionContext | null> {
  const memberships = await prisma.companyMember.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'asc' },
    select: {
      company: {
        select: { id: true, slug: true, name: true },
      },
    },
  });

  if (memberships.length === 0) {
    return null;
  }

  const cookieCompanyId = await readActiveCompanyId();
  const matched = cookieCompanyId
    ? memberships.find((row) => row.company.id === cookieCompanyId)
    : undefined;
  const company = matched?.company ?? memberships[0]!.company;

  return toContext(session, company, {
    actingOnBehalf: false,
    membershipCount: memberships.length,
  });
}

async function resolveAdminActingContext(session: Session): Promise<BuilderSessionContext | null> {
  const cookieCompanyId = await readActiveCompanyId();
  if (!cookieCompanyId) {
    return null;
  }

  const company = await prisma.company.findUnique({
    where: { id: cookieCompanyId },
    select: { id: true, slug: true, name: true },
  });

  if (!company) {
    return null;
  }

  return toContext(session, company, {
    actingOnBehalf: true,
    membershipCount: 0,
  });
}

function toContext(
  session: Session,
  company: CompanyRef,
  flags: { actingOnBehalf: boolean; membershipCount: number },
): BuilderSessionContext {
  return {
    session,
    companyId: company.id,
    companySlug: company.slug,
    companyName: company.name,
    actingOnBehalf: flags.actingOnBehalf,
    membershipCount: flags.membershipCount,
  };
}
