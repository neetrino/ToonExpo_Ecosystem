import { prisma } from '@toonexpo/db';
import type { PlatformRole } from '@toonexpo/domain';

import { hashQrToken } from './token';

export type BuyerContactSnapshot = {
  userId: string;
  name: string | null;
  email: string;
  phone: string | null;
};

export type BuilderProjectOption = {
  id: string;
  name: string;
};

export type QrResolveInvalid = { kind: 'invalid' };

export type QrResolveOwner = { kind: 'owner'; qrCodeId: string };

export type QrResolveBuilder = {
  kind: 'builder';
  qrCodeId: string;
  buyer: BuyerContactSnapshot;
  projects: BuilderProjectOption[];
};

/** Valid QR, no PII — anonymous / partner / other non-builder roles. */
export type QrResolveLimited = { kind: 'limited'; qrCodeId: string };

/**
 * Entrance staff check-in is out of this sprint; purpose enum already has
 * ENTRANCE_CHECKIN. Treat as limited until the check-in UI ships.
 */
export type QrResolveResult =
  QrResolveInvalid | QrResolveOwner | QrResolveBuilder | QrResolveLimited;

type SessionContext = {
  userId?: string;
  role?: PlatformRole;
  companyId?: string;
};

type ActiveQrRow = {
  id: string;
  buyerProfile: {
    userId: string;
    user: {
      id: string;
      name: string | null;
      email: string;
      phone: string | null;
    };
  };
};

async function findActiveQrByToken(token: string): Promise<ActiveQrRow | null> {
  const tokenHash = hashQrToken(token);
  const row = await prisma.qrCode.findFirst({
    where: { tokenHash, revokedAt: null },
    select: {
      id: true,
      buyerProfile: {
        select: {
          userId: true,
          user: { select: { id: true, name: true, email: true, phone: true } },
        },
      },
    },
  });
  return row;
}

async function loadCompanyProjects(companyId: string): Promise<BuilderProjectOption[]> {
  return prisma.project.findMany({
    where: { companyId, status: { in: ['PUBLISHED', 'DRAFT'] } },
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  });
}

/**
 * Resolves a QR token into a role-narrowed view.
 * Revoked and unknown tokens both map to `invalid` (no enumeration).
 */
export async function resolveQrScan(
  token: string,
  session: SessionContext,
): Promise<QrResolveResult> {
  if (!token.trim()) {
    return { kind: 'invalid' };
  }

  const qr = await findActiveQrByToken(token);
  if (!qr) {
    return { kind: 'invalid' };
  }

  if (session.userId && session.userId === qr.buyerProfile.userId) {
    return { kind: 'owner', qrCodeId: qr.id };
  }

  if (session.role === 'BUILDER' && session.companyId) {
    const projects = await loadCompanyProjects(session.companyId);
    return {
      kind: 'builder',
      qrCodeId: qr.id,
      buyer: {
        userId: qr.buyerProfile.user.id,
        name: qr.buyerProfile.user.name,
        email: qr.buyerProfile.user.email,
        phone: qr.buyerProfile.user.phone,
      },
      projects,
    };
  }

  // ENTRANCE_STAFF → limited until check-in sprint; anonymous/partner → limited.
  return { kind: 'limited', qrCodeId: qr.id };
}

/** Public shape helpers for tests — strips PII for non-builder branches. */
export function toPublicResolveShape(result: QrResolveResult): {
  kind: QrResolveResult['kind'];
  hasBuyerPii: boolean;
} {
  if (result.kind === 'builder') {
    return { kind: 'builder', hasBuyerPii: true };
  }
  return { kind: result.kind, hasBuyerPii: false };
}
