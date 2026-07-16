'use client';

import { useCallback } from 'react';

import { usePathname, useRouter } from '@/i18n/navigation';
import type { ProjectApartmentGroup } from '@/lib/crm/apartment-link-queries';
import type { CompanyMemberOption } from '@/lib/crm/member-queries';
import type { DealStage } from '@toonexpo/domain';

import { CrmBoard } from './crm-board';
import { CrmViewToggle, type CrmDealCardData } from './crm-deal-card';
import { CrmList } from './crm-list';
import { NewDealButton } from './new-deal-button';
import { DealSheet } from './sheets/deal-sheet';

type CrmBoardColumnData = {
  stage: DealStage;
  stageLabel: string;
  deals: CrmDealCardData[];
};

type CrmWorkspaceProps = {
  locale: string;
  view: 'board' | 'list';
  boardColumns: CrmBoardColumnData[];
  listRows: CrmDealCardData[];
  dealDetail: Parameters<typeof DealSheet>[0]['deal'] | null;
  members: CompanyMemberOption[];
  apartmentGroups: ProjectApartmentGroup[];
  projects: Array<{ id: string; name: string }>;
  labels: {
    title: string;
    empty: string;
    newDeal: string;
    view: { board: string; list: string };
    card: {
      unnamedContact: string;
      noProject: string;
      noAssignee: string;
      noActivity: string;
      apartmentCount: string;
      source: Record<CrmDealCardData['source'], string>;
    };
    list: {
      unnamedContact: string;
      noProject: string;
      noAssignee: string;
      noActivity: string;
      columns: {
        contact: string;
        project: string;
        stage: string;
        source: string;
        assignee: string;
        apartments: string;
        lastActivity: string;
      };
      stages: Record<CrmDealCardData['stage'], string>;
      sources: Record<CrmDealCardData['source'], string>;
    };
    dealSheet: Parameters<typeof DealSheet>[0]['labels'];
  };
};

export function CrmWorkspace({
  locale,
  view,
  boardColumns,
  listRows,
  dealDetail,
  members,
  apartmentGroups,
  projects,
  labels,
}: CrmWorkspaceProps) {
  const router = useRouter();
  const pathname = usePathname();
  const hasDeals = boardColumns.some((column) => column.deals.length > 0);

  const openDeal = useCallback(
    (dealId: string) => {
      const params = new URLSearchParams();
      if (view === 'list') {
        params.set('view', 'list');
      }
      params.set('deal', dealId);
      router.push(`${pathname}?${params.toString()}`);
    },
    [pathname, router, view],
  );

  const closeDeal = useCallback(() => {
    const params = new URLSearchParams();
    if (view === 'list') {
      params.set('view', 'list');
    }
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }, [pathname, router, view]);

  const handleDealCreated = useCallback(
    (dealId: string) => {
      openDeal(dealId);
    },
    [openDeal],
  );

  return (
    <section>
      <div className="portal-page__header">
        <h2 className="portal-page__title">{labels.title}</h2>
        <div className="portal-toolbar">
          <CrmViewToggle view={view} labels={labels.view} />
          <NewDealButton
            locale={locale}
            label={labels.newDeal}
            projects={projects}
            onCreated={handleDealCreated}
          />
        </div>
      </div>

      {!hasDeals ? (
        <p className="portal-empty">{labels.empty}</p>
      ) : view === 'list' ? (
        <CrmList locale={locale} rows={listRows} labels={labels.list} onOpenDeal={openDeal} />
      ) : (
        <CrmBoard
          locale={locale}
          columns={boardColumns}
          labels={labels.card}
          onOpenDeal={openDeal}
        />
      )}

      {dealDetail ? (
        <DealSheet
          locale={locale}
          open
          onClose={closeDeal}
          deal={dealDetail}
          members={members}
          apartmentGroups={apartmentGroups}
          labels={labels.dealSheet}
        />
      ) : null}
    </section>
  );
}
