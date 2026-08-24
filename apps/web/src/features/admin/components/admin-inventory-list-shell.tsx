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
  decodeIntegratedFilterIds,
  encodeIntegratedFilterIds,
  parseIdListParam,
  resolveDraftOrAppliedIds,
} from '@/features/admin/components/admin-inventory-list-filters';
import {
  buildAdminInventoryFilterConfigs,
  buildAdminInventoryListHref,
} from '@/features/admin/components/admin-inventory-list-href';
import {
  ADMIN_COMPANIES_MAX_PAGE_SIZE,
  ADMIN_INVENTORY_DEFAULT_PAGE_SIZE,
  ADMIN_INVENTORY_SEARCH_WIDTH_CLASS,
} from '@/features/admin/constants';
import { useAdminBuilderCompaniesQuery } from '@/features/admin/hooks/use-admin-companies';
import {
  useAdminBuildingsQuery,
  useAdminFloorsQuery,
} from '@/features/admin/hooks/use-admin-inventory';
import { CatalogPagination } from '@/features/catalog/components/catalog-pagination';
import { usePathname, useRouter } from '@/i18n/navigation';
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
  showBuildingFilter?: boolean | undefined;
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
  const companyIds = parseIdListParam(searchParams, 'companyId');
  const buildingIds = parseIdListParam(searchParams, 'buildingId');
  const floorIds = parseIdListParam(searchParams, 'floorId');
  const projectId = searchParams.get('projectId')?.trim() || undefined;
  const [panelDraftFilters, setPanelDraftFilters] = useState<Record<string, string> | null>(
    null,
  );
  const companiesQuery = useAdminBuilderCompaniesQuery(ADMIN_COMPANIES_MAX_PAGE_SIZE);

  const effectiveCompanyIds = resolveDraftOrAppliedIds(
    panelDraftFilters,
    ADMIN_INVENTORY_FILTER_COMPANY_KEY,
    companyIds,
  );
  const effectiveBuildingIds = resolveDraftOrAppliedIds(
    panelDraftFilters,
    ADMIN_INVENTORY_FILTER_BUILDING_KEY,
    buildingIds,
  );

  const buildingsQuery = useAdminBuildingsQuery(
    1,
    ADMIN_COMPANIES_MAX_PAGE_SIZE,
    effectiveCompanyIds,
  );
  const floorsQuery = useAdminFloorsQuery(
    1,
    ADMIN_COMPANIES_MAX_PAGE_SIZE,
    effectiveCompanyIds,
    effectiveBuildingIds,
    undefined,
    { enabled: showFloorFilter && effectiveBuildingIds.length > 0 },
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

  const hrefContext = {
    pathname,
    page,
    companyIds,
    buildingIds,
    floorIds,
    projectId,
    showBuildingFilter,
    showFloorFilter,
  };

  const buildListHref = (next: {
    page?: number;
    companyIds?: string[] | null;
    buildingIds?: string[] | null;
    floorIds?: string[] | null;
    projectId?: string | null;
  }): string => buildAdminInventoryListHref({ ...hrefContext, next });

  const filterConfigs = useMemo(
    () =>
      buildAdminInventoryFilterConfigs({
        builderCompanies,
        buildingOptions,
        floorOptions,
        effectiveBuildingIds,
        showBuildingFilter,
        showFloorFilter,
        labels: {
          builder: t('filters.builder'),
          allBuilders: t('filters.allBuilders'),
          building: t('filters.building'),
          allBuildings: t('filters.allBuildings'),
          floor: t('filters.floor'),
          allFloors: t('filters.allFloors'),
          selectBuildingFirst: t('filters.selectBuildingFirst'),
          selectedCount: (count) => tCommon('selectedCount', { count }),
        },
      }),
    [
      builderCompanies,
      buildingOptions,
      effectiveBuildingIds,
      floorOptions,
      showBuildingFilter,
      showFloorFilter,
      t,
      tCommon,
    ],
  );

  const filtersLoading = companiesQuery.isLoading && !companiesQuery.data;

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
        searchClassName={ADMIN_INVENTORY_SEARCH_WIDTH_CLASS}
        filters={filterConfigs}
        filterValues={{
          [ADMIN_INVENTORY_FILTER_COMPANY_KEY]: encodeIntegratedFilterIds(companyIds),
          [ADMIN_INVENTORY_FILTER_BUILDING_KEY]: encodeIntegratedFilterIds(buildingIds),
          [ADMIN_INVENTORY_FILTER_FLOOR_KEY]: encodeIntegratedFilterIds(floorIds),
        }}
        onSearchChange={onSearchChange}
        onDraftFilterChange={setPanelDraftFilters}
        onPanelOpenChange={(open) => {
          if (!open) {
            setPanelDraftFilters(null);
          }
        }}
        onApplyFilters={(draft) => {
          router.replace(
            buildListHref({
              page: FIRST_PAGE,
              companyIds: decodeIntegratedFilterIds(draft[ADMIN_INVENTORY_FILTER_COMPANY_KEY]),
              buildingIds: showBuildingFilter
                ? decodeIntegratedFilterIds(draft[ADMIN_INVENTORY_FILTER_BUILDING_KEY])
                : [],
              floorIds: showFloorFilter
                ? decodeIntegratedFilterIds(draft[ADMIN_INVENTORY_FILTER_FLOOR_KEY])
                : [],
              projectId: null,
            }),
          );
        }}
        onFilterChange={(key, value) => {
          const ids = decodeIntegratedFilterIds(value);
          if (key === ADMIN_INVENTORY_FILTER_COMPANY_KEY) {
            router.replace(
              buildListHref({
                page: FIRST_PAGE,
                companyIds: ids,
                buildingIds: [],
                floorIds: [],
                projectId: null,
              }),
            );
            return;
          }
          if (key === ADMIN_INVENTORY_FILTER_BUILDING_KEY) {
            router.replace(
              buildListHref({ page: FIRST_PAGE, buildingIds: ids, floorIds: [] }),
            );
            return;
          }
          if (key === ADMIN_INVENTORY_FILTER_FLOOR_KEY) {
            router.replace(buildListHref({ page: FIRST_PAGE, floorIds: ids }));
          }
        }}
        onClearAll={() => {
          onSearchChange('');
          router.replace(
            buildListHref({
              page: FIRST_PAGE,
              companyIds: [],
              buildingIds: [],
              floorIds: [],
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
  companyIds: string[];
  buildingIds: string[];
  floorIds: string[];
  companyId?: string;
  buildingId?: string;
  floorId?: string;
  projectId?: string;
} => {
  const searchParams = useSearchParams();
  const companyIds = parseIdListParam(searchParams, 'companyId');
  const buildingIds = parseIdListParam(searchParams, 'buildingId');
  const floorIds = parseIdListParam(searchParams, 'floorId');
  const projectId = searchParams.get('projectId')?.trim() || undefined;
  return {
    page: parsePage(searchParams.get('page')),
    pageSize: ADMIN_INVENTORY_DEFAULT_PAGE_SIZE,
    companyIds,
    buildingIds,
    floorIds,
    ...(companyIds[0] ? { companyId: companyIds[0] } : {}),
    ...(buildingIds[0] ? { buildingId: buildingIds[0] } : {}),
    ...(floorIds[0] ? { floorId: floorIds[0] } : {}),
    ...(projectId ? { projectId } : {}),
  };
};
