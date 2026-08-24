'use client';

import type {
  InteractiveMappingApartmentSummary,
  InteractiveMappingBuildingSummary,
  InteractiveMappingCanvasSummary,
  InteractiveMappingDistrictSummary,
  InteractiveMappingFloorSummary,
} from '@toonexpo/contracts';
import {
  Box,
  Building2,
  Calendar,
  ChevronRight,
  Layers,
  Ruler,
} from 'lucide-react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';

import { resolvePublicAssetUrl } from '@/shared/lib/static-asset-url';
import { cn } from '@/shared/ui/cn';
import { LIST_CARD_LIFT_CLASS } from '@/shared/ui/motion';

import { mappingBuildingAccentTone } from './mapping-building-accent-tones';
import { formatMappingRelativeUpdated } from '../utils/format-mapping-relative-updated';
import { resolveMappingBuildingPickerStats } from '../utils/mapping-building-picker-stats';

const BUILDING_INDEX_PAD = 2;
const BUILDING_THUMB_WIDTH = 96;
const BUILDING_THUMB_HEIGHT = 72;

export type MappingBuildingPickerCardsProps = {
  buildings: InteractiveMappingBuildingSummary[];
  districts: InteractiveMappingDistrictSummary[];
  floors: InteractiveMappingFloorSummary[];
  canvases: InteractiveMappingCanvasSummary[];
  apartments?: InteractiveMappingApartmentSummary[] | undefined;
  selectedBuildingId: string | null;
  title: string;
  emptyLabel: string;
  onSelectBuilding: (buildingId: string) => void;
};

const districtName = (
  districts: InteractiveMappingDistrictSummary[],
  districtId: string | null,
): string => districts.find((district) => district.id === districtId)?.name ?? '—';

const formatBuildingIndex = (index: number): string =>
  String(index + 1).padStart(BUILDING_INDEX_PAD, '0');

type MappingBuildingStatChipProps = {
  icon: ReactNode;
  label: string;
  iconClass: string;
};

const MappingBuildingStatChip = ({ icon, label, iconClass }: MappingBuildingStatChipProps) => (
  <div className="inline-flex min-w-0 items-center gap-2 rounded-sm border border-border bg-surface-elevated px-2.5 py-2">
    <span className={cn('shrink-0', iconClass)} aria-hidden>
      {icon}
    </span>
    <span className="truncate text-xs text-ink-secondary">{label}</span>
  </div>
);

/**
 * Rich building cards for interactive-mapping phase pickers (floors, apartments).
 */
export const MappingBuildingPickerCards = ({
  buildings,
  districts,
  floors,
  canvases,
  apartments = [],
  selectedBuildingId,
  title,
  emptyLabel,
  onSelectBuilding,
}: MappingBuildingPickerCardsProps) => {
  const t = useTranslations('Admin.interactiveMapping.forms.buildingPicker');

  const sorted = [...buildings].sort((a, b) => {
    const byDistrict = districtName(districts, a.districtId).localeCompare(
      districtName(districts, b.districtId),
    );
    return byDistrict !== 0 ? byDistrict : a.name.localeCompare(b.name);
  });

  return (
    <section className="rounded-lg border border-border bg-surface-elevated p-4 shadow-xs sm:p-5">
      <header className="mb-4 flex items-center gap-2">
        <Building2 className="size-4 text-brand" aria-hidden />
        <h3 className="text-sm font-semibold text-ink">{title}</h3>
      </header>

      {sorted.length === 0 ? (
        <p className="text-sm text-ink-muted">{emptyLabel}</p>
      ) : (
        <ul className="space-y-3">
          {sorted.map((building, index) => {
            const tone = mappingBuildingAccentTone(index);
            const stats = resolveMappingBuildingPickerStats(
              building.id,
              floors,
              canvases,
              apartments,
            );
            const selected = building.id === selectedBuildingId;
            const renderSrc = resolvePublicAssetUrl(stats.renderUrl);
            const lastUpdated = formatMappingRelativeUpdated(stats.updatedAt, {
              unknown: t('lastUpdatedUnknown'),
              today: t('lastUpdatedToday'),
              daysAgo: (count) => t('lastUpdatedDaysAgo', { count }),
            });

            return (
              <li key={building.id}>
                <button
                  type="button"
                  className={cn(
                    'flex w-full flex-col overflow-hidden rounded-lg border border-border bg-surface-elevated text-left transition-colors hover:border-border-strong sm:flex-row sm:items-stretch',
                    LIST_CARD_LIFT_CLASS,
                    selected && 'border-border-strong ring-1 ring-border-strong',
                  )}
                  onClick={() => {
                    onSelectBuilding(building.id);
                  }}
                >
                  <div className="flex min-w-0 sm:shrink-0">
                    <div
                      className={cn(
                        'flex w-[72px] shrink-0 flex-col items-center justify-center px-2 py-4 sm:w-20',
                        tone.indexPanelClass,
                      )}
                    >
                      <span
                        className={cn('font-display text-3xl leading-none', tone.indexTextClass)}
                      >
                        {formatBuildingIndex(index)}
                      </span>
                      <span className={cn('mt-1 text-[11px] font-medium', tone.indexTextClass)}>
                        {t('floorIndex')}
                      </span>
                    </div>

                    <div className="relative h-[72px] w-24 shrink-0 overflow-hidden border-l border-border sm:h-auto sm:min-h-[72px] sm:w-24">
                      {renderSrc ? (
                        <Image
                          src={renderSrc}
                          alt=""
                          width={BUILDING_THUMB_WIDTH}
                          height={BUILDING_THUMB_HEIGHT}
                          className="size-full object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="flex size-full items-center justify-center bg-surface">
                          <Building2 className="size-6 text-ink-muted/50" aria-hidden />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex min-w-0 flex-1 flex-col justify-center gap-2 px-4 py-3">
                    <div>
                      <p className="truncate text-sm font-semibold tracking-tight text-ink">
                        {building.name}
                      </p>
                      <p className="truncate text-sm text-ink-muted">
                        {districtName(districts, building.districtId)}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <MappingBuildingStatChip
                        icon={<Layers className="size-3.5" strokeWidth={2} />}
                        iconClass={tone.iconClass}
                        label={t('floorsMapped', { count: stats.floorsMapped })}
                      />
                      <MappingBuildingStatChip
                        icon={<Ruler className="size-3.5" strokeWidth={2} />}
                        iconClass={tone.iconClass}
                        label={t('totalArea', { area: Math.round(stats.totalAreaSqm) })}
                      />
                      <MappingBuildingStatChip
                        icon={<Box className="size-3.5" strokeWidth={2} />}
                        iconClass={tone.iconClass}
                        label={t('zones', { count: stats.zones })}
                      />
                      <MappingBuildingStatChip
                        icon={<Calendar className="size-3.5" strokeWidth={2} />}
                        iconClass={tone.iconClass}
                        label={`${lastUpdated} ${t('lastUpdated')}`}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end px-4 pb-4 sm:px-5 sm:pb-0 sm:pl-0">
                    <span
                      className={cn(
                        'inline-flex size-10 items-center justify-center rounded-full text-on-dark',
                        tone.actionButtonClass,
                      )}
                      aria-hidden
                    >
                      <ChevronRight className="size-5" strokeWidth={2.25} />
                    </span>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
};
