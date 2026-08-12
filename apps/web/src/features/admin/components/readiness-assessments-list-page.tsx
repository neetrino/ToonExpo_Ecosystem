'use client';

import type { ReadinessAssessmentListItem } from '@toonexpo/contracts';
import { useQueryClient } from '@tanstack/react-query';
import { ClipboardCheck, SearchX } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';

import { ensureAdminBuilderReadinessAssessments } from '@/features/admin/api/admin-readiness-api';
import { ReadinessAssessmentsTable } from '@/features/admin/components/readiness-assessments-table';
import {
  ReadinessManagementModal,
  type ReadinessManagementTarget,
} from '@/features/admin/components/readiness-management-modal';
import {
  ADMIN_COMPANIES_DEFAULT_PAGE_SIZE,
  ADMIN_COMPANIES_MAX_PAGE_SIZE,
  ADMIN_PROJECTS_SEARCH_DEBOUNCE_MS,
  ADMIN_READINESS_ASSESSMENTS_QUERY_KEY,
  ADMIN_VIEW_MODE_KEYS,
} from '@/features/admin/constants';
import { useAdminCompaniesQuery } from '@/features/admin/hooks/use-admin-companies';
import { useAdminReadinessAssessmentsQuery } from '@/features/admin/hooks/use-admin-readiness';
import { CatalogPagination } from '@/features/catalog/components/catalog-pagination';
import { usePathname, useRouter } from '@/i18n/navigation';
import { useDebouncedValue } from '@/shared/hooks/use-debounced-value';
import { usePersistedViewMode } from '@/shared/hooks/use-persisted-view-mode';
import { EmptyState } from '@/shared/ui/empty-state';
import { ListPageHeader } from '@/shared/ui/list-page-header';
import { ViewModeToggle } from '@/shared/ui/view-mode-toggle';

const FIRST_PAGE = 1;

const parsePage = (raw: string | null): number => {
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed < FIRST_PAGE) {
    return FIRST_PAGE;
  }
  return Math.floor(parsed);
};

/**
 * One active company-level assessment per builder (latest wins).
 */
const buildCompanyAssessmentMap = (
  assessments: readonly ReadinessAssessmentListItem[],
): Map<string, ReadinessAssessmentListItem> => {
  const map = new Map<string, ReadinessAssessmentListItem>();
  for (const assessment of assessments) {
    if (assessment.archivedAt !== null || assessment.targetType !== 'builder_company') {
      continue;
    }
    const existing = map.get(assessment.builderCompanyId);
    if (!existing || assessment.createdAt > existing.createdAt) {
      map.set(assessment.builderCompanyId, assessment);
    }
  }
  return map;
};

/**
 * Admin readiness list — same builders as Admin Builders (1 card per builder).
 */
