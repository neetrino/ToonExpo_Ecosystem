import type { DealDetail, DealDetailActivity, DealDetailApartment } from './deal-queries';

type DealDetailRow = {
  id: string;
  stage: DealDetail['stage'];
  source: DealDetail['source'];
  title: string | null;
  message: string | null;
  contactName: string | null;
  contactPhone: string | null;
  contactEmail: string | null;
  buyerUserId: string | null;
  projectId: string | null;
  lastActivityAt: Date | null;
  nextFollowUpAt: Date | null;
  createdAt: Date;
  assignedUserId: string | null;
  project: { name: string } | null;
  assignedUser: { name: string | null } | null;
  apartments: Array<{
    apartmentId: string;
    priceAmdSnapshot: number | null;
    statusSnapshot: DealDetailApartment['status'];
    apartment: {
      code: string;
      status: DealDetailApartment['status'];
      priceAmd: number | null;
      floor: {
        name: string;
        building: { name: string };
      };
    };
  }>;
  activities: Array<{
    id: string;
    type: DealDetailActivity['type'];
    body: string;
    status: DealDetailActivity['status'];
    dueAt: Date | null;
    createdAt: Date;
    authorUser: { name: string | null } | null;
  }>;
};

export function mapDealDetailRow(deal: DealDetailRow): DealDetail {
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
      priceAmdSnapshot: link.priceAmdSnapshot,
      statusSnapshot: link.statusSnapshot,
      floorName: link.apartment.floor.name,
      buildingName: link.apartment.floor.building.name,
    })),
    activities: deal.activities.map((activity) => ({
      id: activity.id,
      type: activity.type,
      body: activity.body,
      status: activity.status,
      dueAt: activity.dueAt,
      createdAt: activity.createdAt,
      authorName: activity.authorUser?.name ?? null,
    })),
  };
}
