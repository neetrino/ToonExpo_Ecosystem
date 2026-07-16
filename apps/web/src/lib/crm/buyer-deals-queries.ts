import { prisma } from '@toonexpo/db';
import type { RequestSource } from '@toonexpo/domain';

import { mapDealStageToBuyerStatus, type BuyerFacingStatus } from './buyer-facing-status';

export type BuyerDealRow = {
  id: string;
  companyName: string;
  projectName: string | null;
  status: BuyerFacingStatus;
  source: RequestSource;
  createdAt: Date;
  lastActivityAt: Date | null;
};

/** Deals owned by the authenticated buyer, newest activity first. */
export async function getBuyerDeals(buyerUserId: string): Promise<BuyerDealRow[]> {
  const rows = await prisma.deal.findMany({
    where: { buyerUserId },
    orderBy: [{ lastActivityAt: 'desc' }, { createdAt: 'desc' }],
    select: {
      id: true,
      stage: true,
      source: true,
      createdAt: true,
      lastActivityAt: true,
      company: { select: { name: true } },
      project: { select: { name: true } },
    },
  });

  return rows.map((row) => ({
    id: row.id,
    companyName: row.company.name,
    projectName: row.project?.name ?? null,
    status: mapDealStageToBuyerStatus(row.stage),
    source: row.source,
    createdAt: row.createdAt,
    lastActivityAt: row.lastActivityAt,
  }));
}
