import { prisma } from '@toonexpo/db';
import {
  DEAL_STAGES,
  type ApartmentStatus,
  type DealStage,
  type RequestSource,
} from '@toonexpo/domain';

import { DEAL_DETAIL_ACTIVITY_LIMIT } from './constants';

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

export type DealBoardColumn = {
  stage: DealStage;
  deals: DealBoardCard[];
};

export type DealDetailApartment = {
  apartmentId: string;
  code: string;
  status: ApartmentStatus;
  priceAmd: number | null;
  floorName: string;
  buildingName: string;
};

export type DealDetailActivity = {
  id: string;
  type: 'COMMENT' | 'FOLLOW_UP' | 'STATUS_CHANGE';
  body: string;
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

/** Company-scoped CRM board: deals grouped by pipeline stage. */
export async function getCompanyDealsBoard(companyId: string): Promise<DealBoardColumn[]> {
  const rows = await prisma.deal.findMany({
    where: { companyId },
    orderBy: [{ lastActivityAt: 'desc' }, { createdAt: 'desc' }],
    select: {
      id: true,
      stage: true,
      source: true,
      contactName: true,
      lastActivityAt: true,
      nextFollowUpAt: true,
      project: { select: { name: true } },
      assignedUser: { select: { name: true } },
      _count: { select: { apartments: true } },
    },
  });

  const byStage = new Map<DealStage, DealBoardCard[]>(DEAL_STAGES.map((stage) => [stage, []]));

  for (const row of rows) {
    const column = byStage.get(row.stage);
    if (!column) {
      continue;
    }
    column.push({
      id: row.id,
      stage: row.stage,
      source: row.source,
      contactName: row.contactName,
      projectName: row.project?.name ?? null,
      apartmentCount: row._count.apartments,
      assigneeName: row.assignedUser?.name ?? null,
      lastActivityAt: row.lastActivityAt,
      nextFollowUpAt: row.nextFollowUpAt,
    });
  }

  return DEAL_STAGES.map((stage) => ({
    stage,
    deals: byStage.get(stage) ?? [],
  }));
}

/** Company-scoped deal detail with apartments and latest activities. */
export async function getCompanyDealDetail(
  companyId: string,
  dealId: string,
): Promise<DealDetail | null> {
  const deal = await prisma.deal.findFirst({
    where: { id: dealId, companyId },
    select: {
      id: true,
      stage: true,
      source: true,
      title: true,
      message: true,
      contactName: true,
      contactPhone: true,
      contactEmail: true,
      buyerUserId: true,
      projectId: true,
      lastActivityAt: true,
      nextFollowUpAt: true,
      createdAt: true,
      assignedUserId: true,
      project: { select: { name: true } },
      assignedUser: { select: { name: true } },
      apartments: {
        select: {
          apartmentId: true,
          apartment: {
            select: {
              code: true,
              status: true,
              priceAmd: true,
              floor: {
                select: {
                  name: true,
                  building: { select: { name: true } },
                },
              },
            },
          },
        },
      },
      activities: {
        orderBy: { createdAt: 'desc' },
        take: DEAL_DETAIL_ACTIVITY_LIMIT,
        select: {
          id: true,
          type: true,
          body: true,
          createdAt: true,
          authorUser: { select: { name: true } },
        },
      },
    },
  });

  if (!deal) {
    return null;
  }

  return {
    id: deal.id,
    stage: deal.stage,
    source: deal.source,
    title: deal.title,
    message: deal.message,
    contactName: deal.contactName,
    contactPhone: deal.contactPhone,
    contactEmail: deal.contactEmail,
    hasBuyerLink: deal.buyerUserId !== null,
    projectId: deal.projectId,
    projectName: deal.project?.name ?? null,
    assigneeUserId: deal.assignedUserId,
    assigneeName: deal.assignedUser?.name ?? null,
    lastActivityAt: deal.lastActivityAt,
    nextFollowUpAt: deal.nextFollowUpAt,
    createdAt: deal.createdAt,
    apartments: deal.apartments.map((link) => ({
      apartmentId: link.apartmentId,
      code: link.apartment.code,
      status: link.apartment.status,
      priceAmd: link.apartment.priceAmd,
      floorName: link.apartment.floor.name,
      buildingName: link.apartment.floor.building.name,
    })),
    activities: deal.activities.map((activity) => ({
      id: activity.id,
      type: activity.type,
      body: activity.body,
      createdAt: activity.createdAt,
      authorName: activity.authorUser?.name ?? null,
    })),
  };
}
