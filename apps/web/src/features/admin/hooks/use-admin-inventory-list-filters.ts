'use client';

import type { ApartmentSalesStatus } from '@toonexpo/contracts';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';

import {
  ADMIN_INVENTORY_FILTER_BUILDING_KEY,
  ADMIN_INVENTORY_FILTER_COMPANY_KEY,
  ADMIN_INVENTORY_FILTER_FLOOR_KEY,
  ADMIN_INVENTORY_FILTER_SALES_STATUS_KEY,
  decodeIntegratedFilterIds,
  encodeIntegratedFilterIds,
  parseIdListParam,
  parseSalesStatusParam,
  resolveDraftOrAppliedIds,
} from '@/features/admin/components/admin-inventory-list-filters';
import {
  buildAdminInventoryFilterConfigs,
  buildAdminInventoryListHref,
} from '@/features/admin/components/admin-inventory-list-href';
import { ADMIN_COMPANIES_MAX_PAGE_SIZE } from '@/features/admin/constants';
import { useAdminBuilderCompaniesQuery } from '@/features/admin/hooks/use-admin-companies';
import {
  useAdminBuildingsQuery,
  useAdminFloorsQuery,
} from '@/features/admin/hooks/use-admin-inventory';
import { usePathname, useRouter } from '@/i18n/navigation';
import type { IntegratedSearchFilterConfig } from '@/shared/ui/integrated-search-filters.types';

const FIRST_PAGE = 1;

type UseAdminInventoryListFiltersParams = {
  page: number;
  showBuildingFilter: boolean;
  showFloorFilter: boolean;
  showSalesStatusFilter: boolean;
};

type InventoryHrefNext = {
  page?: number;
  companyIds?: string[] | null;
  buildingIds?: string[] | null;
  floorIds?: string[] | null;
  projectId?: string | null;
  salesStatus?: ApartmentSalesStatus | null;
};

/**
 * Filter options, URL builders, and apply handlers for admin inventory hubs.
 */
export const useAdminInventoryListFilters = ({
  page,
  showBuildingFilter,
  showFloorFilter,
  showSalesStatusFilter,
}: UseAdminInventoryListFiltersParams): {
  filterConfigs: IntegratedSearchFilterConfig[];
  filterValues: Record<string, string>;
  filtersLoading: boolean;
  panelDraftFilters: Record<string, string> | null;
  setPanelDraftFilters: (draft: Record<string, string> | null) => void;
  buildListHref: (next: InventoryHrefNext) => string;
  applyDraftFilters: (draft: Record<string, string>) => void;
  onFilterChange: (key: string, value: string) => void;
  clearFilters: () => void;
} => {
  const t = useTranslations('Admin.projects');
  const tApartments = useTranslations('Admin.apartments');
  const tCommon = useTranslations('Common.integratedSearch');
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const companyIds = parseIdListParam(searchParams, 'companyId');
  const buildingIds = parseIdListParam(searchParams, 'buildingId');
  const floorIds = parseIdListParam(searchParams, 'floorId');
  const salesStatus = parseSalesStatusParam(searchParams.get('salesStatus'));
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
    salesStatus,
    showBuildingFilter,
    showFloorFilter,
    showSalesStatusFilter,
  };

  const buildListHref = (next: InventoryHrefNext): string =>
    buildAdminInventoryListHref({ ...hrefContext, next });

  const filterConfigs = useMemo(
    () =>
      buildAdminInventoryFilterConfigs({
        builderCompanies,
        buildingOptions,
        floorOptions,
        effectiveBuildingIds,
        showBuildingFilter,
        showFloorFilter,
        showSalesStatusFilter,
        labels: {
          builder: t('filters.builder'),
          allBuilders: t('filters.allBuilders'),
          building: t('filters.building'),
          allBuildings: t('filters.allBuildings'),
          floor: t('filters.floor'),
          allFloors: t('filters.allFloors'),
          selectBuildingFirst: t('filters.selectBuildingFirst'),
          salesStatus: t('filters.salesStatus'),
          allSalesStatuses: t('filters.allSalesStatuses'),
          salesStatusOption: (status) => tApartments(`sales.${status}`),
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
      showSalesStatusFilter,
      t,
      tApartments,
      tCommon,
    ],
  );

  const filterValues = {
    [ADMIN_INVENTORY_FILTER_COMPANY_KEY]: encodeIntegratedFilterIds(companyIds),
    [ADMIN_INVENTORY_FILTER_BUILDING_KEY]: encodeIntegratedFilterIds(buildingIds),
    [ADMIN_INVENTORY_FILTER_FLOOR_KEY]: encodeIntegratedFilterIds(floorIds),
    [ADMIN_INVENTORY_FILTER_SALES_STATUS_KEY]: salesStatus ?? '',
  };

  const applyDraftFilters = (draft: Record<string, string>): void => {
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
        salesStatus: showSalesStatusFilter
          ? (parseSalesStatusParam(draft[ADMIN_INVENTORY_FILTER_SALES_STATUS_KEY]) ?? null)
          : null,
        projectId: null,
      }),
    );
  };

  const onFilterChange = (key: string, value: string): void => {
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
      router.replace(buildListHref({ page: FIRST_PAGE, buildingIds: ids, floorIds: [] }));
      return;
    }
    if (key === ADMIN_INVENTORY_FILTER_FLOOR_KEY) {
      router.replace(buildListHref({ page: FIRST_PAGE, floorIds: ids }));
      return;
    }
    if (key === ADMIN_INVENTORY_FILTER_SALES_STATUS_KEY) {
      router.replace(
        buildListHref({
          page: FIRST_PAGE,
          salesStatus: parseSalesStatusParam(value) ?? null,
        }),
      );
    }
  };

  const clearFilters = (): void => {
    router.replace(
      buildListHref({
        page: FIRST_PAGE,
        companyIds: [],
        buildingIds: [],
        floorIds: [],
        salesStatus: null,
        projectId: null,
      }),
    );
  };

  return {
    filterConfigs,
    filterValues,
    filtersLoading: companiesQuery.isLoading && !companiesQuery.data,
    panelDraftFilters,
    setPanelDraftFilters,
    buildListHref,
    applyDraftFilters,
    onFilterChange,
    clearFilters,
  };
};
