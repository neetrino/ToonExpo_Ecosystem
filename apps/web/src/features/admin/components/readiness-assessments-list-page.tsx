'use client';

import type { ReadinessAssessmentListItem } from '@toonexpo/contracts';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';

import { ReadinessAssessmentsTable } from '@/features/admin/components/readiness-assessments-table';
import { ReadinessCreateAssessmentSheet } from '@/features/admin/components/readiness-create-assessment-sheet';
import {
  ReadinessManagementModal,
  type ReadinessManagementTarget,
} from '@/features/admin/components/readiness-management-modal';
import { ADMIN_COMPANIES_MAX_PAGE_SIZE, ADMIN_VIEW_MODE_KEYS } from '@/features/admin/constants';
import { useAdminCompaniesQuery } from '@/features/admin/hooks/use-admin-companies';
import { useAdminReadinessAssessmentsQuery } from '@/features/admin/hooks/use-admin-readiness';
import { READINESS_DEFAULT_PAGE_SIZE } from '@/features/readiness/constants';
import { CatalogPagination } from '@/features/catalog/components/catalog-pagination';
import { usePersistedViewMode } from '@/shared/hooks/use-persisted-view-mode';
import { AddActionLabel } from '@/shared/ui/add-action-label';
import { Button } from '@/shared/ui/button';
import { EmptyState } from '@/shared/ui/empty-state';
import { Reveal } from '@/shared/ui/motion';
import { Select } from '@/shared/ui/select';
import { ViewModeToggle } from '@/shared/ui/view-mode-toggle';

const parsePage = (raw: string | null): number => {
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return 1;
  }
  return Math.floor(parsed);
};

/**
 * Admin readiness assessments list — opens scoring in a modal.
 */
export const ReadinessAssessmentsListPage = () => {
  const t = useTranslations('Admin.readiness.assessments');
  const tDetail = useTranslations('Admin.readiness.detail');
  const searchParams = useSearchParams();
  const page = parsePage(searchParams.get('page'));
  const [showCreate, setShowCreate] = useState(false);
  const [companyId, setCompanyId] = useState('');
  const [modalTarget, setModalTarget] = useState<ReadinessManagementTarget | null>(null);
  const { viewMode, effectiveViewMode, setViewMode } = usePersistedViewMode(
    ADMIN_VIEW_MODE_KEYS.readinessAssessments,
  );

  const companiesQuery = useAdminCompaniesQuery(1, ADMIN_COMPANIES_MAX_PAGE_SIZE);
  const assessmentsQuery = useAdminReadinessAssessmentsQuery({
    page,
    pageSize: READINESS_DEFAULT_PAGE_SIZE,
    ...(companyId ? { builderCompanyId: companyId } : {}),
  });

  const companyLookup = useMemo(() => {
    const map = new Map<string, { name: string; logoUrl: string | null }>();
    for (const company of companiesQuery.data?.data ?? []) {
      map.set(company.id, { name: company.name, logoUrl: company.logoUrl });
    }
    return map;
  }, [companiesQuery.data]);

  const openAssessment = (assessment: ReadinessAssessmentListItem): void => {
    const companyName =
      companyLookup.get(assessment.builderCompanyId)?.name ?? assessment.builderCompanyId;
    const targetLabel = tDetail(`targetTypes.${assessment.targetType}`);
    setModalTarget({
      kind: 'assessment',
      assessmentId: assessment.id,
      subtitle: `${companyName} · ${targetLabel}`,
    });
  };

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
  const visibleAssessments = response.data.filter((item) => item.archivedAt === null);

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
      <Reveal force>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="text-page-title text-ink">{t('title')}</h1>
            <p className="max-w-xl text-sm text-ink-secondary">{t('guide')}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Select
              id="readiness-company-filter"
              aria-label={t('filters.company')}
              size="fit"
              className="h-9 min-w-[10rem] max-w-[16rem]"
              value={companyId}
              onChange={(event) => {
                setCompanyId(event.target.value);
              }}
            >
              <option value="">{t('filters.allCompanies')}</option>
              {(companiesQuery.data?.data ?? []).map((company) => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
            </Select>
            <ViewModeToggle value={viewMode} onChange={setViewMode} />
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
      </Reveal>

      {visibleAssessments.length === 0 ? (
        <EmptyState
          title={t('emptyTitle')}
          description={t('empty')}
          actionLabel={t('newAssessment')}
          onAction={() => {
            setShowCreate(true);
          }}
        />
      ) : (
        <ReadinessAssessmentsTable
          assessments={visibleAssessments}
          companyLookup={companyLookup}
          viewMode={effectiveViewMode}
          onOpenAssessment={openAssessment}
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

      <ReadinessManagementModal
        target={modalTarget}
        onClose={() => {
          setModalTarget(null);
        }}
      />
    </div>
  );
};
