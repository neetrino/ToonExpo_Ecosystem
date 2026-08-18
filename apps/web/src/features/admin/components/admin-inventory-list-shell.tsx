'use client';

import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { useMemo } from 'react';

import {
  ADMIN_COMPANIES_MAX_PAGE_SIZE,
  ADMIN_INVENTORY_DEFAULT_PAGE_SIZE,
} from '@/features/admin/constants';
import { useAdminBuilderCompaniesQuery } from '@/features/admin/hooks/use-admin-companies';
import { useAdminBuildingsQuery } from '@/features/admin/hooks/use-admin-inventory';
import { CatalogPagination } from '@/features/catalog/components/catalog-pagination';
import { usePathname, useRouter } from '@/i18n/navigation';
import type { IntegratedSearchFilterConfig } from '@/shared/ui/integrated-search-filters.types';
import { ListPageHeader } from '@/shared/ui/list-page-header';
import type { ViewMode } from '@/shared/ui/view-mode';
import { ViewModeToggle } from '@/shared/ui/view-mode-toggle';

const ADMIN_INVENTORY_FILTER_COMPANY_KEY = 'companyId';
const ADMIN_INVENTORY_FILTER_BUILDING_KEY = 'buildingId';
const FIRST_PAGE = 1;

type AdminInventoryListShellProps = {
  title: string;
  subtitle: string;
  empty: string;
  loading: string;
  error: string;
  isLoading: boolean;
  isError: boolean;
  total: number;
  page: number;
  totalPages: number;
  children: ReactNode;
  search: string;
  onSearchChange: (value: string) => void;
  icon?: LucideIcon | undefined;
  /** Floors / apartments hubs: company + building cascading filters. */
  showBuildingFilter?: boolean | undefined;
  headerActions?: ReactNode | undefined;
  viewMode?: ViewMode | undefined;
  onViewModeChange?: ((mode: ViewMode) => void) | undefined;
};

const parsePage = (raw: string | null): number => {
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed < FIRST_PAGE) {
    return FIRST_PAGE;
  }
  return Math.floor(parsed);
};

/**
 * Shared chrome for admin inventory hubs (buildings / floors / apartments).
 * Search is controlled by the page so list queries can debounce and hit the API.
 */
