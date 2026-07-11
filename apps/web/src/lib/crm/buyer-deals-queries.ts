import { prisma } from '@toonexpo/db';
import type { DealStage, RequestSource } from '@toonexpo/domain';

export type BuyerDealRow = {
  id: string;
  companyName: string;
  projectName: string | null;
  stage: DealStage;
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
    stage: row.stage,
    source: row.source,
    createdAt: row.createdAt,
    lastActivityAt: row.lastActivityAt,
  }));
}
