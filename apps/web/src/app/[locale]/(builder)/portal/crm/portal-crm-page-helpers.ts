import type { DealStage, RequestSource } from '@toonexpo/domain';
import type { getTranslations } from 'next-intl/server';

import type { DealBoardColumn } from '@/lib/crm/deal-queries';
import {
  formatRelativeActivityAt,
  formatShortDate,
  isFollowUpOverdue,
} from '@/lib/crm/format-crm-dates';

import type { CrmDealCardData } from './crm-deal-card';
import type { DealDetail } from '@/lib/crm/deal-queries';
import type { SerializableDealDetail } from './sheets/deal-sheet';

const CRM_DEAL_STAGES = [
  'NEW_REQUEST',
  'ASSIGNED',
  'CONTACTED',
  'FOLLOW_UP_NEEDED',
  'APARTMENT_SELECTED',
  'RESERVED',
  'CONVERTED',
  'CLOSED',
  'LOST',
] as const satisfies readonly DealStage[];

const CRM_REQUEST_SOURCES = [
  'PROJECT_PAGE',
  'APARTMENT_PAGE',
  'BUILDER_QR_SCAN',
  'MANUAL_BUILDER_ENTRY',
  'EVENT_INTERACTION',
] as const satisfies readonly RequestSource[];

type CrmTranslations = Awaited<ReturnType<typeof getTranslations>>;

export function buildCrmStageLabels(tStages: CrmTranslations): Record<DealStage, string> {
  return Object.fromEntries(CRM_DEAL_STAGES.map((stage) => [stage, tStages(stage)])) as Record<
    DealStage,
    string
  >;
}

export function buildCrmSourceLabels(tSources: CrmTranslations): Record<RequestSource, string> {
  return Object.fromEntries(
    CRM_REQUEST_SOURCES.map((source) => [source, tSources(source)]),
  ) as Record<RequestSource, string>;
}

export function mapCrmDealCard(
  deal: DealBoardColumn['deals'][number],
  locale: string,
): CrmDealCardData {
  return {
    id: deal.id,
    stage: deal.stage,
    source: deal.source,
    contactName: deal.contactName,
    projectName: deal.projectName,
    apartmentCount: deal.apartmentCount,
    assigneeName: deal.assigneeName,
    lastActivityLabel: deal.lastActivityAt
      ? formatRelativeActivityAt(deal.lastActivityAt, locale)
      : null,
    isFollowUpOverdue: isFollowUpOverdue(deal.nextFollowUpAt),
  };
}

type BuildCrmWorkspaceLabelsParams = {
  t: CrmTranslations;
  tActivities: CrmTranslations;
  tApartmentStatus: CrmTranslations;
  stageLabels: Record<DealStage, string>;
  sourceLabels: Record<RequestSource, string>;
  dealDetail: SerializableDealDetail | null;
  locale: string;
};

export function buildCrmWorkspaceLabels({
  t,
  tActivities,
  tApartmentStatus,
  stageLabels,
  sourceLabels,
  dealDetail,
  locale,
}: BuildCrmWorkspaceLabelsParams) {
  const createdAtLabel = dealDetail ? formatShortDate(new Date(dealDetail.createdAt), locale) : '';

  return {
    title: t('title'),
    empty: t('empty'),
    newDeal: t('newDeal'),
    view: {
      board: t('view.board'),
      list: t('view.list'),
    },
    card: {
      unnamedContact: t('card.unnamedContact'),
      noProject: t('card.noProject'),
      noAssignee: t('card.noAssignee'),
      noActivity: t('card.noActivity'),
      apartmentCount: t.raw('card.apartmentCount'),
      source: sourceLabels,
    },
    list: {
      unnamedContact: t('card.unnamedContact'),
      noProject: t('card.noProject'),
      noAssignee: t('card.noAssignee'),
      noActivity: t('card.noActivity'),
      columns: {
        contact: t('list.columns.contact'),
        project: t('list.columns.project'),
        stage: t('list.columns.stage'),
        source: t('list.columns.source'),
        assignee: t('list.columns.assignee'),
        apartments: t('list.columns.apartments'),
        lastActivity: t('list.columns.lastActivity'),
      },
      stages: stageLabels,
      sources: sourceLabels,
    },
    dealSheet: {
      title: t('dealSheet.title'),
      unnamedContact: t('card.unnamedContact'),
      source: sourceLabels,
      createdAtLabel,
      contact: {
        title: t('dealSheet.contact.title'),
        phone: t('dealSheet.contact.phone'),
        email: t('dealSheet.contact.email'),
        buyerLinked: t('dealSheet.contact.buyerLinked'),
        message: t('dealSheet.contact.message'),
        noValue: t('dealSheet.noValue'),
      },
      apartments: {
        title: t('dealSheet.apartments.title'),
        empty: t('dealSheet.apartments.empty'),
        emptyHint: t('dealSheet.apartments.emptyHint'),
        link: t('dealSheet.apartments.link'),
        unlink: t('dealSheet.apartments.unlink'),
        project: t('dealSheet.apartments.project'),
        apartment: t('dealSheet.apartments.apartment'),
        noValue: t('dealSheet.noValue'),
        status: {
          AVAILABLE: tApartmentStatus('AVAILABLE'),
          RESERVED: tApartmentStatus('RESERVED'),
          SOLD: tApartmentStatus('SOLD'),
        },
        price: t('dealSheet.apartments.price'),
        priceAtRequest: t('dealSheet.apartments.priceAtRequest'),
      },
      activities: {
        title: t('dealSheet.activities.title'),
        empty: t('dealSheet.activities.empty'),
        comment: t('dealSheet.activities.comment'),
        followUp: t('dealSheet.activities.followUp'),
        submitComment: t('dealSheet.activities.submitComment'),
        submitFollowUp: t('dealSheet.activities.submitFollowUp'),
        nextFollowUpAt: t('dealSheet.activities.nextFollowUpAt'),
        dueAt: t('dealSheet.activities.dueAt'),
        markDone: t('dealSheet.activities.markDone'),
        markCancelled: t('dealSheet.activities.markCancelled'),
        types: {
          COMMENT: tActivities('COMMENT'),
          FOLLOW_UP: tActivities('FOLLOW_UP'),
          STATUS_CHANGE: tActivities('STATUS_CHANGE'),
        },
        statuses: {
          PLANNED: t('dealSheet.activities.statuses.PLANNED'),
          DONE: t('dealSheet.activities.statuses.DONE'),
          CANCELLED: t('dealSheet.activities.statuses.CANCELLED'),
        },
        noAuthor: t('dealSheet.activities.noAuthor'),
      },
    },
  };
}

export function toSerializableDealDetail(deal: DealDetail): SerializableDealDetail {
  return {
    id: deal.id,
    stage: deal.stage,
    source: deal.source,
    contactName: deal.contactName,
    contactPhone: deal.contactPhone,
    contactEmail: deal.contactEmail,
    hasBuyerLink: deal.hasBuyerLink,
    message: deal.message,
    projectId: deal.projectId,
    assigneeUserId: deal.assigneeUserId,
    createdAt: deal.createdAt.toISOString(),
    apartments: deal.apartments,
    activities: deal.activities.map((activity) => ({
      ...activity,
      dueAt: activity.dueAt?.toISOString() ?? null,
      createdAt: activity.createdAt.toISOString(),
    })),
  };
}
