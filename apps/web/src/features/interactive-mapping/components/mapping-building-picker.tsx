'use client';

import type {
  InteractiveMappingApartmentSummary,
  InteractiveMappingBuildingSummary,
  InteractiveMappingDistrictSummary,
  InteractiveMappingFloorSummary,
} from '@toonexpo/contracts';
import { Building2, ChevronRight, Layers } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';

import { cn } from '@/shared/ui/cn';
import { LIST_CARD_LIFT_CLASS } from '@/shared/ui/motion';
import { SearchField } from '@/shared/ui/search-field';

import { matchesMappingSearch } from '../utils/matches-mapping-search';

const BUILDING_INDEX_PAD = 2;

export type MappingBuildingPickerProps = {
  buildings: InteractiveMappingBuildingSummary[];
  districts: InteractiveMappingDistrictSummary[];
  floors: InteractiveMappingFloorSummary[];
  apartments?: InteractiveMappingApartmentSummary[] | undefined;
  selectedBuildingId: string | null;
  title: string;
  emptyLabel: string;
  floorsMappedLabel: (values: { mapped: number; total: number }) => string;
  apartmentsCountLabel?: ((values: { count: number }) => string) | undefined;
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

const formatBuildingIndex = (index: number): string =>
  String(index + 1).padStart(BUILDING_INDEX_PAD, '0');

/**
 * Building cards for interactive-mapping phase pickers — same chrome as district cards.
 */
export const MappingBuildingPicker = ({
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
  const t = useTranslations('Admin.interactiveMapping.forms');
  const tPicker = useTranslations('Admin.interactiveMapping.forms.buildingPicker');
  const [query, setQuery] = useState('');

  const sorted = useMemo(
    () =>
      [...buildings].sort((a, b) => {
        const byDistrict = districtName(districts, a.districtId).localeCompare(
          districtName(districts, b.districtId),
        );
        return byDistrict !== 0 ? byDistrict : a.name.localeCompare(b.name);
      }),
    [buildings, districts],
  );

  const filtered = useMemo(
    () =>
      sorted.filter((building) =>
        matchesMappingSearch(query, building.name, districtName(districts, building.districtId)),
      ),
    [districts, query, sorted],
  );

  return (
    <section className="w-full min-w-0 rounded-lg border border-border bg-surface-elevated p-4 shadow-xs sm:p-5">
      <header className="mb-4 flex items-center gap-2">
        <Building2 className="size-4 text-brand" aria-hidden />
        <h3 className="text-sm font-semibold text-ink">{title}</h3>
      </header>

      {buildings.length > 0 ? (
        <SearchField
          className="mb-4 w-full"
          value={query}
          placeholder={t('searchBuildings')}
          aria-label={t('searchBuildings')}
          onChange={(event) => {
            setQuery(event.target.value);
          }}
        />
      ) : null}

      {buildings.length === 0 ? (
        <p className="text-sm text-ink-muted">{emptyLabel}</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-ink-muted">{t('searchNoResults', { query })}</p>
      ) : (
        <ul className="w-full min-w-0 space-y-3">
          {filtered.map((building, index) => {
            const selected = building.id === selectedBuildingId;
            const stats = buildingFloorStats(building, floors);
            const districtLabel = districtName(districts, building.districtId);
            const apartmentCount = apartments.filter(
              (apartment) => apartment.buildingId === building.id,
            ).length;
            const metaLabel = apartmentsCountLabel
              ? apartmentsCountLabel({ count: apartmentCount })
              : floorsMappedLabel(stats);

            return (
              <li key={building.id} className="w-full min-w-0">
                <button
                  type="button"
                  className={cn(
                    'grid w-full min-w-0 grid-cols-[4.5rem_minmax(0,1fr)_auto] items-center overflow-hidden rounded-lg border border-border bg-surface-elevated text-left transition-colors hover:border-border-strong sm:grid-cols-[5rem_minmax(0,1fr)_auto]',
                    LIST_CARD_LIFT_CLASS,
                    selected && 'border-border-strong ring-1 ring-border-strong',
                  )}
                  onClick={() => {
                    onSelectBuilding(building.id);
                  }}
                >
                  <div className="flex h-full flex-col items-center justify-center bg-brand-soft px-2 py-4">
                    <span className="font-display text-3xl leading-none text-brand">
                      {formatBuildingIndex(index)}
                    </span>
                    <span className="mt-1 text-[11px] font-medium text-brand">
                      {tPicker('buildingIndex')}
                    </span>
                  </div>

                  <div className="min-w-0 px-4 py-3">
                    <p className="truncate text-sm font-semibold tracking-tight text-ink">
                      {building.name}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-ink-muted">{districtLabel}</p>
                    <p className="mt-1 flex min-w-0 items-center gap-1.5 text-xs text-ink-muted">
                      <Layers className="size-3.5 shrink-0 text-brand" aria-hidden />
                      <span className="truncate">{metaLabel}</span>
                    </p>
                  </div>

                  <span
                    className="mr-4 inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-brand text-on-dark sm:mr-5"
                    aria-hidden
                  >
                    <ChevronRight className="size-5" strokeWidth={2.25} />
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
};