export const ReadinessAssessmentsListPage = () => {
  const t = useTranslations('Admin.readiness.assessments');
  const tCommon = useTranslations('Common.integratedSearch');
  const tDetail = useTranslations('Admin.readiness.detail');
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const page = parsePage(searchParams.get('page'));
  const pageSize = ADMIN_COMPANIES_DEFAULT_PAGE_SIZE;
  const [search, setSearch] = useState('');
  const trimmedSearch = search.trim();
  const debouncedSearch = useDebouncedValue(trimmedSearch, ADMIN_PROJECTS_SEARCH_DEBOUNCE_MS);
  const activeSearch = trimmedSearch.length === 0 ? '' : debouncedSearch;
  const [modalTarget, setModalTarget] = useState<ReadinessManagementTarget | null>(null);
  const [isEnsuringBuilders, setIsEnsuringBuilders] = useState(false);
  const { viewMode, effectiveViewMode, setViewMode } = usePersistedViewMode(
    ADMIN_VIEW_MODE_KEYS.readinessAssessments,
  );
  const ensureRanRef = useRef(false);

  const buildersQuery = useAdminCompaniesQuery(page, pageSize, {
    type: 'builder',
    ...(activeSearch ? { search: activeSearch } : {}),
  });
  const assessmentsQuery = useAdminReadinessAssessmentsQuery({
    page: 1,
    pageSize: ADMIN_COMPANIES_MAX_PAGE_SIZE,
    targetType: 'builder_company',
  });

  useEffect(() => {
    if (ensureRanRef.current || !buildersQuery.isSuccess) {
      return;
    }
    ensureRanRef.current = true;
    setIsEnsuringBuilders(true);
    void ensureAdminBuilderReadinessAssessments()
      .then(async (result) => {
        if (result.createdCount > 0) {
          await queryClient.invalidateQueries({
            queryKey: ADMIN_READINESS_ASSESSMENTS_QUERY_KEY,
          });
        }
      })
      .catch(() => {
        ensureRanRef.current = false;
      })
      .finally(() => {
        setIsEnsuringBuilders(false);
      });
  }, [buildersQuery.isSuccess, queryClient]);

  const companyLookup = useMemo(() => {
    const map = new Map<string, { name: string; logoUrl: string | null }>();
    for (const company of buildersQuery.data?.data ?? []) {
      map.set(company.id, { name: company.name, logoUrl: company.logoUrl });
    }
    return map;
  }, [buildersQuery.data]);

  const assessmentByCompanyId = useMemo(
    () => buildCompanyAssessmentMap(assessmentsQuery.data?.data ?? []),
    [assessmentsQuery.data?.data],
  );

  const visibleAssessments = useMemo(() => {
    const builders = buildersQuery.data?.data ?? [];
    const rows: ReadinessAssessmentListItem[] = [];
    for (const builder of builders) {
      const assessment = assessmentByCompanyId.get(builder.id);
      if (assessment) {
        rows.push(assessment);
      }
    }
    return rows;
  }, [assessmentByCompanyId, buildersQuery.data?.data]);

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

  const buildHref = (nextPage: number): string => {
    const params = new URLSearchParams();
    if (nextPage > FIRST_PAGE) {
      params.set('page', String(nextPage));
    }
    const query = params.toString();
    return query.length > 0 ? `${pathname}?${query}` : pathname;
  };

  const handleSearchChange = (value: string): void => {
    setSearch(value);
    if (page > FIRST_PAGE) {
      router.replace(buildHref(FIRST_PAGE));
    }
  };

  if (buildersQuery.isLoading || assessmentsQuery.isLoading || isEnsuringBuilders) {
    return <p className="text-sm text-ink-secondary">{t('loading')}</p>;
  }

  if (buildersQuery.isError || assessmentsQuery.isError || !buildersQuery.data) {
    return (
      <p role="alert" className="text-sm text-danger">
        {t('error')}
      </p>
    );
  }

  const buildersMeta = buildersQuery.data.meta;

  return (
    <div className="flex flex-col gap-6">
      <ListPageHeader
        icon={ClipboardCheck}
        title={t('title')}
        subtitle={t('subtitle', { count: buildersMeta.total })}
        search={search}
        searchPlaceholder={t('searchPlaceholder')}
        searchAriaLabel={tCommon('searchLabel')}
        onSearchChange={handleSearchChange}
        onClearAll={() => {
          handleSearchChange('');
        }}
        actions={<ViewModeToggle value={viewMode} onChange={setViewMode} />}
      />

      {visibleAssessments.length === 0 ? (
        <div className="flex min-h-72 items-center justify-center">
          <EmptyState
            icon={activeSearch ? SearchX : ClipboardCheck}
            title={activeSearch ? t('noResultsTitle') : t('emptyTitle')}
            description={activeSearch ? t('noResults', { query: activeSearch }) : t('empty')}
            actionLabel={activeSearch ? t('clearSearch') : undefined}
            onAction={activeSearch ? () => handleSearchChange('') : undefined}
            className="w-full max-w-md border-solid border-border/70 bg-surface-elevated px-6 py-10 shadow-sm sm:px-10 sm:py-12"
          />
        </div>
      ) : (
        <ReadinessAssessmentsTable
          assessments={visibleAssessments}
          companyLookup={companyLookup}
          viewMode={effectiveViewMode}
          onOpenAssessment={openAssessment}
        />
      )}

      <CatalogPagination
        page={buildersMeta.page}
        totalPages={buildersMeta.totalPages}
        previousHref={buildersMeta.page > FIRST_PAGE ? buildHref(buildersMeta.page - 1) : null}
        nextHref={
          buildersMeta.page < buildersMeta.totalPages ? buildHref(buildersMeta.page + 1) : null
        }
        previousLabel={t('pagination.previous')}
        nextLabel={t('pagination.next')}
        ariaLabel={t('pagination.ariaLabel')}
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
