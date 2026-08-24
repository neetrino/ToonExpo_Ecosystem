'use client';

import type {
  InteractiveMappingApartmentSummary,
  InteractiveMappingBuildingSummary,
  InteractiveMappingCanvasSummary,
  InteractiveMappingDistrictSummary,
  InteractiveMappingFloorSummary,
} from '@toonexpo/contracts';

import { cn } from '@/shared/ui/cn';

import { MappingBuildingPickerCards } from './mapping-building-picker-cards';

export type MappingBuildingPickerVariant = 'list' | 'cards';

export type MappingBuildingPickerProps = {
  buildings: InteractiveMappingBuildingSummary[];
  districts: InteractiveMappingDistrictSummary[];
  floors: InteractiveMappingFloorSummary[];
  canvases?: InteractiveMappingCanvasSummary[] | undefined;
  apartments?: InteractiveMappingApartmentSummary[] | undefined;
  selectedBuildingId: string | null;
  title: string;
  emptyLabel: string;
  floorsMappedLabel: (values: { mapped: number; total: number }) => string;
  apartmentsCountLabel?: ((values: { count: number }) => string) | undefined;
  variant?: MappingBuildingPickerVariant | undefined;
  onSelectBuilding: (buildingId: string) => void;
};

const districtName = (
  districts: InteractiveMappingDistrictSummary[],
  districtId: string | null,
): string => districts.find((district) => district.id === districtId)?.name ?? '—';

const buildingFloorStats = (
  building: InteractiveMappingBuildingSummary,
  floors: InteractiveMappingFloorSummary[],
): { mapped: number; total: number } => {
  const buildingFloors = floors.filter((floor) => floor.buildingId === building.id);
  const mapped = buildingFloors.filter((floor) => floor.hasBuildingPolygon).length;
  const total = Math.max(buildingFloors.length, building.floorsCount ?? 0, mapped);
  return { mapped, total };
};

const MappingBuildingPickerList = ({
  buildings,
  districts,
  floors,
  apartments = [],
  selectedBuildingId,
  title,
  emptyLabel,
  floorsMappedLabel,
  apartmentsCountLabel,
  onSelectBuilding,
}: MappingBuildingPickerProps) => {
  const sorted = [...buildings].sort((a, b) => {
    const byDistrict = districtName(districts, a.districtId).localeCompare(
      districtName(districts, b.districtId),
    );
    return byDistrict !== 0 ? byDistrict : a.name.localeCompare(b.name);
  });

  return (
    <div className="space-y-2 rounded-sm border border-border bg-background p-3">
      <h3 className="text-sm font-semibold text-ink">{title}</h3>
      {sorted.length === 0 ? (
        <p className="text-sm text-ink-muted">{emptyLabel}</p>
      ) : (
        <ul className="divide-y divide-border border border-border">
          {sorted.map((building) => {
            const selected = building.id === selectedBuildingId;
            const stats = buildingFloorStats(building, floors);
            const districtLabel = districtName(districts, building.districtId);
            const apartmentCount = apartments.filter(
              (apartment) => apartment.buildingId === building.id,
            ).length;
            const trailingLabel = apartmentsCountLabel
              ? apartmentsCountLabel({ count: apartmentCount })
              : floorsMappedLabel(stats);

            return (
              <li key={building.id}>
                <button
                  type="button"
                  className={cn(
                    'flex w-full items-center justify-between gap-3 border-l-2 border-transparent px-3 py-2.5 text-left text-sm text-ink transition-colors hover:bg-surface',
                    selected && 'border-ink',
                  )}
                  onClick={() => {
                    onSelectBuilding(building.id);
                  }}
                >
                  <span className="min-w-0">
                    <span className="block truncate font-medium">{building.name}</span>
                    <span className="block truncate text-xs text-ink-muted">{districtLabel}</span>
                  </span>
                  <span className="shrink-0 text-xs text-ink-muted">{trailingLabel}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

/**
 * Lists project buildings so the user can pick which one to map.
 */
export const MappingBuildingPicker = ({
  variant = 'list',
  canvases = [],
  ...props
}: MappingBuildingPickerProps) => {
  if (variant === 'cards') {
    return (
      <MappingBuildingPickerCards
        buildings={props.buildings}
        districts={props.districts}
        floors={props.floors}
        canvases={canvases}
        apartments={props.apartments}
        selectedBuildingId={props.selectedBuildingId}
        title={props.title}
        emptyLabel={props.emptyLabel}
        onSelectBuilding={props.onSelectBuilding}
      />
    );
  }

  return <MappingBuildingPickerList {...props} />;
};
