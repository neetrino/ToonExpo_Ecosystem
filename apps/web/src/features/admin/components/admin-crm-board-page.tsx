'use client';

import { useQueryClient } from '@tanstack/react-query';
import type { CrmDealStatus, RequestSource } from '@toonexpo/contracts';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';

import { updateAdminCrmDeal } from '@/features/admin/api/admin-crm-api';
import { AdminCrmNewDealPanel } from '@/features/admin/components/admin-crm-new-deal-panel';
import {
  ADMIN_COMPANIES_MAX_PAGE_SIZE,
  ADMIN_CRM_BOARD_PAGE_SIZE,
  ADMIN_CRM_DEALS_QUERY_KEY,
} from '@/features/admin/constants';
import { useAdminCrmDealQuery, useAdminCrmDealsQuery } from '@/features/admin/hooks/use-admin-crm';
import { useAdminCompaniesQuery } from '@/features/admin/hooks/use-admin-companies';
import {
  crmStatusRequiresApartment,
  isCrmStatusTransitionAllowed,
} from '@/features/builder/utils/crm-status-transitions';
import { CrmDealSheet, CrmKanbanBoard } from '@/features/crm-board';
import { CRM_BOARD_REQUEST_SOURCES } from '@/features/crm-board/constants';
import { CrmNewColumnCreateButton } from '@/features/crm-board/crm-new-column-create-button';
import { Input } from '@/shared/ui/input';
import { MultiListboxSelect } from '@/shared/ui/multi-listbox-select';

/**
 * Platform admin CRM Kanban — overview, create, animated status drag.
 */
export const AdminCrmBoardPage = () => {
  const t = useTranslations('Admin.crm');
  const tBoard = useTranslations('CrmBoard');
  const queryClient = useQueryClient();
  const [selectedDealId, setSelectedDealId] = useState<string | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [search, setSearch] = useState('');
  /** Empty = All builders (default). */
  const [companyIds, setCompanyIds] = useState<string[]>([]);
  /** Empty = All sources (default). */
  const [sources, setSources] = useState<RequestSource[]>([]);
  const [boardError, setBoardError] = useState<string | null>(null);

  const companiesQuery = useAdminCompaniesQuery(1, ADMIN_COMPANIES_MAX_PAGE_SIZE);
  const dealsQuery = useAdminCrmDealsQuery({
    page: 1,
    pageSize: ADMIN_CRM_BOARD_PAGE_SIZE,
    ...(companyIds.length > 0 ? { companyIds } : {}),
    ...(sources.length > 0 ? { sources } : {}),
    ...(search.trim() ? { q: search.trim() } : {}),
  });
  const dealQuery = useAdminCrmDealQuery(selectedDealId ?? '');

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

  const deals = dealsQuery.data?.data ?? [];

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
      setSelectedDealId(dealId);
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

  if (dealsQuery.isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="h-8 w-48 animate-pulse rounded-sm bg-border/70" />
        <div className="h-64 animate-pulse rounded-md bg-border/40" />
      </div>
    );
  }

  if (dealsQuery.isError || !dealsQuery.data) {
    return (
      <p
        role="alert"
        className="rounded-md border border-danger/20 bg-danger-soft px-4 py-3 text-sm text-danger"
      >
        {t('error')}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <h1 className="text-page-title text-ink">{t('title')}</h1>
        <p className="text-sm text-ink-secondary">
          {t('subtitle', { count: dealsQuery.data.meta.total })}
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <label className="flex min-w-0 flex-1 flex-col gap-1.5">
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
        </label>

        <label className="flex min-w-0 flex-1 flex-col gap-1.5">
          <span className="text-xs font-medium uppercase tracking-wide text-ink-muted">
            {t('filters.company')}
          </span>
          <MultiListboxSelect
            id="admin-crm-builders"
            aria-label={t('filters.company')}
            values={companyIds}
            options={builderOptions}
            allLabel={t('filters.allCompanies')}
            selectedCountLabel={(count) => t('filters.selectedCount', { count })}
            onChange={setCompanyIds}
          />
        </label>

        <label className="flex min-w-0 flex-1 flex-col gap-1.5">
          <span className="text-xs font-medium uppercase tracking-wide text-ink-muted">
            {tBoard('filters.source')}
          </span>
          <MultiListboxSelect
            id="admin-crm-sources"
            aria-label={tBoard('filters.source')}
            values={sources}
            options={sourceOptions}
            allLabel={tBoard('filters.allSources')}
            selectedCountLabel={(count) => tBoard('filters.selectedCount', { count })}
            onChange={(next) => {
              setSources(next as RequestSource[]);
            }}
          />
        </label>
      </div>

      {boardError ? (
        <p role="alert" className="text-sm text-danger">
          {boardError}
        </p>
      ) : null}

      <CrmKanbanBoard
        deals={deals}
        mode="readonly"
        onOpenDeal={setSelectedDealId}
        onStatusDrop={onStatusDrop}
        newColumnAction={
          <CrmNewColumnCreateButton
            onClick={() => {
              setShowNew(true);
            }}
          />
        }
      />

      {showNew ? (
        <AdminCrmNewDealPanel
          companies={builderCompanies.map((company) => ({
            id: company.id,
            name: company.name,
          }))}
          defaultCompanyId={companyIds[0] ?? ''}
          onClose={() => {
            setShowNew(false);
          }}
          onCreated={(dealId) => {
            setSelectedDealId(dealId);
          }}
        />
      ) : null}

      <CrmDealSheet
        open={selectedDealId !== null}
        onClose={() => {
          setSelectedDealId(null);
          setBoardError(null);
        }}
        deal={dealQuery.data ?? null}
        isLoading={Boolean(selectedDealId) && dealQuery.isLoading}
        isError={Boolean(selectedDealId) && dealQuery.isError}
        mode="readonly"
      />
    </div>
  );
};
