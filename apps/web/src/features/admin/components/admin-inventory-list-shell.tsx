'use client';

import type { ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';

import {
  ADMIN_COMPANIES_MAX_PAGE_SIZE,
  ADMIN_INVENTORY_DEFAULT_PAGE_SIZE,
} from '@/features/admin/constants';
import { useAdminCompaniesQuery } from '@/features/admin/hooks/use-admin-companies';
import { useAdminBuildingsQuery } from '@/features/admin/hooks/use-admin-inventory';
import { CatalogPagination } from '@/features/catalog/components/catalog-pagination';
import { usePathname, useRouter } from '@/i18n/navigation';
import type { IntegratedSearchFilterConfig } from '@/shared/ui/integrated-search-filters.types';
import { ListPageHeader } from '@/shared/ui/list-page-header';
import type { ViewMode } from '@/shared/ui/view-mode';
import { ViewModeToggle } from '@/shared/ui/view-mode-toggle';

const ADMIN_INVENTORY_FILTER_COMPANY_KEY = 'companyId';
const ADMIN_INVENTORY_FILTER_BUILDING_KEY = 'buildingId';

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
  /** Floors / apartments hubs: company + building cascading filters. */
  showBuildingFilter?: boolean | undefined;
  headerActions?: ReactNode | undefined;
  viewMode?: ViewMode | undefined;
  onViewModeChange?: ((mode: ViewMode) => void) | undefined;
};

const parsePage = (raw: string | null): number => {
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return 1;
  }
  return Math.floor(parsed);
};

/**
 * Shared chrome for admin inventory hubs (buildings / floors / apartments).
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
  const [search, setSearch] = useState('');
  const companiesQuery = useAdminCompaniesQuery(1, ADMIN_COMPANIES_MAX_PAGE_SIZE);
  const buildingsQuery = useAdminBuildingsQuery(1, ADMIN_COMPANIES_MAX_PAGE_SIZE, companyId);

  const builderCompanies = useMemo(() => {
    const companies = companiesQuery.data?.data ?? [];
    return companies
      .filter((company) => company.type === 'builder')
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name));
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
  }): string => {
    const params = new URLSearchParams();
    const nextCompanyId = next.companyId === undefined ? companyId : next.companyId || undefined;
    const nextBuildingId =
      next.buildingId === undefined ? buildingId : next.buildingId || undefined;
    const nextPage = next.page ?? page;

    if (nextCompanyId) {
      params.set('companyId', nextCompanyId);
    }
    if (showBuildingFilter && nextBuildingId) {
      params.set('buildingId', nextBuildingId);
    }
    if (nextPage > 1) {
      params.set('page', String(nextPage));
    }
    const query = params.toString();
    return query.length > 0 ? `${pathname}?${query}` : pathname;
  };

  const filterConfigs = useMemo((): IntegratedSearchFilterConfig[] => {
    const configs: IntegratedSearchFilterConfig[] = [
      {
        key: ADMIN_INVENTORY_FILTER_COMPANY_KEY,
        label: t('filters.company'),
        allOptionLabel: t('filters.allCompanies'),
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
        search={search}
        searchPlaceholder={tCommon('searchPlaceholder')}
        searchAriaLabel={tCommon('searchLabel')}
        filters={filterConfigs}
        filterValues={{
          [ADMIN_INVENTORY_FILTER_COMPANY_KEY]: companyId ?? '',
          [ADMIN_INVENTORY_FILTER_BUILDING_KEY]: buildingId ?? '',
        }}
        onSearchChange={setSearch}
        onFilterChange={(key, value) => {
          if (key === ADMIN_INVENTORY_FILTER_COMPANY_KEY) {
            router.replace(buildListHref({ page: 1, companyId: value || null, buildingId: null }));
            return;
          }
          if (key === ADMIN_INVENTORY_FILTER_BUILDING_KEY) {
            router.replace(buildListHref({ page: 1, buildingId: value || null }));
          }
        }}
        onClearAll={() => {
          setSearch('');
          router.replace(buildListHref({ page: 1, companyId: null, buildingId: null }));
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
        buildHref={(nextPage) => buildListHref({ page: nextPage })}
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
} => {
  const searchParams = useSearchParams();
  const companyId = searchParams.get('companyId')?.trim() || undefined;
  const buildingId = searchParams.get('buildingId')?.trim() || undefined;
  return {
    page: parsePage(searchParams.get('page')),
    pageSize: ADMIN_INVENTORY_DEFAULT_PAGE_SIZE,
    ...(companyId ? { companyId } : {}),
    ...(buildingId ? { buildingId } : {}),
  };
};
