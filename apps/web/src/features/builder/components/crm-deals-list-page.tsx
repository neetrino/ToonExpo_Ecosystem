'use client';

import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import type { CrmDealStatus, RequestSource } from '@toonexpo/contracts';

import { CrmDealFilters } from '@/features/builder/components/crm-deal-filters';
import { CrmDealListItemView } from '@/features/builder/components/crm-deal-list-item';
import { CrmNewDealPanel } from '@/features/builder/components/crm-new-deal-panel';
import { PORTAL_DEFAULT_PAGE_SIZE, PORTAL_MAX_PAGE_SIZE } from '@/features/builder/constants';
import { useCrmDealsQuery } from '@/features/builder/hooks/use-portal-crm';
import { useCompanyMembersQuery } from '@/features/builder/hooks/use-company-members';
import { usePortalProjectsQuery } from '@/features/builder/hooks/use-portal-projects';
import { CatalogPagination } from '@/features/catalog/components/catalog-pagination';
import { Button } from '@/shared/ui/button';

const parsePage = (raw: string | null): number => {
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return 1;
  }
  return Math.floor(parsed);
};

/**
 * Builder CRM deals list: filters, table/cards, new deal CTA.
 */
export const CrmDealsListPage = () => {
  const t = useTranslations('Builder.crm');
  const searchParams = useSearchParams();
  const page = parsePage(searchParams.get('page'));
  const [showNew, setShowNew] = useState(false);
  const [filters, setFilters] = useState<{
    status: CrmDealStatus | '';
    source: RequestSource | '';
    projectId: string;
    assignedUserId: string;
  }>({ status: '', source: '', projectId: '', assignedUserId: '' });

  const projectsQuery = usePortalProjectsQuery(1, PORTAL_MAX_PAGE_SIZE);
  const membersQuery = useCompanyMembersQuery(1, PORTAL_MAX_PAGE_SIZE);
  const dealsQuery = useCrmDealsQuery({
    page,
    pageSize: PORTAL_DEFAULT_PAGE_SIZE,
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.source ? { source: filters.source } : {}),
    ...(filters.projectId ? { projectId: filters.projectId } : {}),
    ...(filters.assignedUserId ? { assignedUserId: filters.assignedUserId } : {}),
  });

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

  if (dealsQuery.isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="h-8 w-48 animate-pulse rounded-sm bg-border/70" />
        <div className="h-24 animate-pulse rounded-md bg-border/50" />
        <div className="h-40 animate-pulse rounded-md bg-border/40" />
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

  const response = dealsQuery.data;
  const buildHref = (nextPage: number): string => {
    const params = new URLSearchParams();
    if (nextPage > 1) {
      params.set('page', String(nextPage));
    }
    const query = params.toString();
    return query ? `/builder/crm?${query}` : '/builder/crm';
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="text-page-title text-ink">{t('title')}</h1>
          <p className="text-sm text-ink-secondary">
            {t('subtitle', { count: response.meta.total })}
          </p>
        </div>
        <Button
          type="button"
          size="sm"
          onClick={() => {
            setShowNew(true);
          }}
        >
          {t('newDeal.cta')}
        </Button>
      </div>

      <CrmDealFilters
        value={filters}
        projects={projects}
        assignees={assignees}
        onChange={setFilters}
      />

      {response.data.length === 0 ? (
        <p className="rounded-md border border-dashed border-border bg-surface/50 px-6 py-12 text-center text-sm text-ink-secondary">
          {t('empty')}
        </p>
      ) : (
        <>
          <div className="flex flex-col gap-3 md:hidden">
            {response.data.map((deal) => (
              <CrmDealListItemView key={deal.id} deal={deal} variant="card" />
            ))}
          </div>

          <div className="hidden overflow-x-auto rounded-md border border-border bg-surface-elevated shadow-xs md:block">
            <table className="w-full min-w-[44rem] border-collapse text-left text-sm">
              <thead className="bg-surface text-[10px] font-bold uppercase tracking-widest text-ink-muted">
                <tr>
                  <th className="px-4 py-3 font-bold">{t('columns.buyer')}</th>
                  <th className="px-4 py-3 font-bold">{t('columns.project')}</th>
                  <th className="px-4 py-3 font-bold">{t('columns.status')}</th>
                  <th className="px-4 py-3 font-bold">{t('columns.source')}</th>
                  <th className="px-4 py-3 font-bold">{t('columns.assignee')}</th>
                  <th className="px-4 py-3 font-bold">{t('columns.updated')}</th>
                </tr>
              </thead>
              <tbody>
                {response.data.map((deal) => (
                  <CrmDealListItemView key={deal.id} deal={deal} variant="row" />
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <CatalogPagination
        page={response.meta.page}
        totalPages={response.meta.totalPages}
        buildHref={buildHref}
        previousLabel={t('pagination.previous')}
        nextLabel={t('pagination.next')}
        ariaLabel={t('pagination.ariaLabel')}
      />

      {showNew ? (
        <CrmNewDealPanel
          projects={projects}
          onClose={() => {
            setShowNew(false);
          }}
        />
      ) : null}
    </div>
  );
};
