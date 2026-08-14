'use client';

import type { ReadinessAssessmentListItem } from '@toonexpo/contracts';
import { ClipboardCheck, SearchX } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';

import {
  READINESS_ASSESSMENT_FILTER_COMPANY_KEY,
  READINESS_ASSESSMENT_FILTER_PROJECT_KEY,
  buildReadinessAssessmentFilterConfigs,
} from '@/features/admin/components/readiness-assessment-filters';
import {
  READINESS_LIST_FIRST_PAGE,
  buildProjectAssessmentMap,
  buildReadinessListHref,
  parseReadinessListPage,
  resolveVisibleProjects,
} from '@/features/admin/components/readiness-assessments-list.helpers';
import { ReadinessAssessmentsTable } from '@/features/admin/components/readiness-assessments-table';
import {
  ReadinessManagementModal,
  type ReadinessManagementTarget,
} from '@/features/admin/components/readiness-management-modal';
import {
  ADMIN_COMPANIES_MAX_PAGE_SIZE,
  ADMIN_INVENTORY_DEFAULT_PAGE_SIZE,
  ADMIN_PROJECTS_SEARCH_DEBOUNCE_MS,
  ADMIN_VIEW_MODE_KEYS,
} from '@/features/admin/constants';
import {
  useAdminBuilderCompaniesQuery,
  useAdminProjectsQuery,
} from '@/features/admin/hooks/use-admin-companies';
import { useAdminReadinessAssessmentsQuery } from '@/features/admin/hooks/use-admin-readiness';
import { useEnsureProjectReadinessAssessments } from '@/features/admin/hooks/use-ensure-project-readiness';
import { CatalogPagination } from '@/features/catalog/components/catalog-pagination';
import { usePathname, useRouter } from '@/i18n/navigation';
import { useDebouncedValue } from '@/shared/hooks/use-debounced-value';
import { usePersistedViewMode } from '@/shared/hooks/use-persisted-view-mode';
import { EmptyState } from '@/shared/ui/empty-state';
import { ListPageHeader } from '@/shared/ui/list-page-header';
import { ViewModeToggle } from '@/shared/ui/view-mode-toggle';

/**
 * Admin readiness list — one card per project, filtered by company/project.
 */
