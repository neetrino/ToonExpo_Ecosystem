import {
  type ActivityStatus,
  type ApartmentStatus,
  type DealStage,
  type RequestSource,
} from '@toonexpo/domain';

import { getApiErrorKey } from '@/lib/api/errors';
import { apiRequest } from '@/lib/api/client';

import { mapDealDetailRow } from './deal-detail-mapper';

export type DealBoardCard = {
  id: string;
  stage: DealStage;
  source: RequestSource;
  contactName: string | null;
  projectName: string | null;
  apartmentCount: number;
  assigneeName: string | null;
  lastActivityAt: Date | null;
  nextFollowUpAt: Date | null;
};

export type DealBoardColumn = { stage: DealStage; deals: DealBoardCard[] };

export type DealDetailApartment = {
  apartmentId: string;
  code: string;
  status: ApartmentStatus;
  priceAmd: number | null;
  priceAmdSnapshot: number | null;
  statusSnapshot: ApartmentStatus | null;
  floorName: string;
  buildingName: string;
};

export type DealDetailActivity = {
  id: string;
  type: 'COMMENT' | 'FOLLOW_UP' | 'STATUS_CHANGE';
  body: string;
  status: ActivityStatus | null;
  dueAt: Date | null;
  createdAt: Date;
  authorName: string | null;
};

export type DealDetail = {
  id: string;
  stage: DealStage;
  source: RequestSource;
  title: string | null;
  message: string | null;
  contactName: string | null;
  contactPhone: string | null;
  contactEmail: string | null;
  hasBuyerLink: boolean;
  projectId: string | null;
  projectName: string | null;
  assigneeUserId: string | null;
  assigneeName: string | null;
  lastActivityAt: Date | null;
  nextFollowUpAt: Date | null;
  createdAt: Date;
  apartments: DealDetailApartment[];
  activities: DealDetailActivity[];
};

type WireBoardCard = Omit<DealBoardCard, 'lastActivityAt' | 'nextFollowUpAt'> & {
  lastActivityAt: string | null;
  nextFollowUpAt: string | null;
};

export async function getCompanyDealsBoard(companyId: string): Promise<DealBoardColumn[]> {
  void companyId;
  const columns =
    await apiRequest<Array<{ stage: DealStage; deals: WireBoardCard[] }>>('/crm/board');
  return columns.map((column) => ({
    ...column,
    deals: column.deals.map((deal) => ({
      ...deal,
      lastActivityAt: deal.lastActivityAt ? new Date(deal.lastActivityAt) : null,
      nextFollowUpAt: deal.nextFollowUpAt ? new Date(deal.nextFollowUpAt) : null,
    })),
  }));
}

export async function getCompanyDealDetail(
  companyId: string,
  dealId: string,
): Promise<DealDetail | null> {
  void companyId;
  try {
    const row = await apiRequest<Parameters<typeof mapDealDetailRow>[0]>(
      `/crm/deals/${encodeURIComponent(dealId)}`,
    );
    return mapDealDetailRow({
      ...row,
      createdAt: new Date(row.createdAt),
      lastActivityAt: row.lastActivityAt ? new Date(row.lastActivityAt) : null,
      nextFollowUpAt: row.nextFollowUpAt ? new Date(row.nextFollowUpAt) : null,
      activities: row.activities.map((activity) => ({
        ...activity,
        dueAt: activity.dueAt ? new Date(activity.dueAt) : null,
        createdAt: new Date(activity.createdAt),
      })),
    });
  } catch (error) {
    if (getApiErrorKey(error) === 'notFound') return null;
    throw error;
  }
}
