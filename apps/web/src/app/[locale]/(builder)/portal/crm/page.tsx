import { getTranslations, setRequestLocale } from 'next-intl/server';

import { assertBuilderSession } from '@/lib/builder/assert-builder-session';
import { loadCompanyProjects } from '@/lib/builder/queries';
import { loadApartmentLinkOptions } from '@/lib/crm/apartment-link-queries';
import { getCompanyDealDetail, getCompanyDealsBoard } from '@/lib/crm/deal-queries';
import { loadCompanyMembers } from '@/lib/crm/member-queries';

import { CrmWorkspace } from './crm-workspace';
import {
  buildCrmSourceLabels,
  buildCrmStageLabels,
  buildCrmWorkspaceLabels,
  mapCrmDealCard,
  toSerializableDealDetail,
} from './portal-crm-page-helpers';

const CRM_LIST_VIEW = 'list';

type PortalCrmPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ view?: string; deal?: string }>;
};

function parseView(rawView: string | undefined): 'board' | 'list' {
  return rawView === CRM_LIST_VIEW ? 'list' : 'board';
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

  const stageLabels = buildCrmStageLabels(tStages);
  const sourceLabels = buildCrmSourceLabels(tSources);
  const boardColumns = columns.map((column) => ({
    stage: column.stage,
    stageLabel: stageLabels[column.stage],
    deals: column.deals.map((deal) => mapCrmDealCard(deal, locale)),
  }));
  const listRows = columns.flatMap((column) =>
    column.deals.map((deal) => mapCrmDealCard(deal, locale)),
  );

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
      labels={buildCrmWorkspaceLabels({
        t,
        tActivities,
        tApartmentStatus,
        stageLabels,
        sourceLabels,
        dealDetail,
        locale,
      })}
    />
  );
}