export const ReadinessAssessmentsListPage = () => {
  const t = useTranslations('Admin.readiness.assessments');
  const tCommon = useTranslations('Common.integratedSearch');
  const tDetail = useTranslations('Admin.readiness.detail');
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const page = parseReadinessListPage(searchParams.get('page'));
  const companyId = searchParams.get('companyId')?.trim() || undefined;
  const projectId = searchParams.get('projectId')?.trim() || undefined;
  const pageSize = ADMIN_INVENTORY_DEFAULT_PAGE_SIZE;
  const [search, setSearch] = useState('');
  const trimmedSearch = search.trim();
  const debouncedSearch = useDebouncedValue(trimmedSearch, ADMIN_PROJECTS_SEARCH_DEBOUNCE_MS);
  const activeSearch = trimmedSearch.length === 0 ? '' : debouncedSearch;
  const [modalTarget, setModalTarget] = useState<ReadinessManagementTarget | null>(null);
  const { viewMode, effectiveViewMode, setViewMode } = usePersistedViewMode(
    ADMIN_VIEW_MODE_KEYS.readinessAssessments,
  );
  const hrefState = { page, companyId, projectId };

  const companiesQuery = useAdminBuilderCompaniesQuery(ADMIN_COMPANIES_MAX_PAGE_SIZE);
  const pickerQuery = useAdminProjectsQuery({
    page: 1,
    pageSize: ADMIN_COMPANIES_MAX_PAGE_SIZE,
    ...(companyId ? { companyId } : {}),
  });
  const projectsQuery = useAdminProjectsQuery({
    page,
    pageSize,
    ...(companyId ? { companyId } : {}),
    ...(activeSearch ? { search: activeSearch } : {}),
  });
  const assessmentsQuery = useAdminReadinessAssessmentsQuery({
    page: 1,
    pageSize: ADMIN_COMPANIES_MAX_PAGE_SIZE,
    targetType: 'project',
    ...(companyId ? { builderCompanyId: companyId } : {}),
    ...(projectId ? { projectId } : {}),
  });
  const isEnsuringProjects = useEnsureProjectReadinessAssessments(projectsQuery.isSuccess);

  const builderCompanies = useMemo(() => {
    const companies = companiesQuery.data?.data ?? [];
    return companies.slice().sort((a, b) => a.name.localeCompare(b.name));
  }, [companiesQuery.data]);

  const pickerProjects = pickerQuery.data?.data ?? [];
  const pageProjects = projectsQuery.data?.data ?? [];
  const visibleProjects = useMemo(
    () => resolveVisibleProjects(projectId, pickerProjects, pageProjects),
    [pageProjects, pickerProjects, projectId],
  );

  const companyLookup = useMemo(() => {
    const map = new Map<string, { name: string; logoUrl: string | null }>();
    for (const company of builderCompanies) {
      map.set(company.id, { name: company.name, logoUrl: company.logoUrl });
    }
    for (const project of visibleProjects) {
      if (!map.has(project.builderCompanyId)) {
        map.set(project.builderCompanyId, { name: project.companyName, logoUrl: null });
      }
    }
    return map;
  }, [builderCompanies, visibleProjects]);

  const assessmentByProjectId = useMemo(
    () => buildProjectAssessmentMap(assessmentsQuery.data?.data ?? []),
    [assessmentsQuery.data?.data],
  );

  const visibleAssessments = useMemo(() => {
    const rows: ReadinessAssessmentListItem[] = [];
    for (const project of visibleProjects) {
      const assessment = assessmentByProjectId.get(project.id);
      if (assessment) {
        rows.push(assessment);
      }
    }
    return rows;
  }, [assessmentByProjectId, visibleProjects]);

  const filterConfigs = useMemo(
    () =>
      buildReadinessAssessmentFilterConfigs(builderCompanies, pickerProjects, {
        company: t('filters.company'),
        allCompanies: t('filters.allCompanies'),
        project: t('filters.project'),
        allProjects: t('filters.allProjects'),
      }),
    [builderCompanies, pickerProjects, t],
  );

  const openAssessment = (assessment: ReadinessAssessmentListItem): void => {
    const companyName =
      companyLookup.get(assessment.builderCompanyId)?.name ?? assessment.builderCompanyId;
    const projectLabel = assessment.projectName ?? tDetail('targetTypes.project');
    setModalTarget({
      kind: 'assessment',
      assessmentId: assessment.id,
      subtitle: `${projectLabel} · ${companyName}`,
    });
  };

  const buildHref = (next: {
    page?: number;
    companyId?: string | null;
    projectId?: string | null;
  }): string => buildReadinessListHref(pathname, next, hrefState);

  const handleSearchChange = (value: string): void => {
    setSearch(value);
    if (page > READINESS_LIST_FIRST_PAGE) {
      router.replace(buildHref({ page: READINESS_LIST_FIRST_PAGE }));
    }
  };

  const isListLoading =
    companiesQuery.isLoading ||
    pickerQuery.isLoading ||
    projectsQuery.isLoading ||
    assessmentsQuery.isLoading ||
    isEnsuringProjects;
  const isListError =
    companiesQuery.isError || pickerQuery.isError || projectsQuery.isError || assessmentsQuery.isError;

  if (isListLoading) {
    return <p className="text-sm text-ink-secondary">{t('loading')}</p>;
  }

  if (isListError) {
    return (
      <p role="alert" className="text-sm text-danger">
        {t('error')}
      </p>
    );
  }

  const projectsMeta = projectId
    ? {
        page: READINESS_LIST_FIRST_PAGE,
        totalPages: visibleProjects.length > 0 ? 1 : 0,
        total: visibleProjects.length,
      }
    : (projectsQuery.data?.meta ?? { page, totalPages: 0, total: 0 });

  return (
    <div className="flex flex-col gap-6">
      <ListPageHeader
        icon={ClipboardCheck}
        title={t('title')}
        subtitle={t('subtitle', { count: projectsMeta.total })}
        search={search}
        searchPlaceholder={t('searchPlaceholder')}
        searchAriaLabel={tCommon('searchLabel')}
        filters={filterConfigs}
        filterValues={{
          [READINESS_ASSESSMENT_FILTER_COMPANY_KEY]: companyId ?? '',
          [READINESS_ASSESSMENT_FILTER_PROJECT_KEY]: projectId ?? '',
        }}
        onSearchChange={handleSearchChange}
        onFilterChange={(key, value) => {
          if (key === READINESS_ASSESSMENT_FILTER_COMPANY_KEY) {
            router.replace(
              buildHref({
                page: READINESS_LIST_FIRST_PAGE,
                companyId: value || null,
                projectId: null,
              }),
            );
            return;
          }
          if (key === READINESS_ASSESSMENT_FILTER_PROJECT_KEY) {
            router.replace(
              buildHref({ page: READINESS_LIST_FIRST_PAGE, projectId: value || null }),
            );
          }
        }}
        onClearAll={() => {
          setSearch('');
          router.replace(
            buildHref({
              page: READINESS_LIST_FIRST_PAGE,
              companyId: null,
              projectId: null,
            }),
          );
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
        page={projectsMeta.page}
        totalPages={projectsMeta.totalPages}
        previousHref={
          projectsMeta.page > READINESS_LIST_FIRST_PAGE
            ? buildHref({ page: projectsMeta.page - 1 })
            : null
        }
        nextHref={
          projectsMeta.page < projectsMeta.totalPages
            ? buildHref({ page: projectsMeta.page + 1 })
            : null
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
