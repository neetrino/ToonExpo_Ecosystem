import type { AuthSession } from '@toonexpo/contracts';
import type { PartnerType, PublicationStatus } from '@toonexpo/domain';
import { prisma } from '@toonexpo/db';

import { auth } from '@/auth';

export type PartnerSessionPartner = {
  id: string;
  companyId: string;
  name: string;
  slug: string;
  type: PartnerType;
  logoUrl: string | null;
  description: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  serviceCategories: string[];
  status: PublicationStatus;
};

export type PartnerSessionContext = {
  session: AuthSession;
  partnerId: string;
  companyId: string;
  partner: PartnerSessionPartner;
};

/**
 * Returns partner-cabinet session context when the caller is a PARTNER user
 * whose company membership links to a Partner via Partner.companyId.
 * Other roles or unlinked partners → null. Never cross-tenant.
 */
export async function assertPartnerSession(): Promise<PartnerSessionContext | null> {
  const session = await auth();
  if (!session?.user || session.user.role !== 'PARTNER') {
    return null;
  }

  const membership = await prisma.companyMember.findFirst({
    where: { userId: session.user.id, role: 'PARTNER' },
    orderBy: { createdAt: 'asc' },
    select: { companyId: true },
  });

  if (!membership) {
    return null;
  }

  const partner = await prisma.partner.findUnique({
    where: { companyId: membership.companyId },
    select: {
      id: true,
      companyId: true,
      name: true,
      slug: true,
      type: true,
      logoUrl: true,
      description: true,
      phone: true,
      email: true,
      website: true,
      serviceCategories: true,
      status: true,
    },
  });

  if (!partner?.companyId) {
    return null;
  }

  return {
    session,
    partnerId: partner.id,
    companyId: partner.companyId,
    partner: {
      ...partner,
      companyId: partner.companyId,
    },
  };
}
