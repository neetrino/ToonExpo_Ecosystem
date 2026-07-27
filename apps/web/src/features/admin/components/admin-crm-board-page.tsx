'use client';

import { useQueryClient } from '@tanstack/react-query';
import type { CrmDealStatus, RequestSource } from '@toonexpo/contracts';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';

import { updateAdminCrmDeal } from '@/features/admin/api/admin-crm-api';
import { AdminCrmDealsTable } from '@/features/admin/components/admin-crm-deals-table';
import { AdminCrmNewDealSheet } from '@/features/admin/components/admin-crm-new-deal-sheet';
import {
  ADMIN_COMPANIES_MAX_PAGE_SIZE,
  ADMIN_CRM_BOARD_PAGE_SIZE,
  ADMIN_CRM_DEALS_QUERY_KEY,
  ADMIN_VIEW_MODE_KEYS,
} from '@/features/admin/constants';
import {
  useAdminCrmDealQuery,
  useAdminCrmDealsQuery,
  useDeleteAdminCrmDealMutation,
} from '@/features/admin/hooks/use-admin-crm';
import { useAdminCompaniesQuery } from '@/features/admin/hooks/use-admin-companies';
import {
  crmStatusRequiresApartment,
  isCrmStatusTransitionAllowed,
} from '@/features/builder/utils/crm-status-transitions';
import { CrmDealSheet, CrmKanbanBoard } from '@/features/crm-board';
import {
  CRM_BOARD_REQUEST_SOURCES,
  CRM_BOARD_SEARCH_DEBOUNCE_MS,
} from '@/features/crm-board/constants';
import { CrmNewColumnCreateButton } from '@/features/crm-board/crm-new-column-create-button';
import { filterCrmDealsBySearch } from '@/features/crm-board/filter-crm-deals-by-search';
import { CrmSearchResultsBadge } from '@/features/crm-board/crm-search-results-badge';
import { useCrmDealSheetUrl } from '@/features/crm-board/use-crm-deal-sheet-url';
import { useCrmNewLeadUrl } from '@/features/crm-board/use-crm-new-lead-url';
import { useDebouncedValue } from '@/shared/hooks/use-debounced-value';
import { usePersistedViewMode } from '@/shared/hooks/use-persisted-view-mode';
import { AddActionLabel } from '@/shared/ui/add-action-label';
import { Button } from '@/shared/ui/button';
import { MultiListboxSelect } from '@/shared/ui/multi-listbox-select';
import { SearchField } from '@/shared/ui/search-field';
import { VIEW_MODE_CARDS, VIEW_MODE_LIST } from '@/shared/ui/view-mode';
import { ViewModeToggle } from '@/shared/ui/view-mode-toggle';

/**
 * Platform admin CRM — Kanban (cards) / list table, create, animated status drag.
 */
