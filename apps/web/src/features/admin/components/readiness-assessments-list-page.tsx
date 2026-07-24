'use client';

import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import type { ReadinessAssessmentTargetType, ReadinessScoreStatus } from '@toonexpo/contracts';

import { ReadinessAssessmentFilters } from '@/features/admin/components/readiness-assessment-filters';
import { ReadinessAssessmentsTable } from '@/features/admin/components/readiness-assessments-table';
import { ReadinessCreateAssessmentSheet } from '@/features/admin/components/readiness-create-assessment-sheet';
import { ADMIN_COMPANIES_MAX_PAGE_SIZE, ADMIN_VIEW_MODE_KEYS } from '@/features/admin/constants';
import { useAdminCompaniesQuery } from '@/features/admin/hooks/use-admin-companies';
import { useAdminReadinessAssessmentsQuery } from '@/features/admin/hooks/use-admin-readiness';
import { READINESS_DEFAULT_PAGE_SIZE } from '@/features/readiness/constants';
import { CatalogPagination } from '@/features/catalog/components/catalog-pagination';
import { Link } from '@/i18n/navigation';
import { usePersistedViewMode } from '@/shared/hooks/use-persisted-view-mode';
import { Button } from '@/shared/ui/button';
import { AddActionLabel } from '@/shared/ui/add-action-label';
import { ViewModeToggle } from '@/shared/ui/view-mode-toggle';

const parsePage = (raw: string | null): number => {
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return 1;
  }
  return Math.floor(parsed);
};

/**
 * Admin readiness assessments list with filters and create side sheet.
 */
export const ReadinessAssessmentsListPage = () => {
  const t = useTranslations('Admin.readiness.assessments');
  const searchParams = useSearchParams();
  const page = parsePage(searchParams.get('page'));
  const [showCreate, setShowCreate] = useState(false);
  const { viewMode, setViewMode } = usePersistedViewMode(ADMIN_VIEW_MODE_KEYS.readinessAssessments);
  const [filters, setFilters] = useState<{
    companyId: string;
    targetType: ReadinessAssessmentTargetType | '';
    status: ReadinessScoreStatus | '';
  }>({ companyId: '', targetType: '', status: '' });

  const companiesQuery = useAdminCompaniesQuery(1, ADMIN_COMPANIES_MAX_PAGE_SIZE);
  const assessmentsQuery = useAdminReadinessAssessmentsQuery({
    page,
    pageSize: READINESS_DEFAULT_PAGE_SIZE,
    ...(filters.companyId ? { builderCompanyId: filters.companyId } : {}),
    ...(filters.targetType ? { targetType: filters.targetType } : {}),
    ...(filters.status ? { status: filters.status } : {}),
  });

  const companyLookup = useMemo(() => {
    const map = new Map<string, string>();
    for (const company of companiesQuery.data?.data ?? []) {
      map.set(company.id, company.name);
    }
    return map;
  }, [companiesQuery.data]);

  const companyOptions = useMemo(
    () =>
      (companiesQuery.data?.data ?? []).map((company) => ({
        id: company.id,
        name: company.name,
      })),
    [companiesQuery.data],
  );

  if (assessmentsQuery.isLoading || companiesQuery.isLoading) {
    return <p className="text-sm text-ink-secondary">{t('loading')}</p>;
  }

  if (assessmentsQuery.isError || !assessmentsQuery.data) {
    return (
      <p role="alert" className="text-sm text-danger">
        {t('error')}
      </p>
    );
  }

  const response = assessmentsQuery.data;
  const buildHref = (nextPage: number): string => {
    const params = new URLSearchParams();
    if (nextPage > 1) {
      params.set('page', String(nextPage));
    }
    const query = params.toString();
    return query ? `/admin/readiness?${query}` : '/admin/readiness';
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-page-title text-ink">{t('title')}</h1>
        <p className="text-sm text-ink-secondary">
          {t('subtitle', { count: response.meta.total })}
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <ReadinessAssessmentFilters
          companyId={filters.companyId}
          targetType={filters.targetType}
          status={filters.status}
          companyOptions={companyOptions}
          onChange={setFilters}
        />

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <ViewModeToggle value={viewMode} onChange={setViewMode} />
          <Link
            href="/admin/readiness/categories"
            className="inline-flex h-9 items-center justify-center rounded-[15px] border border-border-strong px-4 text-sm font-medium text-ink hover:bg-surface"
          >
            {t('categoriesLink')}
          </Link>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={() => {
              setShowCreate(true);
            }}
          >
            <AddActionLabel>{t('newAssessment')}</AddActionLabel>
          </Button>
        </div>
      </div>

      {response.data.length === 0 ? (
        <p className="text-sm text-ink-secondary">{t('empty')}</p>
      ) : (
        <ReadinessAssessmentsTable
          assessments={response.data}
          companyLookup={companyLookup}
          viewMode={viewMode}
        />
      )}

      <CatalogPagination
        page={response.meta.page}
        totalPages={response.meta.totalPages}
        buildHref={buildHref}
        previousLabel={t('pagination.previous')}
        nextLabel={t('pagination.next')}
        ariaLabel={t('pagination.ariaLabel')}
      />

      <ReadinessCreateAssessmentSheet
        open={showCreate}
        companies={companiesQuery.data?.data ?? []}
        onClose={() => {
          setShowCreate(false);
        }}
      />
    </div>
  );
};
