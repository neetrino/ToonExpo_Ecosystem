'use client';

import type { RequestSource } from '@toonexpo/contracts';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';

import {
  ADMIN_COMPANIES_MAX_PAGE_SIZE,
  ADMIN_CRM_BOARD_PAGE_SIZE,
} from '@/features/admin/constants';
import { useAdminCrmDealQuery, useAdminCrmDealsQuery } from '@/features/admin/hooks/use-admin-crm';
import { useAdminCompaniesQuery } from '@/features/admin/hooks/use-admin-companies';
import { CrmDealSheet, CrmKanbanBoard } from '@/features/crm-board';
import { CRM_BOARD_REQUEST_SOURCES } from '@/features/crm-board/constants';
import { Input } from '@/shared/ui/input';
import { Select } from '@/shared/ui/select';

/**
 * Platform admin CRM Kanban — cross-company, read-only overview.
 */
export const AdminCrmBoardPage = () => {
  const t = useTranslations('Admin.crm');
  const tBoard = useTranslations('CrmBoard');
  const [selectedDealId, setSelectedDealId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [companyId, setCompanyId] = useState('');
  const [source, setSource] = useState<RequestSource | ''>('');

  const companiesQuery = useAdminCompaniesQuery(1, ADMIN_COMPANIES_MAX_PAGE_SIZE);
  const dealsQuery = useAdminCrmDealsQuery({
    page: 1,
    pageSize: ADMIN_CRM_BOARD_PAGE_SIZE,
    ...(companyId ? { companyId } : {}),
    ...(source ? { source } : {}),
    ...(search.trim() ? { q: search.trim() } : {}),
  });
  const dealQuery = useAdminCrmDealQuery(selectedDealId ?? '');

  const builderCompanies = useMemo(
    () => (companiesQuery.data?.data ?? []).filter((company) => company.type === 'builder'),
    [companiesQuery.data],
  );

  const deals = dealsQuery.data?.data ?? [];

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
          <Select
            className="h-11"
            value={companyId}
            onChange={(event) => {
              setCompanyId(event.target.value);
            }}
          >
            <option value="">{t('filters.allCompanies')}</option>
            {builderCompanies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.name}
              </option>
            ))}
          </Select>
        </label>

        <label className="flex min-w-0 flex-1 flex-col gap-1.5">
          <span className="text-xs font-medium uppercase tracking-wide text-ink-muted">
            {tBoard('filters.source')}
          </span>
          <Select
            className="h-11"
            value={source}
            onChange={(event) => {
              setSource(event.target.value as RequestSource | '');
            }}
          >
            <option value="">{tBoard('filters.allSources')}</option>
            {CRM_BOARD_REQUEST_SOURCES.map((item) => (
              <option key={item} value={item}>
                {tBoard(`sources.${item}`)}
              </option>
            ))}
          </Select>
        </label>
      </div>

      <CrmKanbanBoard deals={deals} mode="readonly" onOpenDeal={setSelectedDealId} />

      <CrmDealSheet
        open={selectedDealId !== null}
        onClose={() => {
          setSelectedDealId(null);
        }}
        deal={dealQuery.data ?? null}
        isLoading={Boolean(selectedDealId) && dealQuery.isLoading}
        isError={Boolean(selectedDealId) && dealQuery.isError}
        mode="readonly"
      />
    </div>
  );
};
