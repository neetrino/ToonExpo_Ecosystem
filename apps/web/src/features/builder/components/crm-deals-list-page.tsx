'use client';

import { useQueryClient } from '@tanstack/react-query';
import type { CrmDealStatus, RequestSource } from '@toonexpo/contracts';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';

import { updateCrmDeal } from '@/features/builder/api/portal-crm-api';
import { CrmDealActivitiesSection } from '@/features/builder/components/crm-deal-activities-section';
import { CrmDealApartmentsSection } from '@/features/builder/components/crm-deal-apartments-section';
import { CrmDealAssigneeControl } from '@/features/builder/components/crm-deal-assignee-control';
import { CrmDealFilters } from '@/features/builder/components/crm-deal-filters';
import { CrmDealNotesSection } from '@/features/builder/components/crm-deal-notes-section';
import { CrmDealRequestsSection } from '@/features/builder/components/crm-deal-requests-section';
import { CrmDealStatusControl } from '@/features/builder/components/crm-deal-status-control';
import { CrmNewDealPanel } from '@/features/builder/components/crm-new-deal-panel';
import {
  PORTAL_CRM_BOARD_PAGE_SIZE,
  PORTAL_CRM_DEALS_QUERY_KEY,
  PORTAL_MAX_PAGE_SIZE,
} from '@/features/builder/constants';
import { useCrmDealQuery, useCrmDealsQuery } from '@/features/builder/hooks/use-portal-crm';
import { useCompanyMembersQuery } from '@/features/builder/hooks/use-company-members';
import { usePortalProjectsQuery } from '@/features/builder/hooks/use-portal-projects';
import {
  crmStatusRequiresApartment,
  isCrmStatusTransitionAllowed,
} from '@/features/builder/utils/crm-status-transitions';
import { CrmDealSheet, CrmKanbanBoard } from '@/features/crm-board';
import { CRM_BOARD_SEARCH_DEBOUNCE_MS } from '@/features/crm-board/constants';
import { CrmNewColumnCreateButton } from '@/features/crm-board/crm-new-column-create-button';
import { filterCrmDealsBySearch } from '@/features/crm-board/filter-crm-deals-by-search';
import { CrmSearchResultsBadge } from '@/features/crm-board/crm-search-results-badge';
import { useCrmDealSheetUrl } from '@/features/crm-board/use-crm-deal-sheet-url';
import { useCrmNewLeadUrl } from '@/features/crm-board/use-crm-new-lead-url';
import { useDebouncedValue } from '@/shared/hooks/use-debounced-value';
import { AddActionLabel } from '@/shared/ui/add-action-label';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';

/**
 * Builder CRM Kanban workspace with deal SideSheet and new-deal flow.
 */
