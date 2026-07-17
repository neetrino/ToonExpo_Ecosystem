import type { RequestSource } from '@toonexpo/domain';

import { apiRequest } from '@/lib/api/client';

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
  void buyerUserId;
  const rows = await apiRequest<
    Array<{
      id: string;
      stage: Parameters<typeof mapDealStageToBuyerStatus>[0];
      source: RequestSource;
      createdAt: string;
      lastActivityAt: string | null;
      company: { name: string };
      project: { name: string } | null;
    }>
  >('/crm/buyer/deals');

  return rows.map((row) => ({
    id: row.id,
    companyName: row.company.name,
    projectName: row.project?.name ?? null,
    status: mapDealStageToBuyerStatus(row.stage),
    source: row.source,
    createdAt: new Date(row.createdAt),
    lastActivityAt: row.lastActivityAt ? new Date(row.lastActivityAt) : null,
  }));
}
