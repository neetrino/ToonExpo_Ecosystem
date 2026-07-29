'use client';

import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';

import { ReadinessAssessmentsTable } from '@/features/admin/components/readiness-assessments-table';
import {
  applyReadinessAssessmentFilterKey,
  buildReadinessAssessmentFilterConfigs,
  EMPTY_READINESS_ASSESSMENT_FILTERS,
  readinessAssessmentFiltersToRecord,
} from '@/features/admin/components/readiness-assessment-filters';
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
import { ListPageHeader } from '@/shared/ui/list-page-header';
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
  const tCommon = useTranslations('Common.integratedSearch');
  const searchParams = useSearchParams();
  const page = parsePage(searchParams.get('page'));
  const [showCreate, setShowCreate] = useState(false);
  const { viewMode, effectiveViewMode, setViewMode } = usePersistedViewMode(
    ADMIN_VIEW_MODE_KEYS.readinessAssessments,
  );
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState(EMPTY_READINESS_ASSESSMENT_FILTERS);

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

  const filterConfigs = useMemo(
    () =>
      buildReadinessAssessmentFilterConfigs(companyOptions, {
        company: t('filters.company'),
        allCompanies: t('filters.allCompanies'),
        targetType: t('filters.targetType'),
        allTargets: t('filters.allTargets'),
        status: t('filters.status'),
        allStatuses: t('filters.allStatuses'),
        targetTypeOption: (type) => t(`filters.targetTypes.${type}`),
        statusOption: (status) => t(`filters.statuses.${status}`),
      }),
    [companyOptions, t],
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
      <ListPageHeader
        title={t('title')}
        subtitle={t('subtitle', { count: response.meta.total })}
        search={search}
        searchPlaceholder={tCommon('searchPlaceholder')}
        searchAriaLabel={tCommon('searchLabel')}
        searchClassName="w-full max-w-none md:min-w-[10rem] md:max-w-[14rem] md:flex-none md:w-auto"
        filters={filterConfigs}
        filterValues={readinessAssessmentFiltersToRecord(filters)}
        onSearchChange={setSearch}
        onFilterChange={(key, value) => {
          setFilters((prev) => applyReadinessAssessmentFilterKey(prev, key, value));
        }}
        onClearAll={() => {
          setFilters(EMPTY_READINESS_ASSESSMENT_FILTERS);
        }}
        actions={
          <div className="flex w-full basis-full items-center gap-2 md:w-auto md:basis-auto">
            <ViewModeToggle value={viewMode} onChange={setViewMode} />
            <Link
              href="/admin/readiness/categories"
              className="inline-flex h-9 flex-1 items-center justify-center rounded-[15px] border border-border-strong px-4 text-sm font-medium text-ink hover:bg-surface md:flex-none"
            >
              {t('categoriesLink')}
            </Link>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              className="shrink-0"
              onClick={() => {
                setShowCreate(true);
              }}
            >
              <AddActionLabel>{t('newAssessment')}</AddActionLabel>
            </Button>
          </div>
        }
      />

      {response.data.length === 0 ? (
        <p className="text-sm text-ink-secondary">{t('empty')}</p>
      ) : (
        <ReadinessAssessmentsTable
          assessments={response.data}
          companyLookup={companyLookup}
          viewMode={effectiveViewMode}
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