export const AdminInventoryListShell = ({
  title,
  subtitle,
  empty,
  loading,
  error,
  isLoading,
  isError,
  total,
  page,
  totalPages,
  children,
  search,
  onSearchChange,
  icon,
  showBuildingFilter = false,
  headerActions,
  viewMode,
  onViewModeChange,
}: AdminInventoryListShellProps) => {
  const t = useTranslations('Admin.projects');
  const tCommon = useTranslations('Common.integratedSearch');
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const companyId = searchParams.get('companyId')?.trim() || undefined;
  const buildingId = searchParams.get('buildingId')?.trim() || undefined;
  const projectId = searchParams.get('projectId')?.trim() || undefined;
  const companiesQuery = useAdminBuilderCompaniesQuery(ADMIN_COMPANIES_MAX_PAGE_SIZE);
  const buildingsQuery = useAdminBuildingsQuery(1, ADMIN_COMPANIES_MAX_PAGE_SIZE, companyId);

  const builderCompanies = useMemo(() => {
    const companies = companiesQuery.data?.data ?? [];
    return companies.slice().sort((a, b) => a.name.localeCompare(b.name));
  }, [companiesQuery.data]);

  const buildingOptions = useMemo(() => {
    const buildings = buildingsQuery.data?.data ?? [];
    return buildings.slice().sort((a, b) => {
      const byProject = a.projectName.localeCompare(b.projectName);
      if (byProject !== 0) {
        return byProject;
      }
      return a.name.localeCompare(b.name);
    });
  }, [buildingsQuery.data]);

  const buildListHref = (next: {
    page?: number;
    companyId?: string | null;
    buildingId?: string | null;
    projectId?: string | null;
  }): string => {
    const params = new URLSearchParams();
    const nextCompanyId = next.companyId === undefined ? companyId : next.companyId || undefined;
    const nextBuildingId =
      next.buildingId === undefined ? buildingId : next.buildingId || undefined;
    const nextProjectId = next.projectId === undefined ? projectId : next.projectId || undefined;
    const nextPage = next.page ?? page;

    if (nextCompanyId) {
      params.set('companyId', nextCompanyId);
    }
    if (showBuildingFilter && nextBuildingId) {
      params.set('buildingId', nextBuildingId);
    }
    if (nextProjectId) {
      params.set('projectId', nextProjectId);
    }
    if (nextPage > FIRST_PAGE) {
      params.set('page', String(nextPage));
    }
    const query = params.toString();
    return query.length > 0 ? `${pathname}?${query}` : pathname;
  };

  const filterConfigs = useMemo((): IntegratedSearchFilterConfig[] => {
    const configs: IntegratedSearchFilterConfig[] = [
      {
        key: ADMIN_INVENTORY_FILTER_COMPANY_KEY,
        label: t('filters.builder'),
        allOptionLabel: t('filters.allBuilders'),
        searchable: true,
        options: builderCompanies.map((company) => ({
          value: company.id,
          label: company.name,
        })),
      },
    ];
    if (showBuildingFilter) {
      configs.push({
        key: ADMIN_INVENTORY_FILTER_BUILDING_KEY,
        label: t('filters.building'),
        allOptionLabel: t('filters.allBuildings'),
        searchable: true,
        options: buildingOptions.map((building) => ({
          value: building.id,
          label: `${building.name} · ${building.projectName}`,
        })),
      });
    }
    return configs;
  }, [builderCompanies, buildingOptions, showBuildingFilter, t]);

  const filtersLoading =
    companiesQuery.isLoading || (showBuildingFilter && buildingsQuery.isLoading);

  if (isLoading || filtersLoading) {
    return <p className="text-sm text-ink-secondary">{loading}</p>;
  }

  if (isError) {
    return (
      <p role="alert" className="text-sm text-danger">
        {error}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <ListPageHeader
        title={title}
        subtitle={subtitle}
        {...(icon ? { icon } : {})}
        search={search}
        searchPlaceholder={tCommon('searchPlaceholder')}
        searchAriaLabel={tCommon('searchLabel')}
        filters={filterConfigs}
        filterValues={{
          [ADMIN_INVENTORY_FILTER_COMPANY_KEY]: companyId ?? '',
          [ADMIN_INVENTORY_FILTER_BUILDING_KEY]: buildingId ?? '',
        }}
        onSearchChange={onSearchChange}
        onFilterChange={(key, value) => {
          if (key === ADMIN_INVENTORY_FILTER_COMPANY_KEY) {
            router.replace(
              buildListHref({
                page: FIRST_PAGE,
                companyId: value || null,
                buildingId: null,
                projectId: null,
              }),
            );
            return;
          }
          if (key === ADMIN_INVENTORY_FILTER_BUILDING_KEY) {
            router.replace(buildListHref({ page: FIRST_PAGE, buildingId: value || null }));
          }
        }}
        onClearAll={() => {
          onSearchChange('');
          router.replace(
            buildListHref({
              page: FIRST_PAGE,
              companyId: null,
              buildingId: null,
              projectId: null,
            }),
          );
        }}
        actions={
          <>
            {viewMode && onViewModeChange ? (
              <ViewModeToggle value={viewMode} onChange={onViewModeChange} />
            ) : null}
            {headerActions}
          </>
        }
      />

      {total === 0 ? <p className="text-sm text-ink-secondary">{empty}</p> : children}

      <CatalogPagination
        page={page}
        totalPages={totalPages}
        previousHref={page > FIRST_PAGE ? buildListHref({ page: page - 1 }) : null}
        nextHref={page < totalPages ? buildListHref({ page: page + 1 }) : null}
        previousLabel={t('pagination.previous')}
        nextLabel={t('pagination.next')}
        ariaLabel={t('pagination.ariaLabel')}
      />
    </div>
  );
};

export const useAdminInventoryListParams = (): {
  page: number;
  pageSize: number;
  companyId?: string;
  buildingId?: string;
  projectId?: string;
} => {
  const searchParams = useSearchParams();
  const companyId = searchParams.get('companyId')?.trim() || undefined;
  const buildingId = searchParams.get('buildingId')?.trim() || undefined;
  const projectId = searchParams.get('projectId')?.trim() || undefined;
  return {
    page: parsePage(searchParams.get('page')),
    pageSize: ADMIN_INVENTORY_DEFAULT_PAGE_SIZE,
    ...(companyId ? { companyId } : {}),
    ...(buildingId ? { buildingId } : {}),
    ...(projectId ? { projectId } : {}),
  };
};
