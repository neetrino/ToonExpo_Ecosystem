import type { DealStage, RequestSource } from '@toonexpo/domain';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { assertBuilderSession } from '@/lib/builder/assert-builder-session';
import { loadCompanyProjects } from '@/lib/builder/queries';
import { loadApartmentLinkOptions } from '@/lib/crm/apartment-link-queries';
import { getCompanyDealDetail, getCompanyDealsBoard } from '@/lib/crm/deal-queries';
import {
  formatRelativeActivityAt,
  formatShortDate,
  isFollowUpOverdue,
} from '@/lib/crm/format-crm-dates';
import { loadCompanyMembers } from '@/lib/crm/member-queries';

import { CrmWorkspace } from './crm-workspace';
import type { CrmDealCardData } from './crm-deal-card';
import type { SerializableDealDetail } from './sheets/deal-sheet';

const CRM_LIST_VIEW = 'list';

type PortalCrmPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ view?: string; deal?: string }>;
};

function parseView(rawView: string | undefined): 'board' | 'list' {
  return rawView === CRM_LIST_VIEW ? 'list' : 'board';
}

function toSerializableDealDetail(
  deal: NonNullable<Awaited<ReturnType<typeof getCompanyDealDetail>>>,
): SerializableDealDetail {
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
      createdAt: activity.createdAt.toISOString(),
    })),
  };
}

export default async function PortalCrmPage({ params, searchParams }: PortalCrmPageProps) {
  const { locale } = await params;
  const { view: rawView, deal: dealId } = await searchParams;
  setRequestLocale(locale);

  const builderContext = await assertBuilderSession();
  if (!builderContext) {
    return null;
  }

  const view = parseView(rawView);
  const companyId = builderContext.companyId;

  const [t, tStages, tSources, tActivities, tApartmentStatus, columns, projects, members] =
    await Promise.all([
      getTranslations('portal.crm'),
      getTranslations('portal.crm.stages'),
      getTranslations('portal.crm.sources'),
      getTranslations('portal.crm.activityTypes'),
      getTranslations('portal.apartmentStatus'),
      getCompanyDealsBoard(companyId),
      loadCompanyProjects(companyId),
      loadCompanyMembers(companyId),
    ]);

  const dealDetailRaw = dealId ? await getCompanyDealDetail(companyId, dealId) : null;
  const dealDetail = dealDetailRaw ? toSerializableDealDetail(dealDetailRaw) : null;
  const apartmentGroups = dealDetail
    ? await loadApartmentLinkOptions(companyId, dealDetail.projectId)
    : [];

  const stageLabels = Object.fromEntries(
    (
      [
        'NEW_REQUEST',
        'ASSIGNED',
        'CONTACTED',
        'FOLLOW_UP_NEEDED',
        'APARTMENT_SELECTED',
        'RESERVED',
        'CONVERTED',
        'CLOSED',
        'LOST',
      ] as const
    ).map((stage) => [stage, tStages(stage)]),
  ) as Record<DealStage, string>;

  const sourceLabels = Object.fromEntries(
    (
      [
        'PROJECT_PAGE',
        'APARTMENT_PAGE',
        'BUILDER_QR_SCAN',
        'MANUAL_BUILDER_ENTRY',
        'EVENT_INTERACTION',
      ] as const
    ).map((source) => [source, tSources(source)]),
  ) as Record<RequestSource, string>;

  const mapDeal = (deal: (typeof columns)[number]['deals'][number]): CrmDealCardData => ({
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
  });

  const boardColumns = columns.map((column) => ({
    stage: column.stage,
    stageLabel: stageLabels[column.stage],
    deals: column.deals.map(mapDeal),
  }));

  const listRows = columns.flatMap((column) => column.deals.map(mapDeal));

  const createdAtLabel = dealDetail ? formatShortDate(new Date(dealDetail.createdAt), locale) : '';

  return (
    <CrmWorkspace
      locale={locale}
      view={view}
      boardColumns={boardColumns}
      listRows={listRows}
      dealDetail={dealDetail}
      members={members}
      apartmentGroups={apartmentGroups}
      projects={projects.map((project) => ({ id: project.id, name: project.name }))}
      labels={{
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
          apartmentCount: t('card.apartmentCount'),
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
          },
          activities: {
            title: t('dealSheet.activities.title'),
            empty: t('dealSheet.activities.empty'),
            comment: t('dealSheet.activities.comment'),
            followUp: t('dealSheet.activities.followUp'),
            submitComment: t('dealSheet.activities.submitComment'),
            submitFollowUp: t('dealSheet.activities.submitFollowUp'),
            nextFollowUpAt: t('dealSheet.activities.nextFollowUpAt'),
            types: {
              COMMENT: tActivities('COMMENT'),
              FOLLOW_UP: tActivities('FOLLOW_UP'),
              STATUS_CHANGE: tActivities('STATUS_CHANGE'),
            },
            noAuthor: t('dealSheet.activities.noAuthor'),
          },
        },
      }}
    />
  );
}
