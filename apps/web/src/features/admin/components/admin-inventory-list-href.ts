import type { IntegratedSearchFilterConfig } from '@/shared/ui/integrated-search-filters.types';
import type { AdminBuildingListItem, AdminFloorListItem } from '@toonexpo/contracts';

import {
  ADMIN_INVENTORY_FILTER_BUILDING_KEY,
  ADMIN_INVENTORY_FILTER_COMPANY_KEY,
  ADMIN_INVENTORY_FILTER_FLOOR_KEY,
  encodeIntegratedFilterIds,
  formatFloorOptionLabel,
} from '@/features/admin/components/admin-inventory-list-filters';

type CompanyOption = { id: string; name: string };

type BuildInventoryFilterConfigsParams = {
  builderCompanies: readonly CompanyOption[];
  buildingOptions: readonly AdminBuildingListItem[];
  floorOptions: readonly AdminFloorListItem[];
  effectiveBuildingIds: readonly string[];
  showBuildingFilter: boolean;
  showFloorFilter: boolean;
  labels: {
    builder: string;
    allBuilders: string;
    building: string;
    allBuildings: string;
    floor: string;
    allFloors: string;
    selectBuildingFirst: string;
    selectedCount: (count: number) => string;
  };
};

export const buildAdminInventoryFilterConfigs = ({
  builderCompanies,
  buildingOptions,
  floorOptions,
  effectiveBuildingIds,
  showBuildingFilter,
  showFloorFilter,
  labels,
}: BuildInventoryFilterConfigsParams): IntegratedSearchFilterConfig[] => {
  const configs: IntegratedSearchFilterConfig[] = [
    {
      key: ADMIN_INVENTORY_FILTER_COMPANY_KEY,
      label: labels.builder,
      allOptionLabel: labels.allBuilders,
      searchable: true,
      multiple: true,
      selectedCountLabel: labels.selectedCount,
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
      label: labels.building,
      allOptionLabel: labels.allBuildings,
      searchable: true,
      multiple: true,
      selectedCountLabel: labels.selectedCount,
      resetsKeys: showFloorFilter ? [ADMIN_INVENTORY_FILTER_FLOOR_KEY] : undefined,
      options: buildingOptions.map((building) => ({
        value: building.id,
        label: `${building.name} · ${building.projectName}`,
      })),
    });
  }
  if (showFloorFilter) {
    const floorRequiresBuilding = effectiveBuildingIds.length === 0;
    configs.push({
      key: ADMIN_INVENTORY_FILTER_FLOOR_KEY,
      label: labels.floor,
      allOptionLabel: labels.allFloors,
      searchable: true,
      multiple: true,
      selectedCountLabel: labels.selectedCount,
      disabled: floorRequiresBuilding,
      disabledPlaceholder: labels.selectBuildingFirst,
      options: floorRequiresBuilding
        ? []
        : floorOptions.map((floor) => ({
            value: floor.id,
            label: formatFloorOptionLabel(floor),
          })),
    });
  }
  return configs;
};

type BuildInventoryListHrefParams = {
  pathname: string;
  page: number;
  companyIds: readonly string[];
  buildingIds: readonly string[];
  floorIds: readonly string[];
  projectId: string | undefined;
  showBuildingFilter: boolean;
  showFloorFilter: boolean;
  next: {
    page?: number;
    companyIds?: string[] | null;
    buildingIds?: string[] | null;
    floorIds?: string[] | null;
    projectId?: string | null;
  };
};

export const buildAdminInventoryListHref = ({
  pathname,
  page,
  companyIds,
  buildingIds,
  floorIds,
  projectId,
  showBuildingFilter,
  showFloorFilter,
  next,
}: BuildInventoryListHrefParams): string => {
  const params = new URLSearchParams();
  const nextCompanyIds = next.companyIds === undefined ? companyIds : (next.companyIds ?? []);
  const nextBuildingIds =
    next.buildingIds === undefined ? buildingIds : (next.buildingIds ?? []);
  const nextFloorIds = next.floorIds === undefined ? floorIds : (next.floorIds ?? []);
  const nextProjectId = next.projectId === undefined ? projectId : next.projectId || undefined;
  const nextPage = next.page ?? page;

  const companyEncoded = encodeIntegratedFilterIds(nextCompanyIds);
  if (companyEncoded) {
    params.set('companyId', companyEncoded);
  }
  if (showBuildingFilter) {
    const buildingEncoded = encodeIntegratedFilterIds(nextBuildingIds);
    if (buildingEncoded) {
      params.set('buildingId', buildingEncoded);
    }
  }
  if (showFloorFilter) {
    const floorEncoded = encodeIntegratedFilterIds(nextFloorIds);
    if (floorEncoded) {
      params.set('floorId', floorEncoded);
    }
  }
  if (nextProjectId) {
    params.set('projectId', nextProjectId);
  }
  if (nextPage > 1) {
    params.set('page', String(nextPage));
  }
  const query = params.toString();
  return query.length > 0 ? `${pathname}?${query}` : pathname;
};
