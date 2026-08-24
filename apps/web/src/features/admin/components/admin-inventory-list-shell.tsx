'use client';

import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';

import {
  ADMIN_INVENTORY_FILTER_BUILDING_KEY,
  ADMIN_INVENTORY_FILTER_COMPANY_KEY,
  ADMIN_INVENTORY_FILTER_FLOOR_KEY,
  formatFloorOptionLabel,
  resolveDraftOrApplied,
} from '@/features/admin/components/admin-inventory-list-filters';
import {
  ADMIN_COMPANIES_MAX_PAGE_SIZE,
  ADMIN_INVENTORY_DEFAULT_PAGE_SIZE,
} from '@/features/admin/constants';
import { useAdminBuilderCompaniesQuery } from '@/features/admin/hooks/use-admin-companies';
import {
  useAdminBuildingsQuery,
  useAdminFloorsQuery,
} from '@/features/admin/hooks/use-admin-inventory';
import { CatalogPagination } from '@/features/catalog/components/catalog-pagination';
import { usePathname, useRouter } from '@/i18n/navigation';
import type { IntegratedSearchFilterConfig } from '@/shared/ui/integrated-search-filters.types';
import { ListPageHeader } from '@/shared/ui/list-page-header';
import type { ViewMode } from '@/shared/ui/view-mode';
import { ViewModeToggle } from '@/shared/ui/view-mode-toggle';

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
  /** Apartments hub: floor filter (requires building filter). */
  showFloorFilter?: boolean | undefined;
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
  showFloorFilter = false,
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
  const floorId = searchParams.get('floorId')?.trim() || undefined;
  const projectId = searchParams.get('projectId')?.trim() || undefined;
  const [panelDraftFilters, setPanelDraftFilters] = useState<Record<string, string> | null>(
    null,
  );
  const companiesQuery = useAdminBuilderCompaniesQuery(ADMIN_COMPANIES_MAX_PAGE_SIZE);

  const effectiveCompanyId = resolveDraftOrApplied(
    panelDraftFilters,
    ADMIN_INVENTORY_FILTER_COMPANY_KEY,
    companyId,
  );
  const effectiveBuildingId = resolveDraftOrApplied(
    panelDraftFilters,
    ADMIN_INVENTORY_FILTER_BUILDING_KEY,
    buildingId,
  );

  const buildingsQuery = useAdminBuildingsQuery(1, ADMIN_COMPANIES_MAX_PAGE_SIZE, effectiveCompanyId);
  const floorsQuery = useAdminFloorsQuery(
    1,
    ADMIN_COMPANIES_MAX_PAGE_SIZE,
    effectiveCompanyId,
    effectiveBuildingId,
    undefined,
    { enabled: showFloorFilter },
  );

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

  const floorOptions = useMemo(() => {
    const floors = floorsQuery.data?.data ?? [];
    return floors.slice().sort((a, b) => {
      const byBuilding = a.buildingName.localeCompare(b.buildingName);
      if (byBuilding !== 0) {
        return byBuilding;
      }
      return a.number - b.number;
    });
  }, [floorsQuery.data]);

  const buildListHref = (next: {
    page?: number;
    companyId?: string | null;
    buildingId?: string | null;
    floorId?: string | null;
    projectId?: string | null;
  }): string => {
    const params = new URLSearchParams();
    const nextCompanyId = next.companyId === undefined ? companyId : next.companyId || undefined;
    const nextBuildingId =
      next.buildingId === undefined ? buildingId : next.buildingId || undefined;
    const nextFloorId = next.floorId === undefined ? floorId : next.floorId || undefined;
    const nextProjectId = next.projectId === undefined ? projectId : next.projectId || undefined;
    const nextPage = next.page ?? page;

    if (nextCompanyId) {
      params.set('companyId', nextCompanyId);
    }
    if (showBuildingFilter && nextBuildingId) {
      params.set('buildingId', nextBuildingId);
    }
    if (showFloorFilter && nextFloorId) {
      params.set('floorId', nextFloorId);
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
        resetsKeys: showBuildingFilter
          ? [
              ADMIN_INVENTORY_FILTER_BUILDING_KEY,
              ...(showFloorFilter ? [ADMIN_INVENTORY_FILTER_FLOOR_KEY] : []),
            ]
          : undefined,
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
        resetsKeys: showFloorFilter ? [ADMIN_INVENTORY_FILTER_FLOOR_KEY] : undefined,
        options: buildingOptions.map((building) => ({
          value: building.id,
          label: `${building.name} · ${building.projectName}`,
        })),
      });
    }
    if (showFloorFilter) {
      configs.push({
        key: ADMIN_INVENTORY_FILTER_FLOOR_KEY,
        label: t('filters.floor'),
        allOptionLabel: t('filters.allFloors'),
        searchable: true,
        options: floorOptions.map((floor) => ({
          value: floor.id,
          label: formatFloorOptionLabel(floor),
        })),
      });
    }
    return configs;
  }, [builderCompanies, buildingOptions, floorOptions, showBuildingFilter, showFloorFilter, t]);

  const filtersLoading =
    companiesQuery.isLoading ||
    (showBuildingFilter && buildingsQuery.isLoading) ||
    (showFloorFilter && floorsQuery.isLoading);

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
          [ADMIN_INVENTORY_FILTER_FLOOR_KEY]: floorId ?? '',
        }}
        onSearchChange={onSearchChange}
        onDraftFilterChange={setPanelDraftFilters}
        onPanelOpenChange={(open) => {
          if (!open) {
            setPanelDraftFilters(null);
          }
        }}
        onFilterChange={(key, value) => {
          if (key === ADMIN_INVENTORY_FILTER_COMPANY_KEY) {
            router.replace(
              buildListHref({
                page: FIRST_PAGE,
                companyId: value || null,
                buildingId: null,
                floorId: null,
                projectId: null,
              }),
            );
            return;
          }
          if (key === ADMIN_INVENTORY_FILTER_BUILDING_KEY) {
            router.replace(
              buildListHref({
                page: FIRST_PAGE,
                buildingId: value || null,
                floorId: null,
              }),
            );
            return;
          }
          if (key === ADMIN_INVENTORY_FILTER_FLOOR_KEY) {
            router.replace(buildListHref({ page: FIRST_PAGE, floorId: value || null }));
          }
        }}
        onClearAll={() => {
          onSearchChange('');
          router.replace(
            buildListHref({
              page: FIRST_PAGE,
              companyId: null,
              buildingId: null,
              floorId: null,
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
  floorId?: string;
  projectId?: string;
} => {
  const searchParams = useSearchParams();
  const companyId = searchParams.get('companyId')?.trim() || undefined;
  const buildingId = searchParams.get('buildingId')?.trim() || undefined;
  const floorId = searchParams.get('floorId')?.trim() || undefined;
  const projectId = searchParams.get('projectId')?.trim() || undefined;
  return {
    page: parsePage(searchParams.get('page')),
    pageSize: ADMIN_INVENTORY_DEFAULT_PAGE_SIZE,
    ...(companyId ? { companyId } : {}),
    ...(buildingId ? { buildingId } : {}),
    ...(floorId ? { floorId } : {}),
    ...(projectId ? { projectId } : {}),
  };
};