export const CrmDealsListPage = () => {
  const t = useTranslations('Builder.crm');
  const tBoard = useTranslations('CrmBoard');
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search.trim(), CRM_BOARD_SEARCH_DEBOUNCE_MS);
  const [boardError, setBoardError] = useState<string | null>(null);
  const { isNewLeadOpen, openNewLead, closeNewLead } = useCrmNewLeadUrl();
  const [filters, setFilters] = useState<{
    status: CrmDealStatus | '';
    source: RequestSource | '';
    projectId: string;
    assignedUserId: string;
  }>({ status: '', source: '', projectId: '', assignedUserId: '' });

  const projectsQuery = usePortalProjectsQuery(1, PORTAL_MAX_PAGE_SIZE);
  const membersQuery = useCompanyMembersQuery(1, PORTAL_MAX_PAGE_SIZE);
  const dealsQuery = useCrmDealsQuery({
    page: 1,
    pageSize: PORTAL_CRM_BOARD_PAGE_SIZE,
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.source ? { source: filters.source } : {}),
    ...(filters.projectId ? { projectId: filters.projectId } : {}),
    ...(filters.assignedUserId ? { assignedUserId: filters.assignedUserId } : {}),
    ...(debouncedSearch ? { q: debouncedSearch } : {}),
  });

  const deals = useMemo(
    () => filterCrmDealsBySearch(dealsQuery.data?.data ?? [], search),
    [dealsQuery.data?.data, search],
  );
  const { selectedDealId, openDeal, closeDeal } = useCrmDealSheetUrl(deals);
  const dealQuery = useCrmDealQuery(selectedDealId ?? '');

  const projects = useMemo(
    () =>
      (projectsQuery.data?.data ?? []).map((project) => ({
        id: project.id,
        name: project.name,
      })),
    [projectsQuery.data],
  );

  const assignees = useMemo(
    () =>
      (membersQuery.data?.data ?? [])
        .filter((member) => member.status === 'active')
        .map((member) => ({
          id: member.user.id,
          name: member.user.name,
        })),
    [membersQuery.data],
  );

  const onStatusDrop = async (dealId: string, status: CrmDealStatus) => {
    setBoardError(null);
    const deal = deals.find((item) => item.id === dealId);
    if (!deal || deal.status === status) {
      return;
    }
    if (!isCrmStatusTransitionAllowed(deal.status, status)) {
      setBoardError(tBoard('invalidTransition'));
      return;
    }
    if (crmStatusRequiresApartment(status) || status === 'lost') {
      openDeal(dealId);
      setBoardError(tBoard('openSheetForStatus'));
      return;
    }
    try {
      await updateCrmDeal(dealId, { status });
      await queryClient.invalidateQueries({ queryKey: PORTAL_CRM_DEALS_QUERY_KEY });
    } catch {
      setBoardError(t('errors.generic'));
    }
  };

  if (dealsQuery.isLoading && !dealsQuery.data) {
    return (
      <div className="flex flex-col gap-4">
        <div className="h-8 w-48 animate-pulse rounded-sm bg-border/70" />
        <div className="h-24 animate-pulse rounded-md bg-border/50" />
        <div className="h-64 animate-pulse rounded-md bg-border/40" />
      </div>
    );
  }

  if (dealsQuery.isError && !dealsQuery.data) {
    return (
      <p
        role="alert"
        className="rounded-md border border-danger/20 bg-danger-soft px-4 py-3 text-sm text-danger"
      >
        {t('error')}
      </p>
    );
  }

  const totalCount = dealsQuery.data?.meta.total ?? deals.length;

  return (
    <div className="crm-board-page">
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col gap-1">
          <p className="crm-board-page__eyebrow">{t('eyebrow')}</p>
          <h1 className="text-page-title text-ink">{t('title')}</h1>
          <p className="text-sm text-ink-secondary">{t('subtitle', { count: totalCount })}</p>
        </div>
        <Button
          type="button"
          size="sm"
          onClick={() => {
            openNewLead();
          }}
        >
          <AddActionLabel>{t('newDeal.cta')}</AddActionLabel>
        </Button>
      </div>

      <label className="flex max-w-xl shrink-0 flex-col gap-1.5">
        <span className="text-xs font-medium uppercase tracking-wide text-ink-muted">
          {tBoard('searchLabel')}
        </span>
        <Input
          value={search}
          placeholder={tBoard('searchPlaceholder')}
          onChange={(event) => {
            setSearch(event.target.value);
          }}
        />
        {search.trim() ? <CrmSearchResultsBadge count={deals.length} /> : null}
      </label>

      <div className="shrink-0">
        <CrmDealFilters
          value={filters}
          projects={projects}
          assignees={assignees}
          onChange={setFilters}
        />
      </div>

      {boardError ? (
        <p role="alert" className="shrink-0 text-sm text-danger">
          {boardError}
        </p>
      ) : null}

      <CrmKanbanBoard
        deals={deals}
        mode="edit"
        onOpenDeal={openDeal}
        onStatusDrop={onStatusDrop}
        newColumnAction={
          <CrmNewColumnCreateButton
            onClick={() => {
              openNewLead();
            }}
          />
        }
      />

      {isNewLeadOpen ? (
        <CrmNewDealPanel
          projects={projects}
          onClose={() => {
            closeNewLead();
          }}
          onCreated={(dealId) => {
            openDeal(dealId);
          }}
        />
      ) : null}

      <CrmDealSheet
        open={selectedDealId !== null}
        onClose={() => {
          closeDeal();
          setBoardError(null);
        }}
        deal={dealQuery.data ?? null}
        isLoading={Boolean(selectedDealId) && dealQuery.isLoading}
        isError={Boolean(selectedDealId) && dealQuery.isError}
        mode="edit"
        editSections={
          dealQuery.data ? (
            <div className="flex flex-col gap-4">
              <div className="grid gap-4">
                <CrmDealStatusControl deal={dealQuery.data} />
                <CrmDealAssigneeControl deal={dealQuery.data} />
              </div>
              <CrmDealApartmentsSection deal={dealQuery.data} />
              <CrmDealNotesSection deal={dealQuery.data} />
              <CrmDealActivitiesSection deal={dealQuery.data} />
              <CrmDealRequestsSection deal={dealQuery.data} />
            </div>
          ) : null
        }
      />
    </div>
  );
};