export const AdminCrmBoardPage = () => {
  const t = useTranslations('Admin.crm');
  const tBoard = useTranslations('CrmBoard');
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search.trim(), CRM_BOARD_SEARCH_DEBOUNCE_MS);
  /** Empty = All builders (default). */
  const [companyIds, setCompanyIds] = useState<string[]>([]);
  /** Empty = All sources (default). */
  const [sources, setSources] = useState<RequestSource[]>([]);
  const [boardError, setBoardError] = useState<string | null>(null);
  const { isNewLeadOpen, openNewLead, closeNewLead } = useCrmNewLeadUrl();
  const { viewMode, setViewMode } = usePersistedViewMode(ADMIN_VIEW_MODE_KEYS.crm);

  const companiesQuery = useAdminCompaniesQuery(1, ADMIN_COMPANIES_MAX_PAGE_SIZE);
  const dealsQuery = useAdminCrmDealsQuery({
    page: 1,
    pageSize: ADMIN_CRM_BOARD_PAGE_SIZE,
    ...(companyIds.length > 0 ? { companyIds } : {}),
    ...(sources.length > 0 ? { sources } : {}),
    ...(debouncedSearch ? { q: debouncedSearch } : {}),
  });
  const deals = useMemo(
    () => filterCrmDealsBySearch(dealsQuery.data?.data ?? [], search),
    [dealsQuery.data?.data, search],
  );
  const { selectedDealId, openDeal, closeDeal } = useCrmDealSheetUrl(deals);
  const dealQuery = useAdminCrmDealQuery(selectedDealId ?? '');
  const deleteDealMutation = useDeleteAdminCrmDealMutation();

  const builderCompanies = useMemo(
    () => (companiesQuery.data?.data ?? []).filter((company) => company.type === 'builder'),
    [companiesQuery.data],
  );

  const builderOptions = useMemo(
    () =>
      builderCompanies.map((company) => ({
        value: company.id,
        label: company.name,
      })),
    [builderCompanies],
  );

  const sourceOptions = useMemo(
    () =>
      CRM_BOARD_REQUEST_SOURCES.map((item) => ({
        value: item,
        label: tBoard(`sources.${item}`),
      })),
    [tBoard],
  );

  const onStatusDrop = async (dealId: string, status: CrmDealStatus) => {
    setBoardError(null);
    const deal = deals.find((item) => item.id === dealId);
    if (!deal || deal.status === status) {
      return;
    }
    if (!isCrmStatusTransitionAllowed(deal.status, status)) {
      setBoardError(tBoard('invalidTransition'));
      await queryClient.invalidateQueries({ queryKey: ADMIN_CRM_DEALS_QUERY_KEY });
      return;
    }
    if (crmStatusRequiresApartment(status) || status === 'lost') {
      openDeal(dealId);
      setBoardError(tBoard('openSheetForStatus'));
      await queryClient.invalidateQueries({ queryKey: ADMIN_CRM_DEALS_QUERY_KEY });
      return;
    }
    try {
      await updateAdminCrmDeal(dealId, { status });
      await queryClient.invalidateQueries({ queryKey: ADMIN_CRM_DEALS_QUERY_KEY });
    } catch {
      setBoardError(t('error'));
      await queryClient.invalidateQueries({ queryKey: ADMIN_CRM_DEALS_QUERY_KEY });
    }
  };

  if (dealsQuery.isLoading && !dealsQuery.data) {
    return (
      <div className="flex flex-col gap-4">
        <div className="h-8 w-48 animate-pulse rounded-sm bg-border/70" />
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
  const isBoardView = viewMode === VIEW_MODE_CARDS;

  return (
    <div className={isBoardView ? 'crm-board-page' : 'flex flex-col gap-6'}>
      <div className="flex shrink-0 flex-col gap-1">
        <p className="crm-board-page__eyebrow">{t('eyebrow')}</p>
        <h1 className="text-page-title text-ink">{t('title')}</h1>
        <p className="text-sm text-ink-secondary">{t('subtitle', { count: totalCount })}</p>
      </div>

      <div className="flex shrink-0 flex-nowrap items-center justify-between gap-3 overflow-x-auto">
        <div className="flex min-w-0 flex-1 flex-nowrap items-center gap-2">
          <SearchField
            className="min-w-[10rem] flex-1"
            value={search}
            placeholder={tBoard('searchPlaceholder')}
            aria-label={tBoard('searchLabel')}
            onChange={(event) => {
              setSearch(event.target.value);
            }}
          />

          <MultiListboxSelect
            id="admin-crm-builders"
            size="fit"
            className="h-10 shrink-0"
            aria-label={t('filters.company')}
            values={companyIds}
            options={builderOptions}
            allLabel={t('filters.allCompanies')}
            selectedCountLabel={(count) => t('filters.selectedCount', { count })}
            onChange={setCompanyIds}
          />

          <MultiListboxSelect
            id="admin-crm-sources"
            size="fit"
            className="h-10 shrink-0"
            aria-label={tBoard('filters.source')}
            values={sources}
            options={sourceOptions}
            allLabel={tBoard('filters.allSources')}
            selectedCountLabel={(count) => tBoard('filters.selectedCount', { count })}
            onChange={(next) => {
              setSources(next as RequestSource[]);
            }}
          />
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {search.trim() ? <CrmSearchResultsBadge count={deals.length} /> : null}
          <ViewModeToggle value={viewMode} onChange={setViewMode} />
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={() => {
              openNewLead();
            }}
          >
            <AddActionLabel>{t('newDeal.title')}</AddActionLabel>
          </Button>
        </div>
      </div>

      {boardError ? (
        <p role="alert" className="shrink-0 text-sm text-danger">
          {boardError}
        </p>
      ) : null}

      {viewMode === VIEW_MODE_LIST ? (
        deals.length === 0 ? (
          <p className="text-sm text-ink-secondary">{t('empty')}</p>
        ) : (
          <AdminCrmDealsTable deals={deals} onSelectDeal={openDeal} />
        )
      ) : (
        <CrmKanbanBoard
          deals={deals}
          mode="readonly"
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
      )}

      <AdminCrmNewDealSheet
        open={isNewLeadOpen}
        companies={builderCompanies.map((company) => ({
          id: company.id,
          name: company.name,
        }))}
        defaultCompanyId={companyIds[0] ?? ''}
        onClose={() => {
          closeNewLead();
        }}
        onCreated={(dealId) => {
          openDeal(dealId);
        }}
      />

      <CrmDealSheet
        open={selectedDealId !== null}
        onClose={() => {
          closeDeal();
          setBoardError(null);
        }}
        deal={dealQuery.data ?? null}
        isLoading={Boolean(selectedDealId) && dealQuery.isLoading}
        isError={Boolean(selectedDealId) && dealQuery.isError}
        mode="readonly"
        isDeleting={deleteDealMutation.isPending}
        onDelete={
          selectedDealId
            ? () => {
                void deleteDealMutation
                  .mutateAsync(selectedDealId)
                  .then(() => {
                    closeDeal();
                    setBoardError(null);
                  })
                  .catch(() => {
                    setBoardError(tBoard('deleteError'));
                  });
              }
            : undefined
        }
      />
    </div>
  );
};
