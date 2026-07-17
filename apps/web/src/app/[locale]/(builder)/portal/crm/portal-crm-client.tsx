'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

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

function parseView(rawView: string | null): 'board' | 'list' {
  return rawView === CRM_LIST_VIEW ? 'list' : 'board';
}

type CrmPageData = {
  view: 'board' | 'list';
  boardColumns: Parameters<typeof CrmWorkspace>[0]['boardColumns'];
  listRows: Parameters<typeof CrmWorkspace>[0]['listRows'];
  dealDetail: Parameters<typeof CrmWorkspace>[0]['dealDetail'];
  members: Parameters<typeof CrmWorkspace>[0]['members'];
  apartmentGroups: Parameters<typeof CrmWorkspace>[0]['apartmentGroups'];
  projects: Parameters<typeof CrmWorkspace>[0]['projects'];
  labels: Parameters<typeof CrmWorkspace>[0]['labels'];
};

export function PortalCrmClient() {
  const locale = useLocale();
  const searchParams = useSearchParams();
  const view = parseView(searchParams.get('view'));
  const dealId = searchParams.get('deal');
  const t = useTranslations('portal.crm');
  const tStages = useTranslations('portal.crm.stages');
  const tSources = useTranslations('portal.crm.sources');
  const tActivities = useTranslations('portal.crm.activityTypes');
  const tApartmentStatus = useTranslations('portal.apartmentStatus');
  const [data, setData] = useState<CrmPageData | null>(null);

  useEffect(() => {
    let cancelled = false;
    setData(null);
    void (async () => {
      const builderContext = await assertBuilderSession();
      if (!builderContext || cancelled) {
        return;
      }
      const companyId = builderContext.companyId;

      const [columns, projects, members] = await Promise.all([
        getCompanyDealsBoard(companyId),
        loadCompanyProjects(companyId),
        loadCompanyMembers(companyId),
      ]);
      if (cancelled) {
        return;
      }

      const dealDetailRaw = dealId ? await getCompanyDealDetail(companyId, dealId) : null;
      if (cancelled) {
        return;
      }
      const dealDetail = dealDetailRaw ? toSerializableDealDetail(dealDetailRaw) : null;
      const apartmentGroups = dealDetail
        ? await loadApartmentLinkOptions(companyId, dealDetail.projectId)
        : [];
      if (cancelled) {
        return;
      }

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

      setData({
        view,
        boardColumns,
        listRows,
        dealDetail,
        members,
        apartmentGroups,
        projects: projects.map((project) => ({ id: project.id, name: project.name })),
        labels: buildCrmWorkspaceLabels({
          t,
          tActivities,
          tApartmentStatus,
          stageLabels,
          sourceLabels,
          dealDetail,
          locale,
        }),
      });
    })();
    return () => {
      cancelled = true;
    };
  }, [dealId, locale, view, t, tStages, tSources, tActivities, tApartmentStatus]);

  if (!data) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-16 text-sm text-[var(--te-muted)]" role="status">
        Loading…
      </div>
    );
  }

  return <CrmWorkspace locale={locale} {...data} />;
}
